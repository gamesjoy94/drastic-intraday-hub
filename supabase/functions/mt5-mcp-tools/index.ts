// Diagnostic: lists the tools MetaTrader 5's built-in MCP server exposes, so the
// bridge layer can be mapped to the exact tool names of your MT5 build.
import { corsHeaders, errorResponse, json, listMcpTools, mcpConfig, requireUser } from "../_shared/bridge.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const auth = await requireUser(req);

    if (!mcpConfig()) {
      return errorResponse("MT5_MCP_URL is not set — MCP mode is off (using the REST bridge).", 503);
    }

    const tools = await listMcpTools(true);
    return json({ mode: "mcp", count: tools.length, tools });
  } catch (err) {
    console.error("mt5-mcp-tools error", err);
    return errorResponse((err as Error).message ?? "Unexpected error", 502);
  }
});
