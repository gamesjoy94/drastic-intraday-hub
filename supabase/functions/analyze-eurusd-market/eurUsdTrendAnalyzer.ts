
import { TechnicalData, SmartMomentumAnalysis } from './types.ts';

export function analyzeEurUsdTrendReversal(data: TechnicalData, currentPrice: number): SmartMomentumAnalysis {
  console.log('Analyzing EUR/USD with AI-Enhanced Trend Reversal Strategy using REAL market data');

  // Real EMA Analysis (8/21 periods)
  const ema8Current = data.ema8[0];
  const ema21Current = data.ema21[0];
  
  if (!ema8Current || !ema21Current) {
    throw new Error('EMA data is missing - cannot perform real analysis');
  }

  const ema8Above21 = ema8Current > ema21Current;
  const ema8Below21 = ema8Current < ema21Current;
  const emaCrossover = ema8Above21 ? 'BULLISH_CROSS' : ema8Below21 ? 'BEARISH_CROSS' : 'NONE';

  // Real RSI Analysis
  const currentRsi = data.rsi[0];
  const previousRsi = data.rsi[1];
  
  if (currentRsi === undefined || previousRsi === undefined) {
    throw new Error('RSI data is missing - cannot perform real analysis');
  }

  const rsiRising = currentRsi > previousRsi;
  const rsiLongCondition = rsiRising && currentRsi < 70 && currentRsi > 30;
  const rsiShortCondition = !rsiRising && currentRsi > 30 && currentRsi < 70;
  const rsiDirection = rsiRising ? 'RISING' : 'FALLING';

  // Real MACD Analysis
  const currentMacd = data.macd[0];
  const currentMacdSignal = data.macdSignal[0];
  
  if (currentMacd === undefined || currentMacdSignal === undefined) {
    throw new Error('MACD data is missing - cannot perform real analysis');
  }

  const macdBullish = currentMacd > currentMacdSignal && currentMacd > 0 && currentMacdSignal > 0;
  const macdBearish = currentMacd < currentMacdSignal && currentMacd < 0 && currentMacdSignal < 0;
  const macdSignal = macdBullish ? 'BULLISH' : macdBearish ? 'BEARISH' : 'NEUTRAL';

  // Real trend strength using MACD histogram
  const macdHistogram = Math.abs(data.macdHistogram[0] || 0);
  const strongTrend = macdHistogram > 0.0001; // Real threshold for EUR/USD

  // Real VWAP Analysis
  const currentVwap = data.vwap[0];
  
  if (!currentVwap) {
    throw new Error('VWAP data is missing - cannot perform real analysis');
  }

  const priceAboveVwap = currentPrice > currentVwap;
  const priceBelowVwap = currentPrice < currentVwap;
  const vwapPosition = priceAboveVwap ? 'ABOVE' : priceBelowVwap ? 'BELOW' : 'NEUTRAL';

  // Real Volume Analysis
  if (!data.volume || data.volume.length < 10) {
    throw new Error('Volume data is insufficient - cannot perform real analysis');
  }

  const avgVolume = data.volume.slice(0, 10).reduce((sum, vol) => sum + vol, 0) / 10;
  const currentVolume = data.volume[0];
  const volumeSpike = currentVolume > avgVolume * 1.2;

  // Real AI-Enhanced Trend Reversal Scoring System
  let longScore = 0;
  let shortScore = 0;

  // Long Conditions based on real data
  if (ema8Above21) longScore += 1.5; // Real EMA8 above EMA21
  if (macdBullish) longScore += 1.5; // Real MACD bullish
  if (rsiLongCondition) longScore += 1; // Real RSI rising but below 70
  if (strongTrend) longScore += 0.5; // Real trend strength
  if (priceAboveVwap) longScore += 0.5; // Real price above VWAP
  if (volumeSpike) longScore += 0.5; // Real volume confirmation

  // Short Conditions based on real data
  if (ema8Below21) shortScore += 1.5; // Real EMA8 below EMA21
  if (macdBearish) shortScore += 1.5; // Real MACD bearish
  if (rsiShortCondition) shortScore += 1; // Real RSI falling but above 30
  if (strongTrend) shortScore += 0.5; // Real trend strength
  if (priceBelowVwap) shortScore += 0.5; // Real price below VWAP
  if (volumeSpike) shortScore += 0.5; // Real volume confirmation

  // Market Bias based on real analysis
  let marketBias = 'NEUTRAL';
  if (longScore > shortScore + 1) marketBias = 'BULLISH';
  else if (shortScore > longScore + 1) marketBias = 'BEARISH';

  // Real Confidence Score
  const maxScore = Math.max(longScore, shortScore);
  const confidenceScore = Math.min(Math.round((maxScore / 5) * 100), 95);

  const summary = `REAL AI-Enhanced Trend Reversal: ${emaCrossover} EMA signal, ${macdSignal} MACD, RSI ${rsiDirection.toLowerCase()}, price ${vwapPosition.toLowerCase()} VWAP. ${strongTrend ? 'Strong' : 'Weak'} trend momentum from live market data.`;

  return {
    ema8AboveEma21: ema8Above21,
    ema8BelowEma21: ema8Below21,
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
      ema: `${ema8Current.toFixed(5)} / ${ema21Current.toFixed(5)}`,
      rsi: `${currentRsi.toFixed(1)} (${rsiDirection})`,
      macd: `${currentMacd.toFixed(6)} / ${currentMacdSignal.toFixed(6)}`,
      volume: volumeSpike ? 'HIGH ACTIVITY' : 'NORMAL',
      vwap: `${currentVwap.toFixed(5)} (${vwapPosition})`
    }
  };
}
