
import { SmartMomentumAnalysis } from './types.ts';

export function generateFallbackTradePlan(analysis: SmartMomentumAnalysis, currentPrice: number, atr: number) {
  const direction = analysis.longScore >= 4 ? 'LONG' : analysis.shortScore >= 4 ? 'SHORT' : 'NO TRADE';
  const atrValue = atr || currentPrice * 0.02;
  
  let entry = currentPrice;
  let stopLoss = direction === 'LONG' ? currentPrice - atrValue : currentPrice + atrValue;
  let takeProfit = direction === 'LONG' ? currentPrice + (atrValue * 1.5) : currentPrice - (atrValue * 1.5);
  
  if (direction === 'NO TRADE') {
    stopLoss = currentPrice * 0.98;
    takeProfit = currentPrice * 1.02;
  }
  
  return {
    direction,
    entry: entry.toFixed(2),
    stopLoss: stopLoss.toFixed(2),
    takeProfit: takeProfit.toFixed(2),
    riskReward: "1:1.5",
    positionSize: direction === 'NO TRADE' ? "0%" : "1-2%",
    timing: direction === 'NO TRADE' ? "Wait for better setup" : "Ready for entry",
    risks: "Market volatility, news events, false breakouts",
    strategy: analysis.summary,
    confidence: analysis.confidenceScore,
    indicators: analysis.indicators
  };
}
