
import { TechnicalData, EurUsdTrendAnalysis } from './types.ts';
import { calculateAdvancedTechnicalSignals, AdvancedTechnicalSignals } from './advancedTechnicalAnalyzer.ts';

export function analyzeEurUsdTrendReversal(data: TechnicalData, currentPrice: number): EurUsdTrendAnalysis {
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
  const atr = data.atr[0] || 0;

  // Get advanced technical signals
  const advancedSignals = calculateAdvancedTechnicalSignals(data, currentPrice);
  
  // Enhanced EUR/USD specific analysis
  const sessionAnalysis = analyzeForexSession();
  const currencyStrengthAnalysis = analyzeCurrencyStrength(data, currentPrice);
  
  // Core trend reversal conditions
  const ema8AboveEma21 = ema8 > ema21;
  const ema8BelowEma21 = ema8 < ema21;
  const emaCrossover = (ema8 > ema21 && ema8Prev <= ema21Prev) ? 'BULLISH' : 
                      (ema8 < ema21 && ema8Prev >= ema21Prev) ? 'BEARISH' : 'NONE';
  
  // Enhanced RSI analysis
  const rsiOversold = rsi < 30;
  const rsiOverbought = rsi > 70;
  const rsiDivergence = detectRSIDivergence(data);
  const rsiDirection = rsi > rsiPrev ? 'RISING' : rsi < rsiPrev ? 'FALLING' : 'NEUTRAL';
  
  // Enhanced MACD analysis
  const macdBullish = macdHist > 0 && macdHist > macdHistPrev;
  const macdBearish = macdHist < 0 && macdHist < macdHistPrev;
  const macdSignal = macdBullish ? 'BULLISH' : macdBearish ? 'BEARISH' : 'NEUTRAL';
  
  // Enhanced volume analysis
  const volumeSpike = volume > avgVolume * 1.3;
  const volumeConfirmation = advancedSignals.volumeAnalysis.volumeConfirmation;
  
  // VWAP analysis
  const priceAboveVwap = currentPrice > vwap;
  const priceBelowVwap = currentPrice < vwap;
  const vwapPosition = priceAboveVwap ? 'ABOVE' : 'BELOW';
  
  // Multi-timeframe confluence
  const multitimeframeSignal = analyzeMultitimeframeConfluence(advancedSignals);
  
  // Enhanced scoring system with advanced signals
  let longScore = 0;
  let shortScore = 0;
  
  // Basic signals
  if (ema8AboveEma21) longScore += 1;
  if (ema8BelowEma21) shortScore += 1;
  if (emaCrossover === 'BULLISH') longScore += 2;
  if (emaCrossover === 'BEARISH') shortScore += 2;
  
  // RSI signals
  if (rsiOversold && rsi > rsiPrev) longScore += 2;
  if (rsiOverbought && rsi < rsiPrev) shortScore += 2;
  if (rsiDivergence === 'BULLISH') longScore += 1;
  if (rsiDivergence === 'BEARISH') shortScore += 1;
  
  // MACD signals
  if (macdBullish) longScore += 1;
  if (macdBearish) shortScore += 1;
  
  // Volume confirmation
  if (volumeConfirmation) {
    if (priceAboveVwap) longScore += 1;
    if (priceBelowVwap) shortScore += 1;
  }
  
  // Advanced technical signals
  if (advancedSignals.stochasticOscillator.signal === 'BULLISH') longScore += 1;
  if (advancedSignals.stochasticOscillator.signal === 'BEARISH') shortScore += 1;
  
  if (advancedSignals.ichimokuCloud.signal === 'BULLISH') longScore += 2;
  if (advancedSignals.ichimokuCloud.signal === 'BEARISH') shortScore += 2;
  
  if (advancedSignals.bollingerBands.position === 'BELOW_LOWER') longScore += 1;
  if (advancedSignals.bollingerBands.position === 'ABOVE_UPPER') shortScore += 1;
  
  if (advancedSignals.fibonacci.nearKeyLevel) {
    longScore += 1;
    shortScore += 1; // Key levels can be both support and resistance
  }
  
  // Market structure analysis
  if (advancedSignals.marketStructure.trend === 'STRONG_BULLISH') longScore += 2;
  if (advancedSignals.marketStructure.trend === 'BULLISH') longScore += 1;
  if (advancedSignals.marketStructure.trend === 'STRONG_BEARISH') shortScore += 2;
  if (advancedSignals.marketStructure.trend === 'BEARISH') shortScore += 1;
  
  // Session-based adjustments
  if (sessionAnalysis.isHighVolatilitySession) {
    longScore += sessionAnalysis.sessionBias === 'BULLISH' ? 1 : 0;
    shortScore += sessionAnalysis.sessionBias === 'BEARISH' ? 1 : 0;
  }
  
  // Currency strength analysis
  longScore += currencyStrengthAnalysis.eurStrength > currencyStrengthAnalysis.usdStrength ? 1 : 0;
  shortScore += currencyStrengthAnalysis.usdStrength > currencyStrengthAnalysis.eurStrength ? 1 : 0;
  
  const maxScore = 15; // Increased max score with new signals
  const marketBias = longScore > shortScore ? 'BULLISH' : shortScore > longScore ? 'BEARISH' : 'NEUTRAL';
  const confidenceScore = Math.min(95, Math.max(longScore, shortScore) * (100 / maxScore));
  
  const summary = `ENHANCED EUR/USD AI Trend Reversal: ${marketBias} bias (${confidenceScore.toFixed(1)}% confidence). 
                   Advanced signals: ${advancedSignals.ichimokuCloud.signal} Ichimoku, ${advancedSignals.stochasticOscillator.signal} Stochastic, 
                   ${advancedSignals.marketStructure.trend} structure. Multi-timeframe: ${multitimeframeSignal}. 
                   Session: ${sessionAnalysis.currentSession} (${sessionAnalysis.sessionBias}). 
                   Currency Strength: EUR ${currencyStrengthAnalysis.eurStrength.toFixed(1)} vs USD ${currencyStrengthAnalysis.usdStrength.toFixed(1)}.`;
  
  return {
    ema8AboveEma21,
    ema8BelowEma21,
    emaCrossover,
    rsiLongCondition: rsiOversold && rsi > rsiPrev,
    rsiShortCondition: rsiOverbought && rsi < rsiPrev,
    rsiDirection,
    rsiDivergence,
    macdBullish,
    macdBearish,
    macdSignal,
    volumeSpike,
    volumeConfirmation,
    priceAboveVwap,
    priceBelowVwap,
    vwapPosition,
    longScore,
    shortScore,
    marketBias,
    confidenceScore,
    summary,
    // Enhanced properties
    advancedSignals,
    sessionAnalysis,
    currencyStrengthAnalysis,
    multitimeframeSignal,
    indicators: {
      ema: `${ema8.toFixed(5)} / ${ema21.toFixed(5)}`,
      rsi: `${rsi.toFixed(1)} (${rsiDirection})`,
      macd: `${macdSignal}`,
      volume: volumeSpike ? 'HIGH' : 'NORMAL',
      vwap: vwapPosition,
      stochastic: `${advancedSignals.stochasticOscillator.k.toFixed(1)}/${advancedSignals.stochasticOscillator.d.toFixed(1)}`,
      bollinger: advancedSignals.bollingerBands.position,
      ichimoku: advancedSignals.ichimokuCloud.signal,
      fibonacci: advancedSignals.fibonacci.nearKeyLevel ? 'NEAR_KEY_LEVEL' : 'BETWEEN_LEVELS'
    }
  };
}

