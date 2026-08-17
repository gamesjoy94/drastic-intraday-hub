import { BridgeAccountInfo, BridgeError, callBridge, corsHeaders, errorResponse, json, loadAccount, requireUser } from "../_shared/bridge.ts";
import { callMcp } from "../../bridge/mcpProxyClient.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const auth = await requireUser(req);
    if (auth instanceof Response) return auth;

    const raw = req.method === "POST" ? await req.json().catch(() => ({})) : {};
    const parsed = raw; // body already parsed above

    const account = await loadAccount(auth.admin, auth.userId, parsed.accountId);
    if (!account) return errorResponse("No connected MT5 account", 404);

    // Call MCP via server-side proxy helper
    const info = await callMcp('account', { login: account.login, server: account.server_name });

    return json({ account, accountInfo: info });
  } catch (err) {
    if (err instanceof BridgeError) return errorResponse(err.message, err.status);
    console.error("mt5-account error", err);
    return errorResponse((err as Error).message ?? "Unexpected error", 500);
  }
});
