import { z } from "https://esm.sh/zod@3.23.8";
import {
  BridgeAccountInfo,
  BridgeError,
  callBridge,
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

    const info = await callBridge<BridgeAccountInfo>("/account", {
      method: "POST",
      body: { login: account.login, server: account.server_name },
    });

    return json({ account, accountInfo: info });
  } catch (err) {
    if (err instanceof BridgeError) return errorResponse(err.message, err.status);
    console.error("mt5-account error", err);
    return errorResponse((err as Error).message ?? "Unexpected error", 500);
  }
});
