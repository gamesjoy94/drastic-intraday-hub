import { z } from "https://esm.sh/zod@3.23.8";
import {
  BridgeAccountInfo,
  BridgeError,
  callBridge,
  corsHeaders,
  errorResponse,
  json,
  requireUser,
} from "../_shared/bridge.ts";

const BodySchema = z.object({
  label: z.string().min(1).max(64),
  login: z.string().min(1).max(32),
  serverName: z.string().min(1).max(120),
  isDemo: z.boolean(),
  symbolSuffix: z.string().max(16).default(""),
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const auth = await requireUser(req);

    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return errorResponse("Invalid request", 400, {
        fields: parsed.error.flatten().fieldErrors,
      });
    }
    const { label, login, serverName, isDemo, symbolSuffix } = parsed.data;

    // The bridge owns the MT5 credentials locally. We only verify that the
    // terminal it controls is the account the user says it is.
    const info = await callBridge<BridgeAccountInfo>("/account", {
      method: "POST",
      body: { login, server: serverName },
      timeoutMs: 20000,
    });

    if (String(info.login) !== String(login)) {
      return errorResponse(
        `The bridge is logged into account ${info.login}, not ${login}. Check the terminal on your VPS.`,
        409,
      );
    }

    if (info.isDemo !== isDemo) {
      return errorResponse(
        `Account ${login} is a ${info.isDemo ? "demo" : "LIVE"} account, but you selected ${isDemo ? "demo" : "live"}. Refusing to connect.`,
        409,
      );
    }

    const { data, error } = await auth.admin
      .from("mt5_accounts")
      .upsert(
        {
          user_id: auth.userId,
          label,
          login,
          server_name: serverName,
          is_demo: info.isDemo,
          symbol_suffix: symbolSuffix,
          is_active: true,
          last_connected_at: new Date().toISOString(),
        },
        { onConflict: "user_id,login,server_name" },
      )
      .select("id, label, login, server_name, is_demo, symbol_suffix")
      .single();

    if (error) return errorResponse(error.message, 500);

    // Only one active account at a time.
    await auth.admin
      .from("mt5_accounts")
      .update({ is_active: false })
      .eq("user_id", auth.userId)
      .neq("id", data.id);

    // Make sure risk settings exist.
    await auth.admin
      .from("mt5_risk_settings")
      .upsert({ user_id: auth.userId }, { onConflict: "user_id" });

    return json({ account: data, accountInfo: info });
  } catch (err) {
    if (err instanceof BridgeError) return errorResponse(err.message, err.status);
    console.error("mt5-connect error", err);
    return errorResponse((err as Error).message ?? "Unexpected error", 500);
  }
});
