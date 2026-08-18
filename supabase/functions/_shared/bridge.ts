// Shared helpers for the MT5 trading edge functions.
// The bridge is a self-hosted service running next to a real MT5 terminal.
// See bridge/README.md in the repo root for how to run it.

import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { callMcpTool, listMcpTools, McpError, mcpConfig, resolveTool } from "./mcp.ts";

export { listMcpTools, mcpConfig };


export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

export function errorResponse(message: string, status = 400, extra: Record<string, unknown> = {}) {
  return json({ error: message, ...extra }, status);
}

export interface AuthContext {
  userId: string;
  admin: SupabaseClient;
}

/** Validates the caller's JWT and returns a service-role client for writes. */
export async function requireUser(req: Request): Promise<AuthContext | Response> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return errorResponse("Missing authorization header", 401);
  }

  const url = Deno.env.get("SUPABASE_URL")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  const authClient = createClient(url, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const { data, error } = await authClient.auth.getUser();
  if (error || !data.user) {
    return errorResponse("Invalid or expired session", 401);
  }

  return {
    userId: data.user.id,
    admin: createClient(url, serviceKey, { auth: { persistSession: false } }),
  };
}

export interface BridgeSymbolInfo {
  symbol: string;
  bid: number;
  ask: number;
  digits: number;
  point: number;
  tickValue: number;
  tickSize: number;
  contractSize: number;
  volumeMin: number;
  volumeMax: number;
  volumeStep: number;
  stopsLevel: number;
  tradeAllowed: boolean;
}

export interface BridgeAccountInfo {
  login: string;
  balance: number;
  equity: number;
  margin: number;
  freeMargin: number;
  marginLevel: number;
  currency: string;
  isDemo: boolean;
  server: string;
  leverage?: number;
}

export interface BridgePosition {
  ticket: string;
  symbol: string;
  type: "BUY" | "SELL";
  volume: number;
  openPrice: number;
  currentPrice: number;
  profit: number;
  stopLoss?: number;
  takeProfit?: number;
  openTime: string;
}

class BridgeError extends Error {
  status: number;
  retcode?: number;
  constructor(message: string, status = 502, retcode?: number) {
    super(message);
    this.status = status;
    this.retcode = retcode;
  }
}

export { BridgeError };

function bridgeConfig() {
  const baseUrl = Deno.env.get("MT5_BRIDGE_URL");
  const key = Deno.env.get("MT5_BRIDGE_KEY");
  if (!baseUrl || !key) {
    throw new BridgeError(
      "No MT5 backend configured. Either set MT5_MCP_URL (MetaTrader 5 built-in MCP server) " +
        "or MT5_BRIDGE_URL + MT5_BRIDGE_KEY (self-hosted bridge).",
      503,
    );
  }
  return { baseUrl: baseUrl.replace(/\/+$/, ""), key };
}

/**
 * Calls the MT5 backend. When MT5_MCP_URL is set we speak MCP to MetaTrader 5's
 * built-in server; otherwise we fall back to the self-hosted REST bridge.
 * Throws BridgeError on any failure.
 */
export async function callBridge<T>(
  path: string,
  init: { method?: string; body?: unknown; timeoutMs?: number } = {},
): Promise<T> {
  if (mcpConfig()) {
    try {
      return await callViaMcp<T>(path, (init.body ?? {}) as Record<string, unknown>, init.timeoutMs);
    } catch (err) {
      if (err instanceof McpError) throw new BridgeError(err.message, err.status);
      throw err;
    }
  }

  const { baseUrl, key } = bridgeConfig();

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), init.timeoutMs ?? 15000);

  try {
    const res = await fetch(`${baseUrl}${path}`, {
      method: init.method ?? "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Bridge-Key": key,
      },
      body: init.body ? JSON.stringify(init.body) : undefined,
      signal: controller.signal,
    });

    const text = await res.text();
    let payload: any = null;
    try {
      payload = text ? JSON.parse(text) : null;
    } catch {
      payload = { message: text };
    }

    if (!res.ok) {
      throw new BridgeError(
        payload?.error || payload?.detail || payload?.message || `Bridge returned ${res.status}`,
        res.status === 401 || res.status === 403 ? 502 : res.status,
        payload?.retcode,
      );
    }

    return payload as T;
  } catch (err) {
    if (err instanceof BridgeError) throw err;
    if ((err as Error).name === "AbortError") {
      throw new BridgeError("MT5 bridge timed out — is your VPS reachable?", 504);
    }
    throw new BridgeError(
      `Could not reach the MT5 bridge: ${(err as Error).message}`,
      502,
    );
  }
}

