
import { TechnicalData, SmartMomentumAnalysis } from './types.ts';

export function analyzeSmartMomentumScalping(data: TechnicalData, currentPrice: number): SmartMomentumAnalysis {
  const ema8 = data.ema8[0] || currentPrice;
  const ema21 = data.ema21[0] || currentPrice;
  const ema8Prev = data.ema8[1] || currentPrice;
  const ema21Prev = data.ema21[1] || currentPrice;
  
  const rsi = data.rsi[0] || 50;
  const rsiPrev = data.rsi[1] || 50;
  
  const macdHist = data.macdHistogram[0] || 0;
  const macdHistPrev = data.macdHistogram[1] || 0;
  
  const volume = data.volume[0] || 0;
  const avgVolume = data.volume.slice(0, 20).reduce((a, b) => a + b, 0) / Math.min(20, data.volume.length);
  
  const vwap = data.vwap[0] || currentPrice;
  
  // Strategy conditions
  const ema8AboveEma21 = ema8 > ema21;
  const ema8BelowEma21 = ema8 < ema21;
  const emaCrossover = (ema8 > ema21 && ema8Prev <= ema21Prev) ? 'BULLISH' : 
                      (ema8 < ema21 && ema8Prev >= ema21Prev) ? 'BEARISH' : 'NONE';
  
  const rsiLongCondition = rsi > 50 && rsi > rsiPrev;
  const rsiShortCondition = rsi < 50 && rsi < rsiPrev;
  const rsiDirection = rsi > rsiPrev ? 'RISING' : rsi < rsiPrev ? 'FALLING' : 'NEUTRAL';
  
  const macdBullish = macdHist > 0 && macdHist > macdHistPrev;
  const macdBearish = macdHist < 0 && macdHist < macdHistPrev;
  const macdSignal = macdBullish ? 'BULLISH' : macdBearish ? 'BEARISH' : 'NEUTRAL';
  
  const volumeSpike = volume > avgVolume * 1.2;
  
  const priceAboveVwap = currentPrice > vwap;
  const priceBelowVwap = currentPrice < vwap;
  const vwapPosition = priceAboveVwap ? 'ABOVE' : 'BELOW';
  
  // Score calculations
  let longScore = 0;
  let shortScore = 0;
  
  if (ema8AboveEma21) longScore++;
  if (rsiLongCondition) longScore++;
  if (macdBullish) longScore++;
  if (volumeSpike) longScore++;
  if (priceAboveVwap) longScore++;
  
  if (ema8BelowEma21) shortScore++;
  if (rsiShortCondition) shortScore++;
  if (macdBearish) shortScore++;
  if (volumeSpike) shortScore++;
  if (priceBelowVwap) shortScore++;
  
  const marketBias = longScore > shortScore ? 'BULLISH' : shortScore > longScore ? 'BEARISH' : 'NEUTRAL';
  const confidenceScore = Math.max(longScore, shortScore) * 20; // Convert to percentage
  
  const summary = `Smart Momentum Scalping Analysis: ${marketBias} bias with ${confidenceScore}% confidence. 
                   Long conditions: ${longScore}/5, Short conditions: ${shortScore}/5. 
                   Key signals: ${emaCrossover} EMA crossover, ${rsiDirection} RSI, ${macdSignal} MACD, 
                   ${volumeSpike ? 'High' : 'Normal'} volume, Price ${vwapPosition} VWAP.`;
  
  return {
    ema8AboveEma21,
    ema8BelowEma21,
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
    longScore,
    shortScore,
    marketBias,
    confidenceScore,
    summary,
    indicators: {
      ema: `${ema8.toFixed(2)} / ${ema21.toFixed(2)}`,
      rsi: `${rsi.toFixed(1)} (${rsiDirection})`,
      macd: `${macdSignal}`,
      volume: volumeSpike ? 'HIGH' : 'NORMAL',
      vwap: vwapPosition
    }
  };
}
