// Shared helpers for the MT5 trading edge functions.
// The bridge is a self-hosted service running next to a real MT5 terminal.
// See bridge/README.md in the repo root for how to run it.

import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

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
      "MT5 bridge is not configured. Add MT5_BRIDGE_URL and MT5_BRIDGE_KEY as secrets.",
      503,
    );
  }
  return { baseUrl: baseUrl.replace(/\/+$/, ""), key };
}

/** Calls the self-hosted MT5 bridge. Throws BridgeError on any failure. */
export async function callBridge<T>(
  path: string,
  init: { method?: string; body?: unknown; timeoutMs?: number } = {},
): Promise<T> {
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