/** Applies the broker-specific symbol suffix, e.g. EURUSD -> EURUSD.m */
export function brokerSymbol(symbol: string, suffix: string | null | undefined): string {
  const clean = (suffix ?? "").trim();
  if (!clean) return symbol;
  return symbol.endsWith(clean) ? symbol : `${symbol}${clean}`;
}

/** Strips the suffix again so the UI keeps showing canonical symbols. */
export function canonicalSymbol(symbol: string, suffix: string | null | undefined): string {
  const clean = (suffix ?? "").trim();
  if (clean && symbol.endsWith(clean)) return symbol.slice(0, -clean.length);
  return symbol;
}

/** Rounds a lot size down to a valid volume step and clamps to broker limits. */
export function normalizeVolume(volume: number, info: BridgeSymbolInfo): number {
  const step = info.volumeStep > 0 ? info.volumeStep : 0.01;
  const stepped = Math.floor(volume / step) * step;
  const decimals = (step.toString().split(".")[1] || "").length;
  const rounded = Number(stepped.toFixed(decimals));
  if (rounded < info.volumeMin) return 0;
  return Math.min(rounded, info.volumeMax);
}

/**
 * Real lot sizing from broker symbol specs.
 * riskAmount is in account currency; stopDistance in price units.
 */
export function lotSizeFromRisk(
  riskAmount: number,
  stopDistance: number,
  info: BridgeSymbolInfo,
): number {
  if (stopDistance <= 0 || riskAmount <= 0) return 0;
  if (info.tickSize <= 0 || info.tickValue <= 0) return 0;

  // Loss per 1.00 lot if price moves stopDistance against us.
  const ticks = stopDistance / info.tickSize;
  const lossPerLot = ticks * info.tickValue;
  if (lossPerLot <= 0) return 0;

  return riskAmount / lossPerLot;
}

export interface Mt5AccountRow {
  id: string;
  user_id: string;
  label: string;
  login: string;
  server_name: string;
  is_demo: boolean;
  symbol_suffix: string;
  is_active: boolean;
}

