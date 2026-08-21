import { useState, useEffect, useCallback, useRef } from 'react';
import {
  mt5ApiService,
  MT5AccountInput,
  MT5AccountInfo,
  MT5AccountRecord,
  MT5Position,
  OrderPlan,
  RiskSettings,
  SignalRecord,
  TradeSignal,
} from '../services/mt5ApiService';
import { useToast } from './use-toast';

const POLL_MS = 15000;
const SETTINGS_EVENT = 'mt5-risk-settings-updated';

/** Only one mounted instance runs the automated position monitor. */
let monitorOwner: symbol | null = null;

export const useMT5Trading = () => {
  const [account, setAccount] = useState<MT5AccountRecord | null>(null);
  const [accountInfo, setAccountInfo] = useState<MT5AccountInfo | null>(null);
  const [positions, setPositions] = useState<MT5Position[]>([]);
  const [riskSettings, setRiskSettings] = useState<RiskSettings | null>(null);
  const [signalHistory, setSignalHistory] = useState<SignalRecord[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [bridgeError, setBridgeError] = useState<string | null>(null);
  const [pendingOrder, setPendingOrder] = useState<{ plan: OrderPlan; signal: TradeSignal } | null>(null);
  const { toast } = useToast();

  const inFlight = useRef(false);

  // ---- initial load -------------------------------------------------------
  const loadAll = useCallback(async () => {
    try {
      const [acct, settings, history] = await Promise.all([
        mt5ApiService.getActiveAccount(),
        mt5ApiService.ensureRiskSettings(),
        mt5ApiService.getSignalHistory(),
      ]);
      setAccount(acct);
      setRiskSettings(settings);
      setSignalHistory(history);
    } catch (error) {
      console.error('Failed to load MT5 state:', error);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // Keep every mounted instance of this hook in sync with settings changes.
  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<RiskSettings>).detail;
      if (detail) setRiskSettings(detail);
    };
    window.addEventListener(SETTINGS_EVENT, handler);
    return () => window.removeEventListener(SETTINGS_EVENT, handler);
  }, []);

  // ---- live broker polling ------------------------------------------------
  const refresh = useCallback(async () => {
    if (!account || inFlight.current) return;
    inFlight.current = true;
    setIsRefreshing(true);
    try {
      const [info, pos] = await Promise.all([
        mt5ApiService.getAccountInfo(account.id),
        mt5ApiService.getPositions(account.id),
      ]);
      setAccountInfo(info);
      setPositions(pos);
      setBridgeError(null);
    } catch (error) {
      setBridgeError((error as Error).message);
    } finally {
      inFlight.current = false;
      setIsRefreshing(false);
    }
  }, [account]);

  useEffect(() => {
    if (!account) return;
    refresh();
    const interval = setInterval(refresh, POLL_MS);
    return () => clearInterval(interval);
  }, [account, refresh]);

  // ---- connection ---------------------------------------------------------
  const connectToMT5 = useCallback(async (input: MT5AccountInput) => {
    setIsConnecting(true);
    setBridgeError(null);
    try {
      const { account: acct, accountInfo: info } = await mt5ApiService.connect(input);
      setAccount(acct);
      setAccountInfo(info);
      toast({
        title: 'MT5 connected',
        description: `${acct.label} — ${acct.is_demo ? 'DEMO' : 'LIVE'} account ${acct.login}`,
      });
      return true;
    } catch (error) {
      const message = (error as Error).message;
      setBridgeError(message);
      toast({ title: 'Connection failed', description: message, variant: 'destructive' });
      return false;
    } finally {
      setIsConnecting(false);
    }
  }, [toast]);

  const disconnectFromMT5 = useCallback(async () => {
    if (!account) return;
    try {
      await mt5ApiService.disconnect(account.id);
    } catch (error) {
      console.error('Disconnect failed:', error);
    }
    setAccount(null);
    setAccountInfo(null);
    setPositions([]);
    toast({ title: 'MT5 disconnected', description: 'The account is no longer active.' });
  }, [account, toast]);

  // ---- settings -----------------------------------------------------------
  const updateRiskSettings = useCallback(async (patch: Partial<RiskSettings>) => {
    try {
      const updated = await mt5ApiService.updateRiskSettings(patch);
      setRiskSettings(updated);
      window.dispatchEvent(new CustomEvent(SETTINGS_EVENT, { detail: updated }));
      return updated;
    } catch (error) {
      toast({
        title: 'Could not save settings',
        description: (error as Error).message,
        variant: 'destructive',
      });
      return null;
    }
  }, [toast]);

  const toggleAutoTrading = useCallback(async (enabled: boolean) => {
    const updated = await updateRiskSettings({ auto_trading_enabled: enabled });
    if (updated) {
      toast({
        title: enabled ? 'Auto trading enabled' : 'Auto trading disabled',
        description: enabled
          ? 'AI signals will be sent to the broker after passing server-side risk checks.'
          : 'Signals will be recorded but never executed.',
      });
    }
  }, [toast, updateRiskSettings]);

  const toggleKillSwitch = useCallback(async (engaged: boolean) => {
    const updated = await updateRiskSettings({ kill_switch_engaged: engaged });
    if (updated && engaged) {
      toast({
        title: 'Kill switch engaged',
        description: 'All new orders are blocked server-side.',
        variant: 'destructive',
      });
    }
  }, [toast, updateRiskSettings]);

  // ---- signals ------------------------------------------------------------
  const refreshHistory = useCallback(async () => {
    try {
      setSignalHistory(await mt5ApiService.getSignalHistory());
    } catch (error) {
      console.error('Failed to load signal history:', error);
    }
  }, []);

  /**
   * Runs the server-side dry run. If the order needs manual confirmation it is
   * parked in `pendingOrder` for the UI; otherwise it is sent straight away.
   */
  const processAISignal = useCallback(async (signal: TradeSignal) => {
    if (!account) return false;
    try {
      const plan = await mt5ApiService.previewOrder(signal);

      if (plan.requiresConfirmation) {
        setPendingOrder({ plan, signal });
        toast({
          title: 'Order awaiting confirmation',
          description: `${plan.side} ${plan.volume} ${plan.symbol} on ${plan.isDemo ? 'DEMO' : 'LIVE'}`,
        });
        return false;
      }

      const result = await mt5ApiService.executeOrder(signal, false);
      await Promise.all([refresh(), refreshHistory()]);
      toast({
        title: 'Trade executed',
        description: `${plan.side} ${plan.volume} ${plan.symbol} @ ${result.order.fillPrice}`,
      });
      return true;
    } catch (error) {
      await refreshHistory();
      toast({
        title: 'Signal not executed',
        description: (error as Error).message,
        variant: 'destructive',
      });
      return false;
    }
  }, [account, refresh, refreshHistory, toast]);

  const confirmPendingOrder = useCallback(async () => {
    if (!pendingOrder) return false;
    try {
      const result = await mt5ApiService.executeOrder(pendingOrder.signal, true);
      setPendingOrder(null);
      await Promise.all([refresh(), refreshHistory()]);
      toast({
        title: 'Trade executed',
        description: `Ticket ${result.order.ticket} @ ${result.order.fillPrice}`,
      });
      return true;
    } catch (error) {
      setPendingOrder(null);
      await refreshHistory();
      toast({
        title: 'Execution failed',
        description: (error as Error).message,
        variant: 'destructive',
      });
      return false;
    }
  }, [pendingOrder, refresh, refreshHistory, toast]);

  const cancelPendingOrder = useCallback(() => setPendingOrder(null), []);

  // ---- positions ----------------------------------------------------------
  const closePosition = useCallback(async (ticket: string) => {
    try {
      const res = await mt5ApiService.closePosition(ticket, account?.id);
      if (res.failed.length) throw new Error(res.failed[0].error);
      await refresh();
      toast({ title: 'Position closed', description: `Ticket ${ticket}` });
    } catch (error) {
      toast({
        title: 'Close failed',
        description: (error as Error).message,
        variant: 'destructive',
      });
    }
  }, [account, refresh, toast]);

  const closeAllPositions = useCallback(async () => {
    try {
      const res = await mt5ApiService.closeAllPositions(account?.id);
      await refresh();
      toast({
        title: 'Closed all positions',
        description: `${res.closed.length} closed${res.failed.length ? `, ${res.failed.length} failed` : ''}`,
        variant: res.failed.length ? 'destructive' : undefined,
      });
    } catch (error) {
      toast({
        title: 'Close all failed',
        description: (error as Error).message,
        variant: 'destructive',
      });
    }
  }, [account, refresh, toast]);

  const clearSignalHistory = useCallback(async () => {
    try {
      await mt5ApiService.clearSignalHistory();
      setSignalHistory([]);
    } catch (error) {
      toast({
        title: 'Could not clear history',
        description: (error as Error).message,
        variant: 'destructive',
      });
    }
  }, [toast]);


  // ---- automated execution ------------------------------------------------
  /**
   * Executes an analysis-driven signal without the confirmation dialog.
   * Live accounts still require the user to have opted into auto-live.
   */
  const executeAutoSignal = useCallback(async (signal: TradeSignal, entryIndex = 0) => {
    if (!account || !riskSettings) return false;
    if (riskSettings.kill_switch_engaged) return false;
    if (!account.is_demo && !riskSettings.auto_live_enabled) {
      toast({
        title: 'Auto trade blocked on live account',
        description: 'Enable "Allow auto-trading on live accounts" to let automation place real orders.',
        variant: 'destructive',
      });
      return false;
    }
    try {
      const result = await mt5ApiService.executeOrder(signal, true, entryIndex);
      await Promise.all([refresh(), refreshHistory()]);
      toast({
        title: 'Auto trade executed',
        description: `${result.plan.side} ${result.plan.volume} ${result.plan.symbol} @ ${result.order.fillPrice}`,
      });
      return true;
    } catch (error) {
      await refreshHistory();
      console.warn('Auto signal skipped:', (error as Error).message);
      return false;
    }
  }, [account, riskSettings, refresh, refreshHistory, toast]);

  // ---- automated trade management ----------------------------------------
  const instanceId = useRef(Symbol('mt5-trading'));
  const closing = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (monitorOwner === null) monitorOwner = instanceId.current;
    const id = instanceId.current;
    return () => {
      if (monitorOwner === id) monitorOwner = null;
    };
  }, []);

  const autoManagePositions = useCallback(async () => {
    if (monitorOwner !== instanceId.current) return;
    if (!riskSettings?.auto_manage_enabled || !positions.length) return;

    const profitTarget = Number(riskSettings.auto_close_profit_usd) || 0;
    const lossCap = Number(riskSettings.auto_close_loss_usd) || 0;
    const maxAge = Number(riskSettings.auto_close_max_age_minutes) || 0;

    for (const position of positions) {
      if (closing.current.has(position.ticket)) continue;

      const ageMinutes = position.openTime
        ? (Date.now() - new Date(position.openTime).getTime()) / 60000
        : 0;

      let reason: string | null = null;
      if (profitTarget > 0 && position.profit >= profitTarget) reason = `profit target ${profitTarget}`;
      else if (lossCap > 0 && position.profit <= -lossCap) reason = `loss cap ${lossCap}`;
      else if (maxAge > 0 && ageMinutes >= maxAge) reason = `max age ${maxAge}m`;

      if (!reason) continue;

      closing.current.add(position.ticket);
      try {
        await mt5ApiService.closePosition(position.ticket, account?.id);
        toast({ title: 'Auto-closed position', description: `#${position.ticket} — ${reason}` });
      } catch (error) {
        console.error('Auto close failed:', error);
      } finally {
        closing.current.delete(position.ticket);
      }
    }
    await refresh();
  }, [account, positions, refresh, riskSettings, toast]);

  useEffect(() => {
    autoManagePositions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [positions]);

  /** Closes any open position that opposes a fresh signal direction. */
  const closeOpposingPositions = useCallback(async (symbol: string, side: 'BUY' | 'SELL') => {
    if (!riskSettings?.auto_close_on_reverse) return;
    const base = symbol.toUpperCase();
    const opposing = positions.filter(
      (p) => p.symbol.toUpperCase().startsWith(base) && p.type !== side,
    );
    for (const position of opposing) {
      try {
        await mt5ApiService.closePosition(position.ticket, account?.id);
        toast({ title: 'Reversed out', description: `Closed #${position.ticket} on opposite signal` });
      } catch (error) {
        console.error('Reverse close failed:', error);
      }
    }
    if (opposing.length) await refresh();
  }, [account, positions, refresh, riskSettings, toast]);

  return {
    isConnected: !!account,
    account,
    accountInfo,
    positions,
    riskSettings,
    signalHistory,
    isConnecting,
    isRefreshing,
    bridgeError,
    pendingOrder,
    isAutoTradingEnabled: !!riskSettings?.auto_trading_enabled && !riskSettings?.kill_switch_engaged,
    connectToMT5,
    disconnectFromMT5,
    refresh,
    updateRiskSettings,
    toggleAutoTrading,
    toggleKillSwitch,
    processAISignal,
    confirmPendingOrder,
    cancelPendingOrder,
    closePosition,
    closeAllPositions,
    clearSignalHistory,
    executeAutoSignal,
    closeOpposingPositions,
  };
};
