
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

export interface SmartMomentumAnalysis {
  ema8AboveEma21: boolean;
  ema8BelowEma21: boolean;
  emaCrossover: string;
  rsiLongCondition: boolean;
  rsiShortCondition: boolean;
  rsiDirection: string;
  macdBullish: boolean;
  macdBearish: boolean;
  macdSignal: string;
  volumeSpike: boolean;
  priceAboveVwap: boolean;
  priceBelowVwap: boolean;
  vwapPosition: string;
  longScore: number;
  shortScore: number;
  marketBias: string;
  confidenceScore: number;
  summary: string;
  indicators: {
    ema: string;
    rsi: string;
    macd: string;
    volume: string;
    vwap: string;
  };
}

export interface PatternData {
  pattern: string;
  direction: string;
  strength: string;
  probability: number;
  support: string;
  resistance: string;
  pivot: string;
  breakoutLevel: string;
  target: string;
  description: string;
  analysis: string;
  signals: {
    volumeConfirmation: string;
    priceAction: string;
    keyLevel: string;
    riskLevel: string;
  };
}