/** Loads the caller's account row, defaulting to their active account. */
export async function loadAccount(
  admin: SupabaseClient,
  userId: string,
  accountId?: string | null,
): Promise<Mt5AccountRow | null> {
  let query = admin
    .from("mt5_accounts")
    .select("id, user_id, label, login, server_name, is_demo, symbol_suffix, is_active")
    .eq("user_id", userId);

  if (accountId) {
    query = query.eq("id", accountId);
  } else {
    query = query.eq("is_active", true);
  }

  const { data, error } = await query
    .order("last_connected_at", { ascending: false, nullsFirst: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data as Mt5AccountRow | null) ?? null;
}

// ---------------------------------------------------------------------------
// MCP mode: translate the bridge's REST contract into MetaTrader 5 MCP tools.
// Tool names differ between MT5 builds, so we resolve them from tools/list.
// ---------------------------------------------------------------------------

const num = (...vals: unknown[]): number => {
  for (const v of vals) {
    const n = typeof v === "string" ? Number(v) : (v as number);
    if (typeof n === "number" && Number.isFinite(n)) return n;
  }
  return 0;
};

const pick = <T>(obj: any, keys: string[], fallback?: T): T | undefined => {
  for (const k of keys) {
    if (obj && obj[k] !== undefined && obj[k] !== null) return obj[k] as T;
  }
  return fallback;
};

function unwrap(res: any, keys: string[]): any {
  if (Array.isArray(res)) return res;
  for (const k of keys) {
    if (res && res[k] !== undefined) return res[k];
  }
  return res;
}

function normalizeAccount(raw: any): BridgeAccountInfo {
  const a = unwrap(raw, ["account", "account_info", "result", "data"]) ?? {};
  const tradeMode = pick<any>(a, ["trade_mode", "tradeMode"]);
  return {
    login: String(pick<any>(a, ["login", "account", "account_id"]) ?? ""),
    balance: num(pick(a, ["balance"])),
    equity: num(pick(a, ["equity"])),
    margin: num(pick(a, ["margin"])),
    freeMargin: num(pick(a, ["margin_free", "freeMargin", "free_margin"])),
    marginLevel: num(pick(a, ["margin_level", "marginLevel"])),
    currency: String(pick<any>(a, ["currency"]) ?? "USD"),
    isDemo:
      typeof pick(a, ["isDemo", "is_demo"]) === "boolean"
        ? (pick(a, ["isDemo", "is_demo"]) as boolean)
        : String(tradeMode ?? "").toLowerCase().includes("demo") || tradeMode === 0,
    server: String(pick<any>(a, ["server", "server_name"]) ?? ""),
    leverage: num(pick(a, ["leverage"])) || undefined,
  };
}

function normalizePosition(p: any): BridgePosition {
  const rawType = pick<any>(p, ["type", "side", "direction"]);
  const type =
    typeof rawType === "number"
      ? rawType === 0 ? "BUY" : "SELL"
      : String(rawType ?? "").toUpperCase().includes("SELL") ? "SELL" : "BUY";
  return {
    ticket: String(pick<any>(p, ["ticket", "id", "position_id"]) ?? ""),
    symbol: String(pick<any>(p, ["symbol"]) ?? ""),
    type: type as "BUY" | "SELL",
    volume: num(pick(p, ["volume", "lots", "size"])),
    openPrice: num(pick(p, ["price_open", "openPrice", "open_price"])),
    currentPrice: num(pick(p, ["price_current", "currentPrice", "current_price"])),
    profit: num(pick(p, ["profit", "pnl"])),
    stopLoss: num(pick(p, ["sl", "stopLoss", "stop_loss"])) || undefined,
    takeProfit: num(pick(p, ["tp", "takeProfit", "take_profit"])) || undefined,
    openTime: String(pick<any>(p, ["time", "openTime", "open_time"]) ?? new Date().toISOString()),
  };
}

function normalizeSymbol(raw: any, requested: string): BridgeSymbolInfo {
  const s = unwrap(raw, ["symbol_info", "symbolInfo", "info", "result", "data"]) ?? {};
  const tick = unwrap(raw, ["tick"]) ?? s;
  const point = num(pick(s, ["point"])) || 0.00001;
  return {
    symbol: String(pick<any>(s, ["symbol", "name"]) ?? requested),
    bid: num(pick(tick, ["bid"]), pick(s, ["bid"])),
    ask: num(pick(tick, ["ask"]), pick(s, ["ask"])),
    digits: num(pick(s, ["digits"])) || 5,
    point,
    tickValue: num(pick(s, ["trade_tick_value", "tickValue", "tick_value"])),
    tickSize: num(pick(s, ["trade_tick_size", "tickSize", "tick_size"])) || point,
    contractSize: num(pick(s, ["trade_contract_size", "contractSize", "contract_size"])) || 100000,
    volumeMin: num(pick(s, ["volume_min", "volumeMin"])) || 0.01,
    volumeMax: num(pick(s, ["volume_max", "volumeMax"])) || 100,
    volumeStep: num(pick(s, ["volume_step", "volumeStep"])) || 0.01,
    stopsLevel: num(pick(s, ["trade_stops_level", "stopsLevel", "stops_level"])),
    tradeAllowed: pick<boolean>(s, ["tradeAllowed", "trade_allowed"]) ?? true,
  };
}

async function callViaMcp<T>(
  path: string,
  body: Record<string, unknown>,
  timeoutMs?: number,
): Promise<T> {
  switch (path) {
    case "/account": {
      const tool = await resolveTool(["account_info", "get_account_info", "accountInfo", "account"]);
      return normalizeAccount(await callMcpTool<any>(tool, {}, timeoutMs)) as unknown as T;
    }
    case "/positions": {
      const tool = await resolveTool(["positions_get", "get_positions", "positions"]);
      const res = await callMcpTool<any>(tool, {}, timeoutMs);
      const list = unwrap(res, ["positions", "result", "data"]) ?? [];
      return { positions: (Array.isArray(list) ? list : []).map(normalizePosition) } as unknown as T;
    }
    case "/symbol": {
      const symbol = String(body.symbol ?? "");
      const tool = await resolveTool(["symbol_info", "get_symbol_info", "symbolInfo", "symbol"]);
      const info = await callMcpTool<any>(tool, { symbol }, timeoutMs);
      let merged = info;
      try {
        const tickTool = await resolveTool(["symbol_info_tick", "get_tick", "tick"]);
        merged = { ...info, tick: unwrap(await callMcpTool<any>(tickTool, { symbol }, timeoutMs), ["tick", "result", "data"]) };
      } catch {
        /* some builds return bid/ask on symbol_info already */
      }
      return normalizeSymbol(merged, symbol) as unknown as T;
    }
    case "/order": {
      const tool = await resolveTool(["order_send", "place_order", "trade_open", "order"]);
      const side = String(body.side ?? "BUY").toUpperCase();
      const res: any = await callMcpTool<any>(
        tool,
        {
          symbol: body.symbol,
          action: side === "SELL" ? "SELL" : "BUY",
          type: side === "SELL" ? "SELL" : "BUY",
          volume: body.volume,
          price: body.price,
          sl: body.stopLoss ?? 0,
          stop_loss: body.stopLoss ?? 0,
          tp: body.takeProfit ?? 0,
          take_profit: body.takeProfit ?? 0,
          deviation: body.deviationPoints ?? 20,
          comment: body.comment ?? "lovable",
          magic: body.magic ?? 0,
        },
        timeoutMs ?? 30000,
      );
      const r = unwrap(res, ["order", "result", "data"]) ?? {};
      const retcode = num(pick(r, ["retcode", "return_code"]));
      if (retcode && retcode !== 10009) {
        throw new McpError(
          `MT5 rejected the order (retcode ${retcode}${pick(r, ["comment"]) ? `: ${pick(r, ["comment"])}` : ""})`,
          502,
        );
      }
      return {
        ticket: String(pick<any>(r, ["order", "ticket", "deal", "position"]) ?? ""),
        fillPrice: num(pick(r, ["price", "fillPrice", "fill_price"]), body.price),
        retcode,
        comment: pick<string>(r, ["comment"]) ?? "",
      } as unknown as T;
    }
    case "/close": {
      const tool = await resolveTool(["position_close", "close_position", "trade_close", "close"]);
      const res: any = await callMcpTool<any>(
        tool,
        { ticket: body.ticket, position: body.ticket, position_id: body.ticket },
        timeoutMs ?? 30000,
      );
      const r = unwrap(res, ["result", "data"]) ?? {};
      const retcode = num(pick(r, ["retcode", "return_code"]));
      if (retcode && retcode !== 10009) {
        throw new McpError(`MT5 could not close ticket ${body.ticket} (retcode ${retcode})`, 502);
      }
      return { ticket: String(body.ticket ?? ""), retcode } as unknown as T;
    }
    default:
      throw new McpError(`Unsupported MT5 operation ${path}`, 501);
  }
}
