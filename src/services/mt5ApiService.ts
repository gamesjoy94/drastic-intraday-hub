import {
  connectToMT5,
  disconnectMT5,
  getMT5Account,
  getMT5Positions,
  executeMT5Trade,
  closeMT5Position
} from './mt5BridgeClient';

export interface MT5Account {
  login: number;
  password?: string;
  serverName?: string;
  isDemo?: boolean;
}

export interface TradeOrder {
  symbol: string;
  action: 'BUY' | 'SELL';
  volume: number;
  price?: number;
  stopLoss?: number;
  takeProfit?: number;
  comment?: string;
  magic?: number;
}

export interface TradeResult {
  success: boolean;
  orderId?: string | number;
  error?: string;
  executionPrice?: number;
}

export interface MT5Position {
  ticket: string | number;
  symbol: string;
  type: 'BUY' | 'SELL';
  volume: number;
  openPrice: number;
  currentPrice: number;
  profit: number;
  stopLoss?: number;
  takeProfit?: number;
  openTime: string;
}

export interface MT5AccountInfo {
  balance: number;
  equity: number;
  margin: number;
  freeMargin: number;
  marginLevel: number;
  currency: string;
}

let connectedAccount: MT5Account | null = null;

export async function connect(account: MT5Account): Promise<boolean> {
  if (!account || !("login" in account)) throw new Error('Missing account.login');
  const payload = {
    login: Number((account as any).login),
    password: (account as any).password || '',
    server: account.serverName || ''
  };
  const res = await connectToMT5(payload);
  if (res && res.success) {
    connectedAccount = account;
    return true;
  }
  throw new Error(res?.detail || 'Failed to connect to MT5 bridge');
}

export async function disconnect(): Promise<void> {
  await disconnectMT5();
  connectedAccount = null;
}

export async function getAccountInfo(): Promise<MT5AccountInfo> {
  const res = await getMT5Account();
  if (!res) throw new Error('No account info from bridge');
  return {
    balance: res.balance,
    equity: res.equity,
    margin: res.margin,
    freeMargin: res.free_margin ?? res.freeMargin,
    marginLevel: res.margin_level ?? res.marginLevel,
    currency: res.currency
  } as MT5AccountInfo;
}

export async function getPositions(): Promise<MT5Position[]> {
  const res = await getMT5Positions();
  if (!res) return [];
  return res.map((p: any) => ({
    ticket: p.ticket,
    symbol: p.symbol,
    type: p.type,
    volume: p.volume,
    openPrice: p.open_price ?? p.openPrice,
    currentPrice: p.current_price ?? p.currentPrice,
    profit: p.profit,
    stopLoss: p.stop_loss ?? p.stopLoss,
    takeProfit: p.take_profit ?? p.takeProfit,
    openTime: p.open_time ?? p.openTime
  }));
}

export async function executeTrade(order: TradeOrder): Promise<TradeResult> {
  try {
    const bridgeOrder = {
      symbol: order.symbol,
      action: order.action,
      volume: order.volume,
      price: order.price,
      stop_loss: order.stopLoss,
      take_profit: order.takeProfit,
      comment: order.comment,
      magic: order.magic
    };
    const res = await executeMT5Trade(bridgeOrder);
    return { success: true, orderId: res?.order ?? res?.orderId, executionPrice: res?.executionPrice };
  } catch (err: any) {
    return { success: false, error: err?.message || String(err) };
  }
}

export async function closeTrade(ticket: string | number): Promise<TradeResult> {
  try {
    const res = await closeMT5Position(Number(ticket));
    return { success: true, orderId: res?.order ?? res?.orderId };
  } catch (err: any) {
    return { success: false, error: err?.message || String(err) };
  }
}

export function isAccountConnected(): boolean {
  return connectedAccount !== null;
}

export function getConnectedAccount(): MT5Account | null {
  return connectedAccount;
}
