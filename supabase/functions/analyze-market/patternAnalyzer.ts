
import { TechnicalData, PatternData } from './types.ts';

export function analyzePatterns(data: TechnicalData, currentPrice: number): PatternData {
  const ohlcv = data.ohlcv.slice(0, 30);
  const highs = ohlcv.map(v => parseFloat(v.high));
  const lows = ohlcv.map(v => parseFloat(v.low));
  const closes = ohlcv.map(v => parseFloat(v.close));
  const volumes = data.volume.slice(0, 30);
  
  // Calculate support and resistance levels
  const recentHighs = highs.slice(0, 15);
  const recentLows = lows.slice(0, 15);
  const resistance = Math.max(...recentHighs);
  const support = Math.min(...recentLows);
  const pivot = (resistance + support + currentPrice) / 3;
  
  // Enhanced pattern detection logic
  let pattern = 'Consolidation';
  let direction = 'NEUTRAL';
  let strength = 'MODERATE';
  let probability = 60;
  let breakoutPrediction = 'Pending breakout direction';
  
  // Head & Shoulders pattern detection
  if (detectHeadAndShoulders(highs, lows)) {
    pattern = 'Head & Shoulders';
    direction = 'BEARISH';
    strength = 'STRONG';
    probability = 80;
    breakoutPrediction = 'Bearish breakdown expected below neckline';
  }
  // Inverse Head & Shoulders
  else if (detectInverseHeadAndShoulders(highs, lows)) {
    pattern = 'Inverse Head & Shoulders';
    direction = 'BULLISH';
    strength = 'STRONG';
    probability = 80;
    breakoutPrediction = 'Bullish breakout expected above neckline';
  }
  // Ascending Triangle
  else if (detectAscendingTriangle(recentHighs, recentLows, currentPrice)) {
    pattern = 'Ascending Triangle';
    direction = 'BULLISH';
    strength = 'STRONG';
    probability = 75;
    breakoutPrediction = 'Bullish breakout above resistance expected';
  }
  // Descending Triangle
  else if (detectDescendingTriangle(recentHighs, recentLows, currentPrice)) {
    pattern = 'Descending Triangle';
    direction = 'BEARISH';
    strength = 'STRONG';
    probability = 75;
    breakoutPrediction = 'Bearish breakdown below support expected';
  }
  // Symmetrical Triangle
  else if (detectSymmetricalTriangle(recentHighs, recentLows)) {
    pattern = 'Symmetrical Triangle';
    direction = closes[0] > closes[4] ? 'BULLISH' : 'BEARISH';
    strength = 'MODERATE';
    probability = 65;
    breakoutPrediction = 'Breakout direction to be confirmed';
  }
  // Double Top
  else if (detectDoubleTop(recentHighs, currentPrice)) {
    pattern = 'Double Top';
    direction = 'BEARISH';
    strength = 'MODERATE';
    probability = 70;
    breakoutPrediction = 'Bearish breakdown below support expected';
  }
  // Double Bottom
  else if (detectDoubleBottom(recentLows, currentPrice)) {
    pattern = 'Double Bottom';
    direction = 'BULLISH';
    strength = 'MODERATE';
    probability = 70;
    breakoutPrediction = 'Bullish breakout above resistance expected';
  }
  // Bull Flag
  else if (detectBullFlag(closes, volumes)) {
    pattern = 'Bull Flag';
    direction = 'BULLISH';
    strength = 'MODERATE';
    probability = 68;
    breakoutPrediction = 'Continuation of uptrend expected';
  }
  // Bear Flag
  else if (detectBearFlag(closes, volumes)) {
    pattern = 'Bear Flag';
    direction = 'BEARISH';
    strength = 'MODERATE';
    probability = 68;
    breakoutPrediction = 'Continuation of downtrend expected';
  }
  
  // Calculate breakout level and target
  const atr = data.atr[0] || currentPrice * 0.02;
  const breakoutLevel = direction === 'BULLISH' ? resistance : support;
  const target = direction === 'BULLISH' ? 
    breakoutLevel + (atr * 2.5) : 
    breakoutLevel - (atr * 2.5);
  
  // Volume confirmation analysis
  const avgVolume = volumes.reduce((a, b) => a + b, 0) / volumes.length;
  const recentVolume = volumes.slice(0, 3);
  const volumeSpike = recentVolume.some(v => v > avgVolume * 1.5);
  const volumeConfirmation = volumeSpike ? 'CONFIRMED' : 'PENDING';
  
  // Key price levels
  const keyLevels = calculateKeyLevels(highs, lows, currentPrice);
  
  if (volumeSpike && strength === 'MODERATE') {
    strength = 'STRONG';
    probability += 10;
  }
  
  return {
    pattern,
    direction,
    strength,
    probability: Math.min(probability, 90),
    support: support.toFixed(2),
    resistance: resistance.toFixed(2),
    pivot: pivot.toFixed(2),
    breakoutLevel: breakoutLevel.toFixed(2),
    target: target.toFixed(2),
    description: `${pattern} detected with ${direction.toLowerCase()} bias`,
    analysis: `${pattern} shows ${strength.toLowerCase()} ${direction.toLowerCase()} potential. ${breakoutPrediction}. Key level at $${breakoutLevel.toFixed(2)} with target around $${target.toFixed(2)}. Volume ${volumeConfirmation.toLowerCase()}.`,
    signals: {
      volumeConfirmation,
      priceAction: direction,
      keyLevel: `$${breakoutLevel.toFixed(2)}`,
      riskLevel: strength === 'STRONG' ? 'LOW' : strength === 'MODERATE' ? 'MEDIUM' : 'HIGH',
      breakoutPrediction,
      keyLevels: keyLevels
    }
  };
}

