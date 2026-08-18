// Minimal MCP (Streamable HTTP) client used to talk to MetaTrader 5's built-in
// MCP server (Options -> MCP -> "Enable internal server").
//
// The terminal only listens on 127.0.0.1, so MT5_MCP_URL must point at a tunnel
// (Cloudflare Tunnel / ngrok / Caddy over HTTPS) that forwards to
// http://127.0.0.1:22346/mcp on the VPS running the terminal.

export class McpError extends Error {
  status: number;
  constructor(message: string, status = 502) {
    super(message);
    this.status = status;
  }
}

interface McpConfig {
  url: string;
  apiKey?: string;
}

export function mcpConfig(): McpConfig | null {
  const url = Deno.env.get("MT5_MCP_URL");
  if (!url) return null;
  return { url: url.replace(/\/+$/, ""), apiKey: Deno.env.get("MT5_MCP_API_KEY") ?? undefined };
}

let sessionId: string | null = null;
let toolCache: { name: string; description?: string }[] | null = null;

function headers(cfg: McpConfig): Record<string, string> {
  const h: Record<string, string> = {
    "Content-Type": "application/json",
    // Required by the MCP Streamable HTTP spec — servers 406 without it.
    "Accept": "application/json, text/event-stream",
  };
  if (cfg.apiKey) {
    h["Authorization"] = `Bearer ${cfg.apiKey}`;
    h["X-Api-Key"] = cfg.apiKey;
  }
  if (sessionId) h["Mcp-Session-Id"] = sessionId;
  return h;
}

/** Parses either a plain JSON body or an SSE stream containing one JSON-RPC message. */
function parseBody(contentType: string, text: string): any {
  if (contentType.includes("text/event-stream")) {
    const datas = text
      .split(/\r?\n/)
      .filter((l) => l.startsWith("data:"))
      .map((l) => l.slice(5).trim())
      .filter(Boolean);
    const last = datas[datas.length - 1];
    return last ? JSON.parse(last) : null;
  }
  return text ? JSON.parse(text) : null;
}

let nextId = 1;

async function rpc<T>(method: string, params?: unknown, timeoutMs = 20000): Promise<T> {
  const cfg = mcpConfig();
  if (!cfg) throw new McpError("MT5 MCP is not configured (MT5_MCP_URL missing).", 503);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(cfg.url, {
      method: "POST",
      headers: headers(cfg),
      body: JSON.stringify({ jsonrpc: "2.0", id: nextId++, method, params }),
      signal: controller.signal,
    });

    const sid = res.headers.get("Mcp-Session-Id");
    if (sid) sessionId = sid;

    const text = await res.text();
    if (!res.ok) {
      if (res.status === 404 || res.status === 400) sessionId = null; // stale session
      throw new McpError(
        `MT5 MCP server returned ${res.status}: ${text.slice(0, 300)}`,
        res.status === 401 || res.status === 403 ? 502 : res.status,
      );
    }

    const payload = parseBody(res.headers.get("content-type") ?? "", text);
    if (payload?.error) {
      throw new McpError(payload.error.message ?? "MCP error", 502);
    }
    return payload?.result as T;
  } catch (err) {
    if (err instanceof McpError) throw err;
    if ((err as Error).name === "AbortError") {
      throw new McpError("MT5 MCP server timed out — is the tunnel up and the terminal running?", 504);
    }
    throw new McpError(`Could not reach the MT5 MCP server: ${(err as Error).message}`, 502);
  } finally {
    clearTimeout(timer);
  }
}

async function ensureSession(): Promise<void> {
  if (sessionId) return;
  await rpc("initialize", {
    protocolVersion: "2025-06-18",
    capabilities: {},
    clientInfo: { name: "lovable-mt5", version: "1.0.0" },
  });
  // Notification; MT5 tolerates it over the same POST endpoint.
  try {
    const cfg = mcpConfig()!;
    await fetch(cfg.url, {
      method: "POST",
      headers: headers(cfg),
      body: JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized" }),
    });
  } catch {
    /* non-fatal */
  }
}

export async function listMcpTools(force = false) {
  if (toolCache && !force) return toolCache;
  await ensureSession();
  const result = await rpc<{ tools: { name: string; description?: string }[] }>("tools/list");
  toolCache = result?.tools ?? [];
  return toolCache;
}

/** Picks the first available tool whose name matches one of the candidates. */
export async function resolveTool(candidates: string[]): Promise<string> {
  const tools = await listMcpTools();
  const names = tools.map((t) => t.name);
  for (const c of candidates) {
    const exact = names.find((n) => n.toLowerCase() === c.toLowerCase());
    if (exact) return exact;
  }
  for (const c of candidates) {
    const loose = names.find((n) => n.toLowerCase().replace(/[_\-.]/g, "").includes(c.toLowerCase().replace(/[_\-.]/g, "")));
    if (loose) return loose;
  }
  throw new McpError(
    `MT5 MCP server exposes no tool matching ${candidates.join(", ")}. Available: ${names.join(", ") || "none"}`,
    501,
  );
}

/** Calls an MCP tool and returns its structured JSON result. */
export async function callMcpTool<T>(name: string, args: Record<string, unknown>, timeoutMs = 20000): Promise<T> {
  await ensureSession();
  const result = await rpc<any>("tools/call", { name, arguments: args }, timeoutMs);

  if (result?.isError) {
    const msg = result?.content?.map((c: any) => c.text).filter(Boolean).join(" ") ?? "MCP tool failed";
    throw new McpError(msg, 502);
  }
  if (result?.structuredContent) return result.structuredContent as T;

  const textPart = result?.content?.find((c: any) => c.type === "text")?.text;
  if (typeof textPart === "string") {
    try {
      return JSON.parse(textPart) as T;
    } catch {
      return { message: textPart } as unknown as T;
    }
  }
  return result as T;
}
