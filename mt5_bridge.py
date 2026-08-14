from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional, List
import MetaTrader5 as mt5
import time

app = FastAPI()

class ConnectPayload(BaseModel):
    login: int
    password: str
    server: str

class TradePayload(BaseModel):
    symbol: str
    action: str  # BUY or SELL
    volume: float
    price: Optional[float] = None
    stop_loss: Optional[float] = None
    take_profit: Optional[float] = None
    comment: Optional[str] = None
    magic: Optional[int] = None

# internal state
connected_account = None

def ensure_initialized():
    if not mt5.initialize():
        raise RuntimeError(f"mt5.initialize() failed, error={mt5.last_error()}")

@app.post("/connect")
def connect(payload: ConnectPayload):
    global connected_account
    try:
        ensure_initialized()
        # Try to login to the account. On some setups the terminal must already be running and logged in.
        ok = mt5.login(payload.login, password=payload.password, server=payload.server)
        if not ok:
            raise HTTPException(status_code=500, detail=f"Login failed: {mt5.last_error()}")
        connected_account = {
            "login": payload.login,
            "server": payload.server
        }
        return {"success": True, "account": connected_account}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/disconnect")
def disconnect():
    global connected_account
    try:
        mt5.shutdown()
        connected_account = None
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/account")
def account_info():
    try:
        ensure_initialized()
        info = mt5.account_info()
        if info is None:
            raise HTTPException(status_code=500, detail="No account info (not connected)")
        return {
            "balance": info.balance,
            "equity": info.equity,
            "margin": info.margin,
            "free_margin": info.margin_free,
            "margin_level": info.margin_level,
            "currency": info.currency
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/positions")
def get_positions():
    try:
        ensure_initialized()
        positions = mt5.positions_get()
        if positions is None:
            return []
        result = []
        for p in positions:
            result.append({
                "ticket": p.ticket,
                "symbol": p.symbol,
                "type": "BUY" if p.type == mt5.ORDER_TYPE_BUY else "SELL",
                "volume": p.volume,
                "open_price": p.price_open,
                "current_price": p.price_current if hasattr(p, 'price_current') else p.price_open,
                "profit": p.profit,
                "stop_loss": p.sl,
                "take_profit": p.tp,
                "open_time": time.strftime("%Y-%m-%dT%H:%M:%S", time.localtime(p.time))
            })
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/trade")
def place_trade(order: TradePayload):
    try:
        ensure_initialized()
        symbol_info = mt5.symbol_info(order.symbol)
        if symbol_info is None:
            raise HTTPException(status_code=400, detail=f"Unknown symbol {order.symbol}")
        if not symbol_info.visible:
            mt5.symbol_select(order.symbol, True)

        # Determine order type and price
        if order.action.upper() == "BUY":
            order_type = mt5.ORDER_TYPE_BUY
            price = mt5.symbol_info_tick(order.symbol).ask
        else:
            order_type = mt5.ORDER_TYPE_SELL
            price = mt5.symbol_info_tick(order.symbol).bid

        # Build request
        request = {
            "action": mt5.TRADE_ACTION_DEAL,
            "symbol": order.symbol,
            "volume": float(order.volume),
            "type": order_type,
            "price": order.price or price,
            "sl": order.stop_loss or 0.0,
            "tp": order.take_profit or 0.0,
            "deviation": 20,
            "magic": order.magic or 0,
            "comment": order.comment or "bridge-order",
            "type_time": mt5.ORDER_TIME_GTC,
            "type_filling": mt5.ORDER_FILLING_FOK
        }

        result = mt5.order_send(request)
        if result is None:
            raise HTTPException(status_code=500, detail=f"order_send returned None: {mt5.last_error()}")
        if result.retcode != mt5.TRADE_RETCODE_DONE:
            raise HTTPException(status_code=500, detail=f"Order failed, retcode={result.retcode}, comment={result.comment}")
        return {"success": True, "order": {"order": result.order, "transaction": result}}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/close")
def close_position(ticket: int):
    try:
        ensure_initialized()
        positions = mt5.positions_get(ticket=ticket)
        if not positions:
            raise HTTPException(status_code=404, detail="Position not found")
        p = positions[0]
        # Choose opposite order type to close
        if p.type == mt5.ORDER_TYPE_BUY:
            order_type = mt5.ORDER_TYPE_SELL
            price = mt5.symbol_info_tick(p.symbol).bid
        else:
            order_type = mt5.ORDER_TYPE_BUY
            price = mt5.symbol_info_tick(p.symbol).ask

        request = {
            "action": mt5.TRADE_ACTION_DEAL,
            "symbol": p.symbol,
            "volume": p.volume,
            "type": order_type,
            "position": p.ticket,
            "price": price,
            "deviation": 20,
            "type_time": mt5.ORDER_TIME_GTC,
            "type_filling": mt5.ORDER_FILLING_FOK
        }
        result = mt5.order_send(request)
        if result is None or result.retcode != mt5.TRADE_RETCODE_DONE:
            raise HTTPException(status_code=500, detail=f"Close failed: {result}")
        return {"success": True, "order": result.order}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
