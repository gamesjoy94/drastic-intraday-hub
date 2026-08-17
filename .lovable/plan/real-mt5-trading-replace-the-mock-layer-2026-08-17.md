# Real MT5 Trading (replace the mock layer)

## What exists today

Everything MT5-related in this app is simulated. Nothing in it touches a broker.

- `src/services/mt5ApiService.ts` — a mock. It fakes a 2-second connect that always succeeds, keeps a hardcoded `$10,000` balance, invents positions with random prices (`1800 + Math.random() * 200`), and generates fake tickets from `Date.now()`. All of it lives in `localStorage`.
- `src/services/tradeSignalProcessor.ts` — real risk logic (confidence threshold, position limits, position sizing, entry-distance checks), but it runs entirely in the browser and calls the mock service. Its settings and history are also in `localStorage`.
- `src/components/MT5TradingPanel.tsx` — the connect form takes login/password/server and passes them to the mock. The password is never sent anywhere, but the account object is written to `localStorage`.
- `supabase/functions/` — only two market-analysis functions. There is no trading backend at all.
- Auth: the app has no login. Any visitor shares the same browser-local state.

So this is not "swap the API URL" work — the entire execution path has to move server-side, and a real MT5 bridge has to exist.

## The four pieces to build

### 1. Your MT5 bridge (outside this app — you host it)

A Windows VPS running the MT5 terminal plus a small Python service (FastAPI + the `MetaTrader5` package) that exposes:

```text
POST /connect        login, password, server  -> account summary
GET  /account        balance, equity, margin, free margin, margin level, currency
GET  /positions      open positions with live profit
GET  /symbol/{sym}   bid/ask, digits, contract size, tick value, volume min/max/step
POST /order          symbol, side, volume, price, sl, tp, comment, magic -> ticket
POST /close          ticket, optional partial volume
GET  /health
```

It must require a shared secret header (e.g. `X-Bridge-Key`) and be reachable over HTTPS only. MT5's Python API is single-terminal and not thread-safe, so requests need to be serialised — one terminal per trading account, one queue in front of it.

This is the part Lovable cannot build or host: it needs Windows and a live MT5 terminal. I can write the Python service source and a setup guide into the repo (as reference files, not deployed) if you want.

### 2. Supabase backend (in this project, `yppffgwsepvcrqdvegwp`)

Auth first — real credentials and real orders cannot be per-browser. Email/password sign-in, plus a `profiles` table.

Tables (all RLS-scoped to `auth.uid()`, all with explicit grants):

- `mt5_accounts` — user_id, login, server, is_demo, label, bridge account id. **No password column.**
- `mt5_risk_settings` — the fields currently in `tradeSignalProcessor` (max risk %, max lot, SL/TP toggles, max open positions, min confidence, allowed symbols), plus `auto_trading_enabled` and `require_manual_confirm`.
- `mt5_signals` — every AI signal with its decision and the reason it was or was not executed (replaces localStorage history).
- `mt5_orders` — submitted orders, bridge ticket, fill price, status, error.

The MT5 password goes into Supabase secrets, not the database (`MT5_PASSWORD_<label>`), along with `MT5_BRIDGE_URL` and `MT5_BRIDGE_KEY`.

Edge functions (all validate the caller's JWT, all Zod-validate input):

- `mt5-connect` — verifies the bridge is up and the credentials work, stores the account row.
- `mt5-account` — proxies balance/equity/margin.
- `mt5-positions` — proxies open positions.
- `mt5-execute` — the only path that can place an order. Re-runs every risk check server-side, sizes the position from real symbol specs, calls the bridge, writes `mt5_orders`.
- `mt5-close` — closes by ticket after verifying the ticket belongs to the caller.

Risk checks must be duplicated in `mt5-execute` even though the client already runs them — the browser copy is a UX convenience, the server copy is the actual control.

### 3. Frontend rewrite

- `mt5ApiService.ts` becomes a thin client over `supabase.functions.invoke(...)`. All mock state, `mockBalance`, `mockPositions`, and the localStorage writes are deleted.
- `tradeSignalProcessor.ts` keeps its validation logic for pre-trade display, but execution is delegated to `mt5-execute`; settings and history read from Supabase instead of localStorage.
- Connect form: drop the free-text password-into-localStorage flow; password is submitted once to `mt5-connect` over HTTPS and never stored client-side.
- **Manual confirm (your choice):** every signal — demo or live — opens a confirmation dialog showing symbol, side, computed lot size, entry, SL, TP, risk in account currency, and a LIVE badge in a distinct colour when the account is not a demo. Nothing executes without an explicit click. Auto-trading stays off by default; when the toggle is on, live accounts still require confirmation and demo accounts can fire straight through.
- Polling: 30s is too slow for open positions. Account/positions refresh every 5s while the panel is visible.
- A visible kill switch that disables auto-trading and blocks new orders instantly.

### 4. Correctness details that the mock papers over

These are the things that quietly break real money:

- **Lot sizing.** Current code uses invented pip values (`0.1` for gold, `10` for majors) against `accountBalance`. Real sizing must use the symbol's `trade_tick_value`, `trade_tick_size`, `volume_min/max/step` from the bridge, and round to a valid step. Wrong sizing here is the single most expensive bug possible.
- **Price staleness.** The AI's entry price may be seconds old. The server must re-check the live bid/ask and reject if slippage exceeds a threshold.
- **Order type.** The mock ignores it. Pending vs market order must be decided from the distance between entry and current price, with a proper `filling_mode`.
- **Duplicate signals.** No idempotency today — the same analysis firing twice would open two positions. Needs a dedupe key per signal.
- **Symbol naming.** Brokers use suffixes (`EURUSD.m`, `XAUUSD.pro`). Needs a per-account symbol map.
- **Broker rules.** Stops-level minimums, market hours, weekend gaps, margin requirements — all rejected by the broker with numeric retcodes that need surfacing to the user, not a generic "Trade execution failed".

## Order of work

1. Auth + tables + grants/RLS.
2. Bridge running on your VPS, reachable over HTTPS, health check green.
3. Secrets added; `mt5-connect` / `mt5-account` / `mt5-positions` (read-only) — verify against a demo account.
4. Frontend swapped to real data, mock file deleted. Verify balances match your terminal.
5. `mt5-execute` / `mt5-close` behind manual confirm, demo account only.
6. Live accounts unlocked once demo execution has been correct for a meaningful sample.

## Before I start, you need

- A Windows VPS (any provider, ~$20-40/mo) with MT5 installed and logged into your broker account.
- A domain or static IP with TLS for the bridge.
- Your broker's exact symbol names.
- A demo account to test against first.

## Note on scope

Steps 1, 3, 4, 5 are mine. Step 2 is yours to host — I can write the Python bridge code into the repo for you to deploy, but I cannot run or verify it from here. Until the bridge is live and reachable, the edge functions have nothing to talk to.
