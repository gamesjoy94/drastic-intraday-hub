// Server-side helper for calling an MCP endpoint from Supabase edge functions or other server code.
// Usage: import { callMcp } from './bridge/mcpProxyClient';

const MCP_URL = process.env.MCP_URL || '';
const MCP_KEY = process.env.MCP_API_KEY || '';

if (!MCP_URL) {
  // It's OK for dev, but the functions that use this should validate and fail loudly if missing.
  console.warn('MCP_URL is not set - MCP proxy calls will fail');
}

async function callMcp(action: string, payload: any = {}) {
  if (!MCP_URL) throw new Error('MCP_URL not configured');
  if (!MCP_KEY) throw new Error('MCP_API_KEY not configured');

  const res = await fetch(MCP_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${MCP_KEY}`
    },
    body: JSON.stringify({ action, payload })
  });

  const text = await res.text();
  let json: any;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = text;
  }

  if (!res.ok) {
    const err = typeof json === 'object' && json?.error ? json.error : text;
    const e: any = new Error(`MCP call failed: ${res.status} ${err}`);
    e.status = res.status;
    throw e;
  }

  return json;
}

export { callMcp };

// Example: a Supabase Edge Function (TypeScript) that proxies mt5-account
// Save as an edge function file and adapt to your runtime if needed.

/* Example (Supabase Edge Function)

import { serve } from 'std/server'
import { callMcp } from './bridge/mcpProxyClient'

serve(async (req) => {
  try {
    const body = await req.json();
    // Expecting { accountId? } or { login, server }
    const payload = body || {};
    const result = await callMcp('account', payload);
    return new Response(JSON.stringify(result), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    const status = err?.status || 500;
    return new Response(JSON.stringify({ error: String(err?.message || err) }), { status, headers: { 'Content-Type': 'application/json' } });
  }
})

*/
