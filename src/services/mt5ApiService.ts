import { supabase } from '@/integrations/supabase/client';

/** This app is fully public — everything belongs to one shared workspace row. */
export const PUBLIC_USER_ID = '00000000-0000-0000-0000-000000000000';

export interface MT5AccountInput {
  label: string;
  login: string;
  serverName: string;
  isDemo: boolean;
  symbolSuffix: string;
}

export interface MT5AccountRecord {
  id: string;
  label: string;
  login: string;
  server_name: string;
  is_demo: boolean;
  symbol_suffix: string;
}

export interface MT5AccountInfo {
  login: string;
  balance: number;
  equity: number;
  margin: number;
  freeMargin: number;
  marginLevel: number;
  currency: string;
  isDemo: boolean;
  server: string;
  leverage?: number;
}

export interface MT5Position {
  ticket: string;
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

export interface RiskSettings {
  max_risk_percentage: number;
  max_position_size: number;
  max_open_positions: number;
  min_confidence: number;
  max_slippage_percentage: number;
  use_stop_loss: boolean;
  use_take_profit: boolean;
  allowed_symbols: string[];
  auto_trading_enabled: boolean;
  require_manual_confirm: boolean;
  kill_switch_engaged: boolean;
  /** Automation */
  auto_analysis_enabled: boolean;
  auto_analysis_interval_minutes: number;
  auto_confidence_threshold: number;
  auto_entries_per_signal: number;
  auto_live_enabled: boolean;
  auto_manage_enabled: boolean;
  auto_close_profit_usd: number;
  auto_close_loss_usd: number;
  auto_close_max_age_minutes: number;
  auto_close_on_reverse: boolean;
}

export interface OrderPlan {
  accountId: string;
  accountLabel: string;
  isDemo: boolean;
  symbol: string;
  brokerSymbol: string;
  side: 'BUY' | 'SELL';
  volume: number;
  marketPrice: number;
  stopLoss: number | null;
  takeProfit: number | null;
  estimatedRisk: number;
  currency: string;
  digits: number;
  requiresConfirmation: boolean;
}

export interface SignalRecord {
  id: string;
  created_at: string;
  symbol: string;
  direction: string;
  entry: number | null;
  stop_loss: number | null;
  take_profit: number | null;
  confidence: number | null;
  executed: boolean;
  reason: string | null;
}

export interface TradeSignal {
  symbol: string;
  direction: string;
  entry: number;
  stopLoss?: number;
  takeProfit?: number;
  confidence: number;
  currentPrice?: number;
}

class BridgeCallError extends Error {
  status: number;
  constructor(message: string, status = 500) {
    super(message);
    this.status = status;
  }
}

async function invoke<T>(fn: string, body: Record<string, unknown> = {}): Promise<T> {
  const { data, error } = await supabase.functions.invoke(fn, { body });

  if (error) {
    // Edge functions return a JSON body with a readable `error` even on 4xx/5xx.
    let message = error.message;
    let status = 500;
    const ctx = (error as unknown as { context?: Response }).context;
    if (ctx && typeof ctx.text === 'function') {
      status = ctx.status ?? 500;
      try {
        const parsed = JSON.parse(await ctx.text());
        if (parsed?.error) message = parsed.error;
      } catch {
        /* keep the original message */
      }
    }
    throw new BridgeCallError(message, status);
  }

  if ((data as { error?: string })?.error) {
    throw new BridgeCallError((data as { error: string }).error, 400);
  }

  return data as T;
}

/**
 * Talks to the self-hosted MT5 bridge through Supabase edge functions.
 * No credentials, order routing or risk logic live in the browser.
 */
class MT5ApiService {
  async connect(input: MT5AccountInput) {
    return invoke<{ account: MT5AccountRecord; accountInfo: MT5AccountInfo }>(
      'mt5-connect',
      input as unknown as Record<string, unknown>,
    );
  }

  async disconnect(accountId: string) {
    const { error } = await supabase
      .from('mt5_accounts')
      .update({ is_active: false })
      .eq('id', accountId);
    if (error) throw new Error(error.message);
  }

