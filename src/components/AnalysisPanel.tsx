
import { useEffect, useState } from 'react';

interface AnalysisPanelProps {
  symbol: string;
  timeframe: string;
}

interface TechnicalIndicators {
  rsi: number;
  macd: number;
  ema8: number;
  ema21: number;
  volume: string;
  vwap: number;
  atr: number;
}

const AnalysisPanel = ({ symbol, timeframe }: AnalysisPanelProps) => {
  const [indicators, setIndicators] = useState<TechnicalIndicators>({
    rsi: 0,
    macd: 0,
    ema8: 0,
    ema21: 0,
    volume: 'neutral',
    vwap: 0,
    atr: 0
  });

  useEffect(() => {
    // Simulate technical indicators
    const mockIndicators: TechnicalIndicators = {
      rsi: 30 + Math.random() * 40,
      macd: (Math.random() - 0.5) * 2,
      ema8: 145 + Math.random() * 10,
      ema21: 140 + Math.random() * 15,
      volume: Math.random() > 0.5 ? 'above' : 'below',
      vwap: 148 + Math.random() * 8,
      atr: 1 + Math.random() * 3
    };
    
    setIndicators(mockIndicators);
  }, [symbol, timeframe]);

  const getRSIStatus = (rsi: number) => {
    if (rsi < 30) return { text: 'Oversold', class: 'indicator-positive' };
    if (rsi > 70) return { text: 'Overbought', class: 'indicator-negative' };
    return { text: 'Neutral', class: 'indicator-neutral' };
  };

  const getMACDStatus = (macd: number) => {
    if (macd > 0) return { text: 'Bullish', class: 'indicator-positive' };
    if (macd < 0) return { text: 'Bearish', class: 'indicator-negative' };
    return { text: 'Neutral', class: 'indicator-neutral' };
  };

  const getEMACrossover = () => {
    if (indicators.ema8 > indicators.ema21) {
      return { text: 'Bullish Cross', class: 'indicator-positive' };
    }
    return { text: 'Bearish Cross', class: 'indicator-negative' };
  };

  const rsiStatus = getRSIStatus(indicators.rsi);
  const macdStatus = getMACDStatus(indicators.macd);
  const emaStatus = getEMACrossover();

  return (
    <div className="p-4 border-b border-slate-700 custom-scrollbar overflow-y-auto">
      <h3 className="text-lg font-semibold mb-4 text-slate-200">Technical Analysis</h3>
      
      <div className="space-y-4">
        <div className="bg-slate-700 rounded-lg p-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-slate-300 text-sm">RSI (14)</span>
            <span className={`text-xs px-2 py-1 rounded ${rsiStatus.class}`}>
              {rsiStatus.text}
            </span>
          </div>
          <div className="text-white font-semibold">{indicators.rsi.toFixed(1)}</div>
        </div>

        <div className="bg-slate-700 rounded-lg p-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-slate-300 text-sm">MACD</span>
            <span className={`text-xs px-2 py-1 rounded ${macdStatus.class}`}>
              {macdStatus.text}
            </span>
          </div>
          <div className="text-white font-semibold">{indicators.macd.toFixed(3)}</div>
        </div>

        <div className="bg-slate-700 rounded-lg p-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-slate-300 text-sm">EMA Cross</span>
            <span className={`text-xs px-2 py-1 rounded ${emaStatus.class}`}>
              {emaStatus.text}
            </span>
          </div>
          <div className="text-xs text-slate-400">
            EMA8: {indicators.ema8.toFixed(2)} | EMA21: {indicators.ema21.toFixed(2)}
          </div>
        </div>

        <div className="bg-slate-700 rounded-lg p-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-slate-300 text-sm">Volume</span>
            <span className={`text-xs px-2 py-1 rounded ${
              indicators.volume === 'above' ? 'indicator-positive' : 'indicator-negative'
            }`}>
              {indicators.volume === 'above' ? 'Above Avg' : 'Below Avg'}
            </span>
          </div>
        </div>

        <div className="bg-slate-700 rounded-lg p-3">
          <div className="text-slate-300 text-sm mb-1">VWAP</div>
          <div className="text-white font-semibold">${indicators.vwap.toFixed(2)}</div>
        </div>

        <div className="bg-slate-700 rounded-lg p-3">
          <div className="text-slate-300 text-sm mb-1">ATR (14)</div>
          <div className="text-white font-semibold">{indicators.atr.toFixed(2)}</div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisPanel;
