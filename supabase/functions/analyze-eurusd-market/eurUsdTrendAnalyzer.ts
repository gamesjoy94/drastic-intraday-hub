
import { TechnicalData, SmartMomentumAnalysis } from './types.ts';

export function analyzeEurUsdTrendReversal(data: TechnicalData, currentPrice: number): SmartMomentumAnalysis {
  console.log('Analyzing EUR/USD with AI-Enhanced Trend Reversal Strategy');

  // EMA Analysis (20/50 crossover simulation using 8/21)
  const ema20Above50 = data.ema8[0] > data.ema21[0];
  const ema20Below50 = data.ema8[0] < data.ema21[0];
  const emaCrossover = ema20Above50 ? 'BULLISH_CROSS' : ema20Below50 ? 'BEARISH_CROSS' : 'NONE';

  // RSI Analysis (rising but below 70 for long)
  const currentRsi = data.rsi[0] || 50;
  const previousRsi = data.rsi[1] || 50;
  const rsiRising = currentRsi > previousRsi;
  const rsiLongCondition = rsiRising && currentRsi < 70 && currentRsi > 30;
  const rsiShortCondition = !rsiRising && currentRsi > 30 && currentRsi < 70;
  const rsiDirection = rsiRising ? 'RISING' : 'FALLING';

  // MACD Analysis (line above signal, both positive)
  const currentMacd = data.macd[0] || 0;
  const currentMacdSignal = data.macdSignal[0] || 0;
  const macdBullish = currentMacd > currentMacdSignal && currentMacd > 0 && currentMacdSignal > 0;
  const macdBearish = currentMacd < currentMacdSignal && currentMacd < 0 && currentMacdSignal < 0;
  const macdSignal = macdBullish ? 'BULLISH' : macdBearish ? 'BEARISH' : 'NEUTRAL';

  // ADX Simulation (using MACD histogram strength)
  const macdHistogram = Math.abs(data.macdHistogram[0] || 0);
  const strongTrend = macdHistogram > 0.0001; // Simulating ADX > 20

  // VWAP Analysis
  const currentVwap = data.vwap[0] || currentPrice;
  const priceAboveVwap = currentPrice > currentVwap;
  const priceBelowVwap = currentPrice < currentVwap;
  const vwapPosition = priceAboveVwap ? 'ABOVE' : priceBelowVwap ? 'BELOW' : 'NEUTRAL';

  // Volume Analysis
  const avgVolume = data.volume.slice(0, 10).reduce((sum, vol) => sum + vol, 0) / 10;
  const currentVolume = data.volume[0] || 0;
  const volumeSpike = currentVolume > avgVolume * 1.2;

  // Scoring System for AI-Enhanced Trend Reversal
  let longScore = 0;
  let shortScore = 0;

  // Long Conditions
  if (ema20Above50) longScore += 1.5; // EMA20 above EMA50
  if (macdBullish) longScore += 1.5; // MACD bullish
  if (rsiLongCondition) longScore += 1; // RSI rising but below 70
  if (strongTrend) longScore += 0.5; // Strong trend (ADX simulation)
  if (priceAboveVwap) longScore += 0.5; // Price above VWAP
  if (volumeSpike) longScore += 0.5; // Volume confirmation

  // Short Conditions
  if (ema20Below50) shortScore += 1.5; // EMA20 below EMA50
  if (macdBearish) shortScore += 1.5; // MACD bearish
  if (rsiShortCondition) shortScore += 1; // RSI falling but above 30
  if (strongTrend) shortScore += 0.5; // Strong trend (ADX simulation)
  if (priceBelowVwap) shortScore += 0.5; // Price below VWAP
  if (volumeSpike) shortScore += 0.5; // Volume confirmation

  // Market Bias
  let marketBias = 'NEUTRAL';
  if (longScore > shortScore + 1) marketBias = 'BULLISH';
  else if (shortScore > longScore + 1) marketBias = 'BEARISH';

  // Confidence Score
  const maxScore = Math.max(longScore, shortScore);
  const confidenceScore = Math.min(Math.round((maxScore / 5) * 100), 95);

  const summary = `AI-Enhanced Trend Reversal: ${emaCrossover} EMA signal, ${macdSignal} MACD, RSI ${rsiDirection.toLowerCase()}, price ${vwapPosition.toLowerCase()} VWAP. ${strongTrend ? 'Strong' : 'Weak'} trend momentum.`;

  return {
    ema8AboveEma21: ema20Above50,
    ema8BelowEma21: ema20Below50,
    emaCrossover,
    rsiLongCondition,
    rsiShortCondition,
    rsiDirection,
    macdBullish,
    macdBearish,
    macdSignal,
    volumeSpike,
    priceAboveVwap,
    priceBelowVwap,
    vwapPosition,
    longScore: Math.round(longScore * 10) / 10,
    shortScore: Math.round(shortScore * 10) / 10,
    marketBias,
    confidenceScore,
    summary,
    indicators: {
      ema: `${data.ema8[0]?.toFixed(5) || 'N/A'} / ${data.ema21[0]?.toFixed(5) || 'N/A'}`,
      rsi: `${currentRsi.toFixed(1)} (${rsiDirection})`,
      macd: `${currentMacd.toFixed(6)} / ${currentMacdSignal.toFixed(6)}`,
      volume: volumeSpike ? 'HIGH ACTIVITY' : 'NORMAL',
      vwap: `${currentVwap.toFixed(5)} (${vwapPosition})`
    }
  };
}