  async getActiveAccount(): Promise<MT5AccountRecord | null> {
    const { data, error } = await supabase
      .from('mt5_accounts')
      .select('id, label, login, server_name, is_demo, symbol_suffix')
      .eq('is_active', true)
      .order('last_connected_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data;
  }

  async getAccountInfo(accountId?: string) {
    const res = await invoke<{ account: MT5AccountRecord; accountInfo: MT5AccountInfo }>(
      'mt5-account',
      accountId ? { accountId } : {},
    );
    return res.accountInfo;
  }

  async getPositions(accountId?: string): Promise<MT5Position[]> {
    const res = await invoke<{ positions: MT5Position[] }>(
      'mt5-positions',
      accountId ? { accountId } : {},
    );
    return res.positions ?? [];
  }

  async closePosition(ticket: string, accountId?: string) {
    return invoke<{ closed: string[]; failed: { ticket: string; error: string }[] }>(
      'mt5-close',
      { ticket, ...(accountId ? { accountId } : {}) },
    );
  }

  async closeAllPositions(accountId?: string) {
    return invoke<{ closed: string[]; failed: { ticket: string; error: string }[] }>(
      'mt5-close',
      { closeAll: true, ...(accountId ? { accountId } : {}) },
    );
  }

  /** Server-side dry run: validates the signal and returns the exact order it would send. */
  async previewOrder(signal: TradeSignal) {
    const res = await invoke<{ preview: true; plan: OrderPlan }>('mt5-execute', {
      ...signal,
      dedupeKey: buildDedupeKey(signal),
      preview: true,
    });
    return res.plan;
  }

  async executeOrder(signal: TradeSignal, confirmed: boolean, entryIndex = 0) {
    return invoke<{ executed: boolean; plan: OrderPlan; order: { ticket: string; fillPrice: number } }>(
      'mt5-execute',
      { ...signal, dedupeKey: buildDedupeKey(signal, entryIndex), confirmed },
    );
  }

  // ---- risk settings -------------------------------------------------------

  async getRiskSettings(): Promise<RiskSettings | null> {
    const { data, error } = await supabase
      .from('mt5_risk_settings')
      .select('*')
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return null;
    const { user_id: _u, created_at: _c, updated_at: _up, ...rest } = data;
    return rest as RiskSettings;
  }

  async ensureRiskSettings(userId: string = PUBLIC_USER_ID): Promise<RiskSettings> {
    const existing = await this.getRiskSettings();
    if (existing) return existing;
    const { data, error } = await supabase
      .from('mt5_risk_settings')
      .insert({ user_id: userId })
      .select('*')
      .single();
    if (error) throw new Error(error.message);
    const { user_id: _u, created_at: _c, updated_at: _up, ...rest } = data;
    return rest as RiskSettings;
  }

  async updateRiskSettings(patch: Partial<RiskSettings>): Promise<RiskSettings> {
    const { data, error } = await supabase
      .from('mt5_risk_settings')
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq('user_id', PUBLIC_USER_ID)
      .select('*')
      .single();
    if (error) throw new Error(error.message);
    const { user_id: _u, created_at: _c, updated_at: _up, ...rest } = data;
    return rest as RiskSettings;
  }

  // ---- signal history ------------------------------------------------------

  async getSignalHistory(limit = 50): Promise<SignalRecord[]> {
    const { data, error } = await supabase
      .from('mt5_signals')
      .select('id, created_at, symbol, direction, entry, stop_loss, take_profit, confidence, executed, reason')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw new Error(error.message);
    return (data ?? []) as SignalRecord[];
  }

  async clearSignalHistory() {
    const { error } = await supabase.from('mt5_signals').delete().eq('user_id', PUBLIC_USER_ID);
    if (error) throw new Error(error.message);
  }
}

/**
 * Stable key so the same AI signal can never be executed twice, even if the
 * analysis effect re-fires. Rounded to the minute + rounded prices.
 */
export function buildDedupeKey(signal: TradeSignal, entryIndex = 0): string {
  const minute = Math.floor(Date.now() / 60000);
  return [
    signal.symbol,
    signal.direction.toUpperCase(),
    signal.entry.toFixed(5),
    (signal.stopLoss ?? 0).toFixed(5),
    (signal.takeProfit ?? 0).toFixed(5),
    Math.round(signal.confidence),
    minute,
    entryIndex,
  ].join('|');
}

export const mt5ApiService = new MT5ApiService();
export { BridgeCallError };
