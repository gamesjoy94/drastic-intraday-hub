import { useEffect, useRef } from 'react';
import { useMarketAnalysis } from './useMarketAnalysis';
import { useMT5Trading } from './useMT5Trading';
import type { TradeSignal } from '@/services/mt5ApiService';

const SYMBOL = 'XAUUSD';

export const useMarketAnalysisWithTrading = () => {
  const marketAnalysis = useMarketAnalysis();
  const mt5Trading = useMT5Trading();
  const lastSignatureRef = useRef<string | null>(null);

  const { tradePlan, currentPrice, isAnalyzing } = marketAnalysis;
  const { isAutoTradingEnabled, isConnected, processAISignal } = mt5Trading;

  useEffect(() => {
    if (!tradePlan || isAnalyzing || !isAutoTradingEnabled || !isConnected) return;

    const plan = tradePlan as {
      direction?: string;
      entry?: number;
      stopLoss?: number;
      takeProfit?: number;
      confidence?: number;
    };

    if (!plan.direction || !plan.entry || !plan.confidence) return;

    const signal: TradeSignal = {
      symbol: SYMBOL,
      direction: plan.direction,
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
      processAISignal(signal).catch((error) =>
        console.error('Error processing AI signal for trading:', error),
      );
    }, 1500);

    return () => clearTimeout(timeoutId);
  }, [tradePlan, currentPrice, isAnalyzing, isAutoTradingEnabled, isConnected, processAISignal]);

  return {
    ...marketAnalysis,
    ...mt5Trading,
    isTradingActive: mt5Trading.isConnected && mt5Trading.isAutoTradingEnabled,
    canExecuteTrades: mt5Trading.isConnected && !!marketAnalysis.tradePlan && !marketAnalysis.isAnalyzing,
  };
};
