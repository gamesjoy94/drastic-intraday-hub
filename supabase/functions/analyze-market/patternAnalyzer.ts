
import { TechnicalData, PatternData } from './types.ts';

export function analyzePatterns(data: TechnicalData, currentPrice: number): PatternData {
  const ohlcv = data.ohlcv.slice(0, 20);
  const highs = ohlcv.map(v => parseFloat(v.high));
  const lows = ohlcv.map(v => parseFloat(v.low));
  const closes = ohlcv.map(v => parseFloat(v.close));
  const volumes = data.volume.slice(0, 20);
  
  // Calculate support and resistance levels
  const recentHighs = highs.slice(0, 10);
  const recentLows = lows.slice(0, 10);
  const resistance = Math.max(...recentHighs);
  const support = Math.min(...recentLows);
  const pivot = (resistance + support + currentPrice) / 3;
  
  // Pattern detection logic
  let pattern = 'Consolidation';
  let direction = 'NEUTRAL';
  let strength = 'MODERATE';
  let probability = 60;
  
  // Detect ascending triangle
  if (recentHighs.filter(h => h > currentPrice * 1.01).length >= 2 && 
      recentLows.slice(0, 5).every((low, i, arr) => i === 0 || low >= arr[i-1] * 0.999)) {
    pattern = 'Ascending Triangle';
    direction = 'BULLISH';
    strength = 'STRONG';
    probability = 75;
  }
  // Detect descending triangle
  else if (recentLows.filter(l => l < currentPrice * 0.99).length >= 2 && 
           recentHighs.slice(0, 5).every((high, i, arr) => i === 0 || high <= arr[i-1] * 1.001)) {
    pattern = 'Descending Triangle';
    direction = 'BEARISH';
    strength = 'STRONG';
    probability = 75;
  }
  // Detect double top
  else if (recentHighs.length >= 2 && Math.abs(recentHighs[0] - recentHighs[1]) < currentPrice * 0.005) {
    pattern = 'Double Top';
    direction = 'BEARISH';
    strength = 'MODERATE';
    probability = 65;
  }
  // Detect double bottom
  else if (recentLows.length >= 2 && Math.abs(recentLows[0] - recentLows[1]) < currentPrice * 0.005) {
    pattern = 'Double Bottom';
    direction = 'BULLISH';
    strength = 'MODERATE';
    probability = 65;
  }
  // Detect flag pattern
  else if (Math.abs(resistance - support) < currentPrice * 0.02) {
    pattern = 'Flag Pattern';
    direction = closes[0] > closes[4] ? 'BULLISH' : 'BEARISH';
    strength = 'WEAK';
    probability = 55;
  }
  
  // Calculate breakout level and target
  const atr = data.atr[0] || currentPrice * 0.02;
  const breakoutLevel = direction === 'BULLISH' ? resistance : support;
  const target = direction === 'BULLISH' ? 
    breakoutLevel + (atr * 2) : 
    breakoutLevel - (atr * 2);
  
  // Volume confirmation
  const avgVolume = volumes.reduce((a, b) => a + b, 0) / volumes.length;
  const volumeConfirmation = volumes[0] > avgVolume * 1.2;
  
  if (volumeConfirmation && strength === 'MODERATE') {
    strength = 'STRONG';
    probability += 10;
  }
  
  return {
    pattern,
    direction,
    strength,
    probability: Math.min(probability, 85),
    support: support.toFixed(2),
    resistance: resistance.toFixed(2),
    pivot: pivot.toFixed(2),
    breakoutLevel: breakoutLevel.toFixed(2),
    target: target.toFixed(2),
    description: `${pattern} detected with ${direction.toLowerCase()} bias`,
    analysis: `Pattern shows ${strength.toLowerCase()} ${direction.toLowerCase()} potential. Key level at $${breakoutLevel.toFixed(2)} with target around $${target.toFixed(2)}. ${volumeConfirmation ? 'Volume confirms the pattern.' : 'Volume needs confirmation.'}`,
    signals: {
      volumeConfirmation: volumeConfirmation ? 'CONFIRMED' : 'PENDING',
      priceAction: direction,
      keyLevel: `$${breakoutLevel.toFixed(2)}`,
      riskLevel: strength === 'STRONG' ? 'LOW' : strength === 'MODERATE' ? 'MEDIUM' : 'HIGH'
    }
  };
}
