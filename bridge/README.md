# MT5 bridge (self-hosted)

The app never touches your MT5 password. You run this small service on a Windows VPS
next to a MetaTrader 5 terminal that is already logged into your account; Supabase edge
functions call it over HTTPS with a shared secret.

## Endpoints the edge functions expect

All are `POST`, authenticated with the header `X-Bridge-Key: <MT5_BRIDGE_KEY>`.

| Path | Body | Response |
| --- | --- | --- |
| `/account` | `{login, server}` | `{login, balance, equity, margin, freeMargin, marginLevel, currency, isDemo, server, leverage}` |
| `/positions` | `{login, server}` | `{positions: [{ticket, symbol, type, volume, openPrice, currentPrice, profit, stopLoss, takeProfit, openTime}]}` |
| `/symbol` | `{login, server, symbol}` | `{symbol, bid, ask, digits, point, tickValue, tickSize, contractSize, volumeMin, volumeMax, volumeStep, stopsLevel, tradeAllowed}` |
| `/order` | `{login, server, symbol, side, volume, price, stopLoss, takeProfit, deviationPoints, comment, magic}` | `{ticket, fillPrice, retcode, comment}` |
| `/close` | `{login, server, ticket}` | `{ticket, retcode}` |

Errors must return a non-2xx status with `{"error": "...", "retcode": <optional>}`.

## Minimal implementation (Python 3.11, Windows)

```bash
pip install fastapi uvicorn MetaTrader5
```

```python
import os
import MetaTrader5 as mt5
from fastapi import FastAPI, Header, HTTPException
from pydantic import BaseModel

KEY = os.environ["BRIDGE_KEY"]
app = FastAPI()
mt5.initialize()  # attaches to the running, already logged-in terminal

def guard(key: str | None, login: str):
    if key != KEY:
        raise HTTPException(401, "bad key")
    info = mt5.account_info()
    if info is None or str(info.login) != str(login):
        raise HTTPException(409, "terminal is logged into a different account")
    return info

class Req(BaseModel):
    login: str
    server: str

@app.post("/account")
def account(r: Req, x_bridge_key: str = Header(None)):
    i = guard(x_bridge_key, r.login)
    return {
        "login": str(i.login), "balance": i.balance, "equity": i.equity,
        "margin": i.margin, "freeMargin": i.margin_free,
        "marginLevel": i.margin_level, "currency": i.currency,
        "isDemo": i.trade_mode == mt5.ACCOUNT_TRADE_MODE_DEMO,
        "server": i.server, "leverage": i.leverage,
    }
```

Extend the same pattern with `mt5.positions_get()`, `mt5.symbol_info()` /
`mt5.symbol_info_tick()`, and `mt5.order_send()` for the remaining routes, mapping
`retcode != mt5.TRADE_RETCODE_DONE` to an HTTP error.

## Hardening

- Put it behind HTTPS (Caddy or Cloudflare Tunnel) — plain HTTP leaks the bridge key.
- Restrict inbound traffic to Supabase edge egress or use a tunnel with no open ports.
- Generate a long random `BRIDGE_KEY` and store the same value as the Supabase secret.

## Required Supabase secrets

- `MT5_BRIDGE_URL` — e.g. `https://mt5.yourdomain.com`
- `MT5_BRIDGE_KEY` — the shared secret above
