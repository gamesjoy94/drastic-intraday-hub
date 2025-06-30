
import { TechnicalData } from './types.ts';

export interface AdvancedTechnicalSignals {
  stochasticOscillator: {
    k: number;
    d: number;
    signal: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  };
  bollingerBands: {
    upper: number;
    middle: number;
    lower: number;
    position: 'ABOVE_UPPER' | 'ABOVE_MIDDLE' | 'BELOW_MIDDLE' | 'BELOW_LOWER';
    squeeze: boolean;
  };
  fibonacci: {
    levels: number[];
    currentLevel: string;
    nearKeyLevel: boolean;
  };
  ichimokuCloud: {
    tenkanSen: number;
    kijunSen: number;
    senkouSpanA: number;
    senkouSpanB: number;
    cloudPosition: 'ABOVE' | 'BELOW' | 'INSIDE';
    signal: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  };
  marketStructure: {
    trend: 'STRONG_BULLISH' | 'BULLISH' | 'RANGING' | 'BEARISH' | 'STRONG_BEARISH';
    swingHighs: number[];
    swingLows: number[];
    keyLevels: number[];
  };
  volumeAnalysis: {
    volumeTrend: 'INCREASING' | 'DECREASING' | 'STABLE';
    volumeProfile: 'HIGH' | 'MEDIUM' | 'LOW';
    volumeConfirmation: boolean;
  };
}

export function calculateAdvancedTechnicalSignals(
  technicalData: TechnicalData,
  currentPrice: number
): AdvancedTechnicalSignals {
  const { ohlcv, volume, rsi, ema8, ema21 } = technicalData;
  
  // Calculate Stochastic Oscillator
  const stochastic = calculateStochastic(ohlcv, 14);
  
  // Calculate Bollinger Bands
  const bollingerBands = calculateBollingerBands(ohlcv, 20, 2);
  
  // Calculate Fibonacci levels
  const fibonacci = calculateFibonacciLevels(ohlcv, currentPrice);
  
  // Calculate Ichimoku Cloud
  const ichimoku = calculateIchimokuCloud(ohlcv);
  
  // Analyze market structure
  const marketStructure = analyzeMarketStructure(ohlcv);
  
  // Advanced volume analysis
  const volumeAnalysis = analyzeVolumeProfile(volume);
  
  return {
    stochasticOscillator: stochastic,
    bollingerBands,
    fibonacci,
    ichimokuCloud: ichimoku,
    marketStructure,
    volumeAnalysis
  };
}

function calculateStochastic(ohlcv: any[], period: number = 14) {
  const highs = ohlcv.slice(0, period).map(c => parseFloat(c.high));
  const lows = ohlcv.slice(0, period).map(c => parseFloat(c.low));
  const closes = ohlcv.slice(0, period).map(c => parseFloat(c.close));
  
  const highestHigh = Math.max(...highs);
  const lowestLow = Math.min(...lows);
  const currentClose = closes[0];
  
  const k = ((currentClose - lowestLow) / (highestHigh - lowestLow)) * 100;
  const d = k * 0.3 + (k * 0.7); // Simplified D calculation
  
  let signal: 'BULLISH' | 'BEARISH' | 'NEUTRAL' = 'NEUTRAL';
  if (k > 80 && d > 80) signal = 'BEARISH';
  else if (k < 20 && d < 20) signal = 'BULLISH';
  
  return { k, d, signal };
}

function calculateBollingerBands(ohlcv: any[], period: number = 20, stdDev: number = 2) {
  const closes = ohlcv.slice(0, period).map(c => parseFloat(c.close));
  const sma = closes.reduce((sum, price) => sum + price, 0) / closes.length;
  
  const variance = closes.reduce((sum, price) => sum + Math.pow(price - sma, 2), 0) / closes.length;
  const standardDeviation = Math.sqrt(variance);
  
  const upper = sma + (standardDeviation * stdDev);
  const lower = sma - (standardDeviation * stdDev);
  const currentPrice = closes[0];
  
  let position: 'ABOVE_UPPER' | 'ABOVE_MIDDLE' | 'BELOW_MIDDLE' | 'BELOW_LOWER';
  if (currentPrice > upper) position = 'ABOVE_UPPER';
  else if (currentPrice > sma) position = 'ABOVE_MIDDLE';
  else if (currentPrice > lower) position = 'BELOW_MIDDLE';
  else position = 'BELOW_LOWER';
  
  const squeeze = (upper - lower) / sma < 0.10; // Band squeeze detection
  
  return {
    upper,
    middle: sma,
    lower,
    position,
    squeeze
  };
}

function calculateFibonacciLevels(ohlcv: any[], currentPrice: number) {
  const prices = ohlcv.slice(0, 50).map(c => parseFloat(c.close));
  const high = Math.max(...prices);
  const low = Math.min(...prices);
  const range = high - low;
  
  const levels = [
    low,
    low + (range * 0.236),
    low + (range * 0.382),
    low + (range * 0.500),
    low + (range * 0.618),
    low + (range * 0.786),
    high
  ];
  
  // Find current level
  let currentLevel = 'BETWEEN_LEVELS';
  let nearKeyLevel = false;
  
  for (let i = 0; i < levels.length; i++) {
    if (Math.abs(currentPrice - levels[i]) < range * 0.01) {
      currentLevel = `FIB_${i}`;
      nearKeyLevel = true;
      break;
    }
  }
  
  return {
    levels,
    currentLevel,
    nearKeyLevel
  };
}

