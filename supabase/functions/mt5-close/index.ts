import { z } from "https://esm.sh/zod@3.23.8";
import {
  BridgeError,
  BridgePosition,
  callBridge,
  corsHeaders,
  errorResponse,
  json,
  loadAccount,
  requireUser,
} from "../_shared/bridge.ts";

const BodySchema = z.object({
  accountId: z.string().uuid().optional(),
  /** close a single position, or every position when closeAll is true */
  ticket: z.string().min(1).max(32).optional(),
  closeAll: z.boolean().default(false),
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const auth = await requireUser(req);

    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) return errorResponse("Invalid request", 400);
    const { ticket, closeAll, accountId } = parsed.data;

    if (!ticket && !closeAll) return errorResponse("Provide a ticket or closeAll", 400);

    const account = await loadAccount(auth.admin, auth.userId, accountId);
    if (!account) return errorResponse("No connected MT5 account", 404);

    let tickets: string[] = ticket ? [ticket] : [];

    if (closeAll) {
      const result = await callBridge<{ positions: BridgePosition[] }>("/positions", {
        method: "POST",
        body: { login: account.login, server: account.server_name },
      });
      tickets = (result.positions ?? []).map((p) => String(p.ticket));
    }

    const closed: string[] = [];
    const failed: { ticket: string; error: string }[] = [];

    for (const t of tickets) {
      try {
        await callBridge("/close", {
          method: "POST",
          body: { login: account.login, server: account.server_name, ticket: t },
          timeoutMs: 25000,
        });
        closed.push(t);
        await auth.admin
          .from("mt5_orders")
          .update({ status: "closed", closed_at: new Date().toISOString() })
          .eq("user_id", auth.userId)
          .eq("ticket", t);
      } catch (err) {
        failed.push({ ticket: t, error: (err as Error).message });
      }
    }

    return json({ closed, failed });
  } catch (err) {
    if (err instanceof BridgeError) return errorResponse(err.message, err.status);
    console.error("mt5-close error", err);
    return errorResponse((err as Error).message ?? "Unexpected error", 500);
  }
});
