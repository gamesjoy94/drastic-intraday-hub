import { z } from "https://esm.sh/zod@3.23.8";
import {
  BridgeError,
  BridgePosition,
  callBridge,
  canonicalSymbol,
  corsHeaders,
  errorResponse,
  json,
  loadAccount,
  requireUser,
} from "../_shared/bridge.ts";

const BodySchema = z.object({ accountId: z.string().uuid().optional() });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const auth = await requireUser(req);
    if (auth instanceof Response) return auth;

    const raw = req.method === "POST" ? await req.json().catch(() => ({})) : {};
    const parsed = BodySchema.safeParse(raw);
    if (!parsed.success) return errorResponse("Invalid request", 400);

    const account = await loadAccount(auth.admin, auth.userId, parsed.data.accountId);
    if (!account) return errorResponse("No connected MT5 account", 404);

    const result = await callBridge<{ positions: BridgePosition[] }>("/positions", {
      method: "POST",
      body: { login: account.login, server: account.server_name },
    });

    const positions = (result.positions ?? []).map((p) => ({
      ...p,
      ticket: String(p.ticket),
      symbol: canonicalSymbol(p.symbol, account.symbol_suffix),
    }));

    return json({ positions });
  } catch (err) {
    if (err instanceof BridgeError) return errorResponse(err.message, err.status);
    console.error("mt5-positions error", err);
    return errorResponse((err as Error).message ?? "Unexpected error", 500);
  }
});