function calculateIchimokuCloud(ohlcv: any[]) {
  const tenkanSen = calculateIchimokuLine(ohlcv, 9);
  const kijunSen = calculateIchimokuLine(ohlcv, 26);
  const senkouSpanA = (tenkanSen + kijunSen) / 2;
  const senkouSpanB = calculateIchimokuLine(ohlcv, 52);
  
  const currentPrice = parseFloat(ohlcv[0].close);
  
  let cloudPosition: 'ABOVE' | 'BELOW' | 'INSIDE';
  if (currentPrice > Math.max(senkouSpanA, senkouSpanB)) {
    cloudPosition = 'ABOVE';
  } else if (currentPrice < Math.min(senkouSpanA, senkouSpanB)) {
    cloudPosition = 'BELOW';
  } else {
    cloudPosition = 'INSIDE';
  }
  
  let signal: 'BULLISH' | 'BEARISH' | 'NEUTRAL' = 'NEUTRAL';
  if (tenkanSen > kijunSen && cloudPosition === 'ABOVE') signal = 'BULLISH';
  else if (tenkanSen < kijunSen && cloudPosition === 'BELOW') signal = 'BEARISH';
  
  return {
    tenkanSen,
    kijunSen,
    senkouSpanA,
    senkouSpanB,
    cloudPosition,
    signal
  };
}

function calculateIchimokuLine(ohlcv: any[], period: number): number {
  const slice = ohlcv.slice(0, period);
  const high = Math.max(...slice.map(c => parseFloat(c.high)));
  const low = Math.min(...slice.map(c => parseFloat(c.low)));
  return (high + low) / 2;
}

function analyzeMarketStructure(ohlcv: any[]) {
  const closes = ohlcv.slice(0, 50).map(c => parseFloat(c.close));
  const highs = ohlcv.slice(0, 50).map(c => parseFloat(c.high));
  const lows = ohlcv.slice(0, 50).map(c => parseFloat(c.low));
  
  // Identify swing highs and lows
  const swingHighs = findSwingPoints(highs, true);
  const swingLows = findSwingPoints(lows, false);
  
  // Determine trend
  const recentCloses = closes.slice(0, 10);
  const olderCloses = closes.slice(10, 20);
  const recentAvg = recentCloses.reduce((sum, p) => sum + p, 0) / recentCloses.length;
  const olderAvg = olderCloses.reduce((sum, p) => sum + p, 0) / olderCloses.length;
  
  const trendStrength = (recentAvg - olderAvg) / olderAvg;
  
  let trend: 'STRONG_BULLISH' | 'BULLISH' | 'RANGING' | 'BEARISH' | 'STRONG_BEARISH';
  if (trendStrength > 0.02) trend = 'STRONG_BULLISH';
  else if (trendStrength > 0.005) trend = 'BULLISH';
  else if (trendStrength < -0.02) trend = 'STRONG_BEARISH';
  else if (trendStrength < -0.005) trend = 'BEARISH';
  else trend = 'RANGING';
  
  const keyLevels = [...swingHighs, ...swingLows].sort((a, b) => b - a);
  
  return {
    trend,
    swingHighs,
    swingLows,
    keyLevels: keyLevels.slice(0, 5) // Top 5 key levels
  };
}

function findSwingPoints(prices: number[], isHigh: boolean): number[] {
  const swingPoints: number[] = [];
  
  for (let i = 2; i < prices.length - 2; i++) {
    if (isHigh) {
      if (prices[i] > prices[i-1] && prices[i] > prices[i+1] && 
          prices[i] > prices[i-2] && prices[i] > prices[i+2]) {
        swingPoints.push(prices[i]);
      }
    } else {
      if (prices[i] < prices[i-1] && prices[i] < prices[i+1] && 
          prices[i] < prices[i-2] && prices[i] < prices[i+2]) {
        swingPoints.push(prices[i]);
      }
    }
  }
  
  return swingPoints;
}

function analyzeVolumeProfile(volume: number[]) {
  const recentVolume = volume.slice(0, 10);
  const averageVolume = volume.slice(0, 30).reduce((sum, v) => sum + v, 0) / 30;
  const currentVolume = volume[0];
  
  let volumeTrend: 'INCREASING' | 'DECREASING' | 'STABLE';
  const volumeChange = (recentVolume[0] - recentVolume[5]) / recentVolume[5];
  
  if (volumeChange > 0.1) volumeTrend = 'INCREASING';
  else if (volumeChange < -0.1) volumeTrend = 'DECREASING';
  else volumeTrend = 'STABLE';
  
  let volumeProfile: 'HIGH' | 'MEDIUM' | 'LOW';
  if (currentVolume > averageVolume * 1.5) volumeProfile = 'HIGH';
  else if (currentVolume < averageVolume * 0.5) volumeProfile = 'LOW';
  else volumeProfile = 'MEDIUM';
  
  const volumeConfirmation = volumeProfile === 'HIGH' && volumeTrend === 'INCREASING';
  
  return {
    volumeTrend,
    volumeProfile,
    volumeConfirmation
  };
}