function detectRSIDivergence(data: TechnicalData): 'BULLISH' | 'BEARISH' | 'NONE' {
  const prices = data.ohlcv.slice(0, 10).map(c => parseFloat(c.close));
  const rsiValues = data.rsi.slice(0, 10);
  
  if (prices.length < 6 || rsiValues.length < 6) return 'NONE';
  
  const recentPrices = prices.slice(0, 3);
  const olderPrices = prices.slice(3, 6);
  const recentRSI = rsiValues.slice(0, 3);
  const olderRSI = rsiValues.slice(3, 6);
  
  const priceDirection = Math.max(...recentPrices) - Math.max(...olderPrices);
  const rsiDirection = Math.max(...recentRSI) - Math.max(...olderRSI);
  
  if (priceDirection > 0 && rsiDirection < 0) return 'BEARISH';
  if (priceDirection < 0 && rsiDirection > 0) return 'BULLISH';
  
  return 'NONE';
}

function analyzeForexSession() {
  const now = new Date();
  const utcHour = now.getUTCHours();
  
  let currentSession = 'ASIAN';
  let isHighVolatilitySession = false;
  let sessionBias: 'BULLISH' | 'BEARISH' | 'NEUTRAL' = 'NEUTRAL';
  
  if (utcHour >= 0 && utcHour < 8) {
    currentSession = 'ASIAN';
    isHighVolatilitySession = false;
    sessionBias = 'NEUTRAL'; // Asian session typically ranges
  } else if (utcHour >= 8 && utcHour < 16) {
    currentSession = 'LONDON';
    isHighVolatilitySession = true;
    sessionBias = 'BULLISH'; // London session often bullish for EUR
  } else {
    currentSession = 'NEW_YORK';
    isHighVolatilitySession = true;
    sessionBias = 'BEARISH'; // NY session often bearish for EUR (USD strength)
  }
  
  return {
    currentSession,
    isHighVolatilitySession,
    sessionBias,
    utcHour
  };
}