function detectHeadAndShoulders(highs: number[], lows: number[]): boolean {
  if (highs.length < 15) return false;
  
  // Look for three peaks with middle peak being highest
  const peaks = findPeaks(highs);
  if (peaks.length < 3) return false;
  
  const [leftShoulder, head, rightShoulder] = peaks.slice(0, 3);
  return head.value > leftShoulder.value && head.value > rightShoulder.value &&
         Math.abs(leftShoulder.value - rightShoulder.value) < head.value * 0.02;
}

function detectInverseHeadAndShoulders(highs: number[], lows: number[]): boolean {
  if (lows.length < 15) return false;
  
  // Look for three troughs with middle trough being lowest
  const troughs = findTroughs(lows);
  if (troughs.length < 3) return false;
  
  const [leftShoulder, head, rightShoulder] = troughs.slice(0, 3);
  return head.value < leftShoulder.value && head.value < rightShoulder.value &&
         Math.abs(leftShoulder.value - rightShoulder.value) < head.value * 0.02;
}

function detectAscendingTriangle(highs: number[], lows: number[], currentPrice: number): boolean {
  const resistanceLevel = Math.max(...highs.slice(0, 8));
  const recentLows = lows.slice(0, 8);
  
  // Check for horizontal resistance and rising support
  const resistanceHits = highs.filter(h => Math.abs(h - resistanceLevel) < currentPrice * 0.005).length;
  const risingSupport = recentLows.slice(0, 5).every((low, i, arr) => i === 0 || low >= arr[i-1] * 0.998);
  
  return resistanceHits >= 2 && risingSupport;
}

function detectDescendingTriangle(highs: number[], lows: number[], currentPrice: number): boolean {
  const supportLevel = Math.min(...lows.slice(0, 8));
  const recentHighs = highs.slice(0, 8);
  
  // Check for horizontal support and falling resistance
  const supportHits = lows.filter(l => Math.abs(l - supportLevel) < currentPrice * 0.005).length;
  const fallingResistance = recentHighs.slice(0, 5).every((high, i, arr) => i === 0 || high <= arr[i-1] * 1.002);
  
  return supportHits >= 2 && fallingResistance;
}

function detectSymmetricalTriangle(highs: number[], lows: number[]): boolean {
  if (highs.length < 10 || lows.length < 10) return false;
  
  const recentHighs = highs.slice(0, 8);
  const recentLows = lows.slice(0, 8);
  
  // Check for converging trend lines
  const fallingResistance = recentHighs.slice(0, 4).every((high, i, arr) => i === 0 || high <= arr[i-1] * 1.005);
  const risingSupport = recentLows.slice(0, 4).every((low, i, arr) => i === 0 || low >= arr[i-1] * 0.995);
  
  return fallingResistance && risingSupport;
}

function detectDoubleTop(highs: number[], currentPrice: number): boolean {
  const peaks = findPeaks(highs);
  if (peaks.length < 2) return false;
  
  const [peak1, peak2] = peaks;
  return Math.abs(peak1.value - peak2.value) < currentPrice * 0.008 && 
         peak1.index < peak2.index;
}

function detectDoubleBottom(lows: number[], currentPrice: number): boolean {
  const troughs = findTroughs(lows);
  if (troughs.length < 2) return false;
  
  const [trough1, trough2] = troughs;
  return Math.abs(trough1.value - trough2.value) < currentPrice * 0.008 && 
         trough1.index < trough2.index;
}

function detectBullFlag(closes: number[], volumes: number[]): boolean {
  if (closes.length < 10) return false;
  
  // Check for strong upward move followed by consolidation
  const strongMove = closes[5] > closes[9] * 1.02; // 2% move
  const consolidation = Math.abs(closes[0] - closes[4]) < closes[0] * 0.01; // 1% range
  
  return strongMove && consolidation;
}

function detectBearFlag(closes: number[], volumes: number[]): boolean {
  if (closes.length < 10) return false;
  
  // Check for strong downward move followed by consolidation
  const strongMove = closes[5] < closes[9] * 0.98; // 2% move down
  const consolidation = Math.abs(closes[0] - closes[4]) < closes[0] * 0.01; // 1% range
  
  return strongMove && consolidation;
}

function findPeaks(data: number[]): {value: number, index: number}[] {
  const peaks = [];
  for (let i = 1; i < data.length - 1; i++) {
    if (data[i] > data[i-1] && data[i] > data[i+1]) {
      peaks.push({value: data[i], index: i});
    }
  }
  return peaks.sort((a, b) => b.value - a.value);
}

function findTroughs(data: number[]): {value: number, index: number}[] {
  const troughs = [];
  for (let i = 1; i < data.length - 1; i++) {
    if (data[i] < data[i-1] && data[i] < data[i+1]) {
      troughs.push({value: data[i], index: i});
    }
  }
  return troughs.sort((a, b) => a.value - b.value);
}

function calculateKeyLevels(highs: number[], lows: number[], currentPrice: number): string[] {
  const allLevels = [...highs, ...lows];
  const levels = [];
  
  // Find significant levels within 5% of current price
  const range = currentPrice * 0.05;
  const nearbyLevels = allLevels.filter(level => 
    Math.abs(level - currentPrice) <= range && level !== currentPrice
  );
  
  // Remove duplicates and sort
  const uniqueLevels = [...new Set(nearbyLevels)]
    .sort((a, b) => Math.abs(a - currentPrice) - Math.abs(b - currentPrice))
    .slice(0, 5);
  
  return uniqueLevels.map(level => `$${level.toFixed(2)}`);
}
