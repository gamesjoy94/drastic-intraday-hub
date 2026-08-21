import { useCallback, useEffect, useRef } from 'react';
import { useMarketAnalysis } from './useMarketAnalysis';
import { useMT5Trading } from './useMT5Trading';
import type { TradeSignal } from '@/services/mt5ApiService';

const SYMBOL = 'XAUUSD';
const DEFAULT_INTERVAL_MINUTES = 2;

/**
 * Combines the XAUUSD analysis engine with the MT5 trading layer:
 *  - re-runs the analysis on a fixed interval (default every 2 minutes)
 *  - auto-executes the resulting plan when confidence clears the threshold
 *  - lets the trading hook monitor and close positions automatically
 */
export const useMarketAnalysisWithTrading = (timeframe = '5min') => {
  const marketAnalysis = useMarketAnalysis();
  const mt5Trading = useMT5Trading();
  const lastSignatureRef = useRef<string | null>(null);
  const runningRef = useRef(false);

  const { tradePlan, currentPrice, isAnalyzing, handleAnalyzeMarket } = marketAnalysis;
  const {
    riskSettings,
    isConnected,
    executeAutoSignal,
    closeOpposingPositions,
  } = mt5Trading;

  const autoAnalysisEnabled = !!riskSettings?.auto_analysis_enabled;
  const intervalMinutes = Math.max(
    1,
    Number(riskSettings?.auto_analysis_interval_minutes) || DEFAULT_INTERVAL_MINUTES,
  );
  const threshold = Number(riskSettings?.auto_confidence_threshold) || 80;
  const entriesPerSignal = Math.min(5, Math.max(1, Number(riskSettings?.auto_entries_per_signal) || 1));

  // ---- scheduled analysis --------------------------------------------------
  useEffect(() => {
    if (!autoAnalysisEnabled) return;

    const run = () => {
      if (runningRef.current) return;
      runningRef.current = true;
      Promise.resolve(handleAnalyzeMarket(SYMBOL, timeframe, { silent: true }))
        .catch((error) => console.error('Scheduled analysis failed:', error))
        .finally(() => {
          runningRef.current = false;
        });
    };

    run();
    const interval = setInterval(run, intervalMinutes * 60_000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoAnalysisEnabled, intervalMinutes, timeframe]);

  // ---- auto execution ------------------------------------------------------
  const fireSignal = useCallback(
    async (signal: TradeSignal, side: 'BUY' | 'SELL') => {
      await closeOpposingPositions(signal.symbol, side);
      for (let i = 0; i < entriesPerSignal; i += 1) {
        // Each entry gets its own dedupe index so the server accepts them all.
        // eslint-disable-next-line no-await-in-loop
        const ok = await executeAutoSignal(signal, i);
        if (!ok) break;
      }
    },
    [closeOpposingPositions, entriesPerSignal, executeAutoSignal],
  );

  useEffect(() => {
    if (!tradePlan || isAnalyzing || !isConnected || !riskSettings) return;
    if (!riskSettings.auto_trading_enabled || riskSettings.kill_switch_engaged) return;

    const plan = tradePlan as {
      direction?: string;
      entry?: number;
      stopLoss?: number;
      takeProfit?: number;
      confidence?: number;
    };

    if (!plan.direction || !plan.entry || !plan.confidence) return;

    const direction = String(plan.direction).toUpperCase();
    const side: 'BUY' | 'SELL' | null =
      direction === 'LONG' || direction === 'BUY'
        ? 'BUY'
        : direction === 'SHORT' || direction === 'SELL'
          ? 'SELL'
          : null;
    if (!side) return;

    if (Number(plan.confidence) < threshold) return;

    const signal: TradeSignal = {
      symbol: SYMBOL,
      direction,
      entry: Number(plan.entry),
      stopLoss: plan.stopLoss ? Number(plan.stopLoss) : undefined,
      takeProfit: plan.takeProfit ? Number(plan.takeProfit) : undefined,
      confidence: Number(plan.confidence),
      currentPrice: currentPrice ? Number(currentPrice) : undefined,
    };

    // Never send the same plan twice.
    const signature = `${signal.direction}|${signal.entry}|${signal.stopLoss}|${signal.takeProfit}|${signal.confidence}`;
    if (lastSignatureRef.current === signature) return;
    lastSignatureRef.current = signature;

    const timeoutId = setTimeout(() => {
      fireSignal(signal, side).catch((error) =>
        console.error('Error processing AI signal for trading:', error),
      );
    }, 1500);

    return () => clearTimeout(timeoutId);
  }, [tradePlan, currentPrice, isAnalyzing, isConnected, riskSettings, threshold, fireSignal]);

  return {
    ...marketAnalysis,
    ...mt5Trading,
    autoAnalysisEnabled,
    autoIntervalMinutes: intervalMinutes,
    confidenceThreshold: threshold,
    isTradingActive:
      mt5Trading.isConnected &&
      !!riskSettings?.auto_trading_enabled &&
      !riskSettings?.kill_switch_engaged,
    canExecuteTrades: mt5Trading.isConnected && !!marketAnalysis.tradePlan && !marketAnalysis.isAnalyzing,
  };
};
