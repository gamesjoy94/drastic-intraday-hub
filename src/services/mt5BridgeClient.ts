const BASE = process.env.VITE_MT5_BRIDGE_URL || (process.env.MT5_BRIDGE_URL || 'http://localhost:5000');
const BRIDGE_KEY = process.env.VITE_MT5_BRIDGE_KEY || process.env.MT5_BRIDGE_KEY || '';

async function call(path: string, opts: RequestInit = {}) {
  const headers = new Headers(opts.headers as any || {});
  if (BRIDGE_KEY) headers.set('X-MT5-BRIDGE-KEY', BRIDGE_KEY);
  const res = await fetch(`${BASE}${path}`, { ...opts, headers });
  const text = await res.text();
  let json: any;
  try { json = text ? JSON.parse(text) : null; } catch { json = text; }
  if (!res.ok) throw new Error(`Bridge ${path} failed: ${res.status} ${text}`);
  return json;
}

export async function connectToMT5(account: { login: number; password: string; server: string }) {
  return call('/connect', {
    method: 'POST',
    body: JSON.stringify(account),
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function disconnectMT5() {
  return call('/disconnect', { method: 'POST' });
}

export async function getMT5Account() {
  return call('/account', { method: 'GET' });
}

export async function getMT5Positions() {
  return call('/positions', { method: 'GET' });
}

export async function executeMT5Trade(order: {
  symbol: string;
  action: 'BUY' | 'SELL';
  volume: number;
  price?: number;
  stop_loss?: number;
  take_profit?: number;
  comment?: string;
  magic?: number;
}) {
  return call('/trade', {
    method: 'POST',
    body: JSON.stringify(order),
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function closeMT5Position(ticket: number) {
  return call('/close', {
    method: 'POST',
    body: JSON.stringify({ ticket }),
    headers: { 'Content-Type': 'application/json' }
  });
}