function analyzeCurrencyStrength(data: TechnicalData, currentPrice: number) {
  // Simplified currency strength analysis based on momentum
  const priceChange = ((currentPrice - parseFloat(data.ohlcv[1].close)) / parseFloat(data.ohlcv[1].close)) * 100;
  const rsiMomentum = data.rsi[0] - 50;
  const volumeStrength = data.volume[0] / (data.volume.slice(0, 10).reduce((sum, v) => sum + v, 0) / 10);
  
  // EUR strength calculation
  const eurStrength = 50 + (priceChange * 2) + (rsiMomentum * 0.3) + ((volumeStrength - 1) * 10);
  
  // USD strength (inverse of EUR for EUR/USD pair)
  const usdStrength = 100 - eurStrength;
  
  return {
    eurStrength: Math.max(0, Math.min(100, eurStrength)),
    usdStrength: Math.max(0, Math.min(100, usdStrength)),
    dominantCurrency: eurStrength > usdStrength ? 'EUR' : 'USD',
    strengthDifference: Math.abs(eurStrength - usdStrength)
  };
}

function analyzeMultitimeframeConfluence(signals: AdvancedTechnicalSignals): string {
  const confluenceFactors = [];
  
  if (signals.ichimokuCloud.signal !== 'NEUTRAL') {
    confluenceFactors.push(signals.ichimokuCloud.signal);
  }
  
  if (signals.marketStructure.trend !== 'RANGING') {
    confluenceFactors.push(signals.marketStructure.trend.includes('BULLISH') ? 'BULLISH' : 'BEARISH');
  }
  
  if (signals.stochasticOscillator.signal !== 'NEUTRAL') {
    confluenceFactors.push(signals.stochasticOscillator.signal);
  }
  
  const bullishCount = confluenceFactors.filter(f => f === 'BULLISH' || f.includes('BULLISH')).length;
  const bearishCount = confluenceFactors.filter(f => f === 'BEARISH' || f.includes('BEARISH')).length;
  
  if (bullishCount > bearishCount) return 'BULLISH_CONFLUENCE';
  if (bearishCount > bullishCount) return 'BEARISH_CONFLUENCE';
  return 'MIXED_SIGNALS';
}
