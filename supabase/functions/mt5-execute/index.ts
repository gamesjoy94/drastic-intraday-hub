import { z } from "https://esm.sh/zod@3.23.8";
import {
  BridgeAccountInfo,
  BridgeError,
  BridgePosition,
  BridgeSymbolInfo,
  brokerSymbol,
  callBridge,
  corsHeaders,
  errorResponse,
  json,
  loadAccount,
  lotSizeFromRisk,
  normalizeVolume,
  requireUser,
} from "../_shared/bridge.ts";

const BodySchema = z.object({
  accountId: z.string().uuid().optional(),
  symbol: z.string().min(3).max(20),
  direction: z.string().min(1).max(10),
  entry: z.number().positive(),
  stopLoss: z.number().nonnegative().optional(),
  takeProfit: z.number().nonnegative().optional(),
  confidence: z.number().min(0).max(100),
  currentPrice: z.number().positive().optional(),
  dedupeKey: z.string().min(1).max(128),
  /** true when the user clicked through the confirmation dialog */
  confirmed: z.boolean().default(false),
  /** dry run: return the computed order without sending it */
  preview: z.boolean().default(false),
});

type Body = z.infer<typeof BodySchema>;

const BUY_WORDS = ["BUY", "LONG", "BULLISH"];
const SELL_WORDS = ["SELL", "SHORT", "BEARISH"];

