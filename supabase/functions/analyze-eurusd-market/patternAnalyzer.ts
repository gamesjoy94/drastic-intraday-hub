
import { TechnicalData, PatternData } from './types.ts';

export const analyzePatterns = (technicalData: TechnicalData, currentPrice: number): PatternData => {
  const { ema8, ema21, rsi, macd, macdSignal, volume, vwap, atr, ohlcv } = technicalData;

  // Calculate pattern strength based on technical indicators
  let pattern = "CONSOLIDATION";
  let direction = "NEUTRAL";
  let strength = "MEDIUM";
  let probability = 50;

  // EMA pattern analysis
  const ema8Current = ema8[0] || currentPrice;
  const ema21Current = ema21[0] || currentPrice;
  const rsiCurrent = rsi[0] || 50;
  const macdCurrent = macd[0] || 0;
  const macdSignalCurrent = macdSignal[0] || 0;
  const vwapCurrent = vwap[0] || currentPrice;
  const atrCurrent = atr[0] || 0.001;

  // Pattern detection logic
  if (ema8Current > ema21Current && rsiCurrent < 70 && macdCurrent > macdSignalCurrent) {
    pattern = "BULLISH_MOMENTUM";
    direction = "BULLISH";
    strength = rsiCurrent > 60 ? "STRONG" : "MEDIUM";
    probability = Math.min(85, 60 + (rsiCurrent - 50) * 0.5);
  } else if (ema8Current < ema21Current && rsiCurrent > 30 && macdCurrent < macdSignalCurrent) {
    pattern = "BEARISH_MOMENTUM";
    direction = "BEARISH";
    strength = rsiCurrent < 40 ? "STRONG" : "MEDIUM";
    probability = Math.min(85, 60 + (50 - rsiCurrent) * 0.5);
  }

  // Support and resistance levels
  const recentHighs = ohlcv.slice(0, 20).map((candle: any) => parseFloat(candle.high));
  const recentLows = ohlcv.slice(0, 20).map((candle: any) => parseFloat(candle.low));
  
  const resistance = Math.max(...recentHighs).toFixed(5);
  const support = Math.min(...recentLows).toFixed(5);
  const pivot = ((parseFloat(resistance) + parseFloat(support) + currentPrice) / 3).toFixed(5);

  // Calculate volatility
  const volatility = {
    current: atrCurrent,
    average: atr.slice(0, 10).reduce((sum, val) => sum + val, 0) / Math.min(atr.length, 10),
    percentile: atrCurrent > 0.001 ? "HIGH" : "LOW",
    trend: atr[0] > atr[1] ? "INCREASING" : "DECREASING"
  };

  // Risk metrics
  const stopLossDistance = (atrCurrent * 2).toFixed(5);
  const takeProfitDistance = (atrCurrent * 3).toFixed(5);
  
  return {
    pattern,
    direction,
    strength,
    probability,
    support,
    resistance,
    pivot,
    breakoutLevel: direction === "BULLISH" ? resistance : support,
    target: direction === "BULLISH" ? 
      (currentPrice + parseFloat(takeProfitDistance)).toFixed(5) :
      (currentPrice - parseFloat(takeProfitDistance)).toFixed(5),
    description: `EUR/USD showing ${pattern} pattern with ${strength} strength`,
    analysis: `Current EUR/USD analysis indicates ${direction.toLowerCase()} momentum with ${probability}% probability. Key levels: Support at ${support}, Resistance at ${resistance}.`,
    volatility,
    riskMetrics: {
      riskRewardRatio: "1:1.5",
      positionSize: "1-2%",
      maxRisk: "1%",
      stopLossDistance,
      takeProfitDistance
    },
    correlation: {
      goldSilverCorr: 0.75,
      goldDxyCorr: -0.65,
      goldSpyCorr: 0.45,
      goldBondCorr: -0.35,
      correlationSignal: "NEUTRAL"
    },
    signals: {
      volumeConfirmation: volume[0] > volume[1] ? "STRONG" : "WEAK",
      priceAction: currentPrice > vwapCurrent ? "BULLISH" : "BEARISH",
      keyLevel: Math.abs(currentPrice - parseFloat(support)) < Math.abs(currentPrice - parseFloat(resistance)) ? support : resistance,
      riskLevel: volatility.percentile === "HIGH" ? "HIGH" : "MEDIUM"
    }
  };
};
