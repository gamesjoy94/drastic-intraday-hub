const BASE = process.env.VITE_MCP_URL || process.env.MCP_URL || 'http://127.0.0.1:22346/mcp';
const API_KEY = process.env.VITE_MCP_API_KEY || process.env.MCP_API_KEY || '';

async function callMCP(action: string, payload: any = {}) {
  const headers = new Headers({ 'Content-Type': 'application/json' });
  if (API_KEY) headers.set('Authorization', `Bearer ${API_KEY}`);
  const res = await fetch(BASE, {
    method: 'POST',
    headers,
    body: JSON.stringify({ action, payload })
  });

  const text = await res.text();
  let json: any;
  try { json = text ? JSON.parse(text) : null; } catch { json = text; }
  if (!res.ok) throw new Error(`MCP ${action} failed: ${res.status} ${text}`);
  return json;
}

export async function connectToMT5(params: { login: number; password: string; server: string }) {
  return callMCP('connect', params);
}
export async function disconnectMT5() { return callMCP('disconnect'); }
export async function getMT5Account() { return callMCP('account'); }
export async function getMT5Positions() { return callMCP('positions'); }
export async function executeMT5Trade(order: any) { return callMCP('trade', order); }
export async function closeMT5Position(ticket: number) { return callMCP('close', { ticket }); }