function toSide(direction: string): "BUY" | "SELL" | null {
  const d = direction.trim().toUpperCase();
  if (BUY_WORDS.some((w) => d.includes(w))) return "BUY";
  if (SELL_WORDS.some((w) => d.includes(w))) return "SELL";
  return null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  let body: Body;
  try {
    const auth = await requireUser(req);
    if (auth instanceof Response) return auth;

    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return errorResponse("Invalid request", 400, {
        fields: parsed.error.flatten().fieldErrors,
      });
    }
    body = parsed.data;

    const { admin, userId } = auth;

    const reject = async (reason: string, status = 422) => {
      if (!body.preview) {
        await admin.from("mt5_signals").upsert(
          {
            user_id: userId,
            dedupe_key: body.dedupeKey,
            symbol: body.symbol,
            direction: body.direction,
            entry: body.entry,
            stop_loss: body.stopLoss ?? null,
            take_profit: body.takeProfit ?? null,
            confidence: body.confidence,
            current_price: body.currentPrice ?? null,
            executed: false,
            reason,
          },
          { onConflict: "user_id,dedupe_key", ignoreDuplicates: true },
        );
      }
      return errorResponse(reason, status, { executed: false });
    };

    // ---- account + settings -------------------------------------------------
    const account = await loadAccount(admin, userId, body.accountId);
    if (!account) return await reject("No connected MT5 account", 404);

    const { data: settings } = await admin
      .from("mt5_risk_settings")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (!settings) return await reject("Risk settings not initialised", 409);

    if (settings.kill_switch_engaged) {
      return await reject("Kill switch is engaged — no orders can be placed");
    }

    // Manual confirmation is mandatory for live accounts, and for demo
    // accounts whenever the user has require_manual_confirm on.
    const needsConfirm = !account.is_demo || settings.require_manual_confirm;
    if (needsConfirm && !body.confirmed && !body.preview) {
      return await reject("Manual confirmation required for this order", 428);
    }

    // ---- signal-level validation (mirrors the client, authoritative here) ---
    const side = toSide(body.direction);
    if (!side) return await reject(`No actionable direction: "${body.direction}"`);

    if (body.confidence < settings.min_confidence) {
      return await reject(
        `Confidence too low: ${body.confidence}% < ${settings.min_confidence}%`,
      );
    }

    if (!settings.allowed_symbols.includes(body.symbol)) {
      return await reject(`Symbol ${body.symbol} is not in your allowed list`);
    }

    if (settings.use_stop_loss && !body.stopLoss) {
      return await reject("Stop loss is required by your risk settings");
    }
    if (settings.use_take_profit && !body.takeProfit) {
      return await reject("Take profit is required by your risk settings");
    }

    // ---- duplicate protection ----------------------------------------------
    if (!body.preview) {
      const { data: existing } = await admin
        .from("mt5_signals")
        .select("id, executed")
        .eq("user_id", userId)
        .eq("dedupe_key", body.dedupeKey)
        .maybeSingle();
      if (existing?.executed) {
        return errorResponse("This signal has already been executed", 409, {
          executed: false,
        });
      }
    }

    // ---- live broker state --------------------------------------------------
    const symbol = brokerSymbol(body.symbol, account.symbol_suffix);

    const [accountInfo, positionsResult, symbolInfo] = await Promise.all([
      callBridge<BridgeAccountInfo>("/account", {
        method: "POST",
        body: { login: account.login, server: account.server_name },
      }),
      callBridge<{ positions: BridgePosition[] }>("/positions", {
        method: "POST",
        body: { login: account.login, server: account.server_name },
      }),
      callBridge<BridgeSymbolInfo>("/symbol", {
        method: "POST",
        body: { login: account.login, server: account.server_name, symbol },
      }),
    ]);

    const openPositions = positionsResult.positions ?? [];
    if (openPositions.length >= settings.max_open_positions) {
      return await reject(
        `Maximum open positions reached (${settings.max_open_positions})`,
      );
    }

    if (!symbolInfo.tradeAllowed) {
      return await reject(`Trading is currently closed for ${symbol}`);
    }

    // ---- price staleness / slippage ----------------------------------------
    const marketPrice = side === "BUY" ? symbolInfo.ask : symbolInfo.bid;
    const drift = Math.abs(body.entry - marketPrice);
    const maxDrift = marketPrice * (Number(settings.max_slippage_percentage) / 100);
    if (drift > maxDrift) {
      return await reject(
        `Price moved too far from the signal entry (${drift.toFixed(symbolInfo.digits)} > ${maxDrift.toFixed(symbolInfo.digits)})`,
      );
    }

    // ---- direction sanity on SL/TP -----------------------------------------
    if (body.stopLoss) {
      const slWrong = side === "BUY"
        ? body.stopLoss >= marketPrice
        : body.stopLoss <= marketPrice;
      if (slWrong) return await reject("Stop loss is on the wrong side of the market price");
    }
    if (body.takeProfit) {
      const tpWrong = side === "BUY"
        ? body.takeProfit <= marketPrice
        : body.takeProfit >= marketPrice;
      if (tpWrong) return await reject("Take profit is on the wrong side of the market price");
    }

    // Broker minimum stop distance.
    const minStopDistance = symbolInfo.stopsLevel * symbolInfo.point;
    if (body.stopLoss && Math.abs(marketPrice - body.stopLoss) < minStopDistance) {
      return await reject(
        `Stop loss is closer than the broker minimum (${minStopDistance.toFixed(symbolInfo.digits)})`,
      );
    }

    // ---- position sizing from real symbol specs -----------------------------
    const stopDistance = body.stopLoss
      ? Math.abs(marketPrice - body.stopLoss)
      : 0;

    if (!stopDistance) {
      return await reject("Cannot size a position without a stop loss");
    }

    const riskAmount = accountInfo.balance * (Number(settings.max_risk_percentage) / 100);
    const rawLots = lotSizeFromRisk(riskAmount, stopDistance, symbolInfo);
    const cappedLots = Math.min(rawLots, Number(settings.max_position_size));
    const volume = normalizeVolume(cappedLots, symbolInfo);

    if (volume <= 0) {
      return await reject(
        `Computed lot size (${rawLots.toFixed(4)}) is below the broker minimum of ${symbolInfo.volumeMin}`,
      );
    }

    const estimatedRisk = (stopDistance / symbolInfo.tickSize) * symbolInfo.tickValue * volume;

    const plan = {
      accountId: account.id,
      accountLabel: account.label,
      isDemo: account.is_demo,
      symbol: body.symbol,
      brokerSymbol: symbol,
      side,
      volume,
      marketPrice,
      stopLoss: settings.use_stop_loss ? body.stopLoss ?? null : null,
      takeProfit: settings.use_take_profit ? body.takeProfit ?? null : null,
      estimatedRisk,
      currency: accountInfo.currency,
      digits: symbolInfo.digits,
      requiresConfirmation: needsConfirm,
    };

    if (body.preview) {
      return json({ preview: true, plan });
    }

    // ---- record the signal, then send the order -----------------------------
    const { data: signalRow } = await admin
      .from("mt5_signals")
      .upsert(
        {
          user_id: userId,
          account_id: account.id,
          dedupe_key: body.dedupeKey,
          symbol: body.symbol,
          direction: side,
          entry: body.entry,
          stop_loss: plan.stopLoss,
          take_profit: plan.takeProfit,
          confidence: body.confidence,
          current_price: marketPrice,
          executed: false,
          reason: "Submitting to broker",
        },
        { onConflict: "user_id,dedupe_key" },
      )
      .select("id")
      .single();

    const { data: orderRow } = await admin
      .from("mt5_orders")
      .insert({
        user_id: userId,
        account_id: account.id,
        signal_id: signalRow?.id ?? null,
        symbol: body.symbol,
        side,
        volume,
        requested_price: marketPrice,
        stop_loss: plan.stopLoss,
        take_profit: plan.takeProfit,
        status: "pending",
      })
      .select("id")
      .single();

    try {
      const result = await callBridge<{
        ticket: string;
        fillPrice: number;
        retcode: number;
        comment?: string;
      }>("/order", {
        method: "POST",
        body: {
          login: account.login,
          server: account.server_name,
          symbol,
          side,
          volume,
          price: marketPrice,
          stopLoss: plan.stopLoss,
          takeProfit: plan.takeProfit,
          deviationPoints: Math.max(
            5,
            Math.round(maxDrift / (symbolInfo.point || 0.00001)),
          ),
          comment: `AI_${body.confidence}`,
          magic: 771205,
        },
        timeoutMs: 25000,
      });

      await admin
        .from("mt5_orders")
        .update({
          ticket: String(result.ticket),
          fill_price: result.fillPrice,
          retcode: result.retcode,
          status: "filled",
        })
        .eq("id", orderRow?.id ?? "");

      await admin
        .from("mt5_signals")
        .update({ executed: true, reason: "Executed" })
        .eq("id", signalRow?.id ?? "");

      return json({ executed: true, plan, order: result });
    } catch (err) {
      const message = err instanceof BridgeError ? err.message : (err as Error).message;
      const retcode = err instanceof BridgeError ? err.retcode ?? null : null;

      await admin
        .from("mt5_orders")
        .update({ status: "rejected", error: message, retcode })
        .eq("id", orderRow?.id ?? "");

      await admin
        .from("mt5_signals")
        .update({ executed: false, reason: message })
        .eq("id", signalRow?.id ?? "");

      return errorResponse(message, err instanceof BridgeError ? err.status : 500, {
        executed: false,
        retcode,
      });
    }
  } catch (err) {
    if (err instanceof BridgeError) return errorResponse(err.message, err.status);
    console.error("mt5-execute error", err);
    return errorResponse((err as Error).message ?? "Unexpected error", 500);
  }
});
