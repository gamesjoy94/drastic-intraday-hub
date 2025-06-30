
export interface TechnicalData {
  ema8: number[];
  ema21: number[];
  rsi: number[];
  macd: number[];
  macdSignal: number[];
  macdHistogram: number[];
  volume: number[];
  vwap: number[];
  atr: number[];
  ohlcv: any[];
}

export interface EurUsdTrendAnalysis {
  ema8AboveEma21: boolean;
  ema8BelowEma21: boolean;
  emaCrossover: 'BULLISH' | 'BEARISH' | 'NONE';
  rsiLongCondition: boolean;
  rsiShortCondition: boolean;
  rsiDirection: 'RISING' | 'FALLING' | 'NEUTRAL';
  rsiDivergence: 'BULLISH' | 'BEARISH' | 'NONE';
  macdBullish: boolean;
  macdBearish: boolean;
  macdSignal: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  volumeSpike: boolean;
  volumeConfirmation: boolean;
  priceAboveVwap: boolean;
  priceBelowVwap: boolean;
  vwapPosition: 'ABOVE' | 'BELOW';
  longScore: number;
  shortScore: number;
  marketBias: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  confidenceScore: number;
  summary: string;
  // Enhanced properties
  advancedSignals?: any;
  sessionAnalysis?: {
    currentSession: string;
    isHighVolatilitySession: boolean;
    sessionBias: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
    utcHour: number;
  };
  currencyStrengthAnalysis?: {
    eurStrength: number;
    usdStrength: number;
    dominantCurrency: 'EUR' | 'USD';
    strengthDifference: number;
  };
  multitimeframeSignal?: string;
  indicators: {
    ema: string;
    rsi: string;
    macd: string;
    volume: string;
    vwap: string;
    stochastic?: string;
    bollinger?: string;
    ichimoku?: string;
    fibonacci?: string;
  };
}

export interface PatternData {
  pattern: string;
  direction: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  strength: 'WEAK' | 'MEDIUM' | 'STRONG';
  probability: number;
  support: string;
  resistance: string;
  pivot: string;
  breakoutLevel: string;
  target: string;
  description: string;
  analysis: string;
  volatility: {
    current: number;
    average: number;
    percentile: 'HIGH' | 'MEDIUM' | 'LOW';
    trend: 'INCREASING' | 'DECREASING';
  };
  riskMetrics: {
    riskRewardRatio: string;
    positionSize: string;
    maxRisk: string;
    stopLossDistance: string;
    takeProfitDistance: string;
  };
  correlation: {
    goldSilverCorr: number;
    goldDxyCorr: number;
    goldSpyCorr: number;
    goldBondCorr: number;
    correlationSignal: string;
  };
  signals: {
    volumeConfirmation: string;
    priceAction: string;
    keyLevel: string;
    riskLevel: string;
  };
}
