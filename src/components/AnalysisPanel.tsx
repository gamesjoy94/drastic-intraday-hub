
import { useEffect, useState } from 'react';

interface AnalysisPanelProps {
  symbol: string;
  timeframe: string;
  analysisData?: any;
}

interface TechnicalIndicators {
  ema8: string;
  ema21: string;
  rsi: string;
  macd: string;
  macdHistogram: string;
  vwap: string;
  atr: string;
  volume: string;
}

const AnalysisPanel = ({ symbol, timeframe, analysisData }: AnalysisPanelProps) => {
  const [indicators, setIndicators] = useState<TechnicalIndicators>({
    ema8: '0.00',
    ema21: '0.00',
    rsi: '50.0',
    macd: '0.0000',
    macdHistogram: '0.0000',
    vwap: '0.00',
    atr: '0.00',
    volume: '0'
  });

  useEffect(() => {
    if (analysisData?.technicalData) {
      setIndicators(analysisData.technicalData);
    } else {
      // Fallback to mock data if no real data available
      const mockIndicators: TechnicalIndicators = {
        ema8: (145 + Math.random() * 10).toFixed(2),
        ema21: (140 + Math.random() * 15).toFixed(2),
        rsi: (30 + Math.random() * 40).toFixed(1),
        macd: ((Math.random() - 0.5) * 2).toFixed(4),
        macdHistogram: ((Math.random() - 0.5) * 1).toFixed(4),
        vwap: (148 + Math.random() * 8).toFixed(2),
        atr: (1 + Math.random() * 3).toFixed(2),
        volume: (Math.random() * 50000000).toFixed(0)
      };
      setIndicators(mockIndicators);
    }
  }, [symbol, timeframe, analysisData]);

  const getRSIStatus = (rsi: string) => {
    const rsiValue = parseFloat(rsi);
    if (rsiValue < 30) return { text: 'Oversold', class: 'indicator-positive' };
    if (rsiValue > 70) return { text: 'Overbought', class: 'indicator-negative' };
    return { text: 'Neutral', class: 'indicator-neutral' };
  };

  const getMACDStatus = (macd: string) => {
    const macdValue = parseFloat(macd);
    if (macdValue > 0) return { text: 'Bullish', class: 'indicator-positive' };
    if (macdValue < 0) return { text: 'Bearish', class: 'indicator-negative' };
    return { text: 'Neutral', class: 'indicator-neutral' };
  };

  const getEMACrossover = () => {
    const ema8Value = parseFloat(indicators.ema8);
    const ema21Value = parseFloat(indicators.ema21);
    if (ema8Value > ema21Value) {
      return { text: 'Bullish Cross', class: 'indicator-positive' };
    }
    return { text: 'Bearish Cross', class: 'indicator-negative' };
  };

  const getMACDHistogramStatus = (hist: string) => {
    const histValue = parseFloat(hist);
    if (histValue > 0) return { text: 'Green', class: 'indicator-positive' };
    if (histValue < 0) return { text: 'Red', class: 'indicator-negative' };
    return { text: 'Neutral', class: 'indicator-neutral' };
  };

  const formatVolume = (volume: string) => {
    const num = parseInt(volume) || 0;
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const rsiStatus = getRSIStatus(indicators.rsi);
  const macdStatus = getMACDStatus(indicators.macd);
  const emaStatus = getEMACrossover();
  const histogramStatus = getMACDHistogramStatus(indicators.macdHistogram);

  return (
    <div className="p-4 border-b border-slate-700 custom-scrollbar overflow-y-auto">
      <h3 className="text-lg font-semibold mb-4 text-slate-200">Smart Momentum Analysis</h3>
      
      <div className="space-y-4">
        <div className="bg-slate-700 rounded-lg p-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-slate-300 text-sm">EMA Crossover</span>
            <span className={`text-xs px-2 py-1 rounded ${emaStatus.class}`}>
              {emaStatus.text}
            </span>
          </div>
          <div className="text-xs text-slate-400">
            EMA8: ${indicators.ema8} | EMA21: ${indicators.ema21}
          </div>
        </div>

        <div className="bg-slate-700 rounded-lg p-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-slate-300 text-sm">RSI (14)</span>
            <span className={`text-xs px-2 py-1 rounded ${rsiStatus.class}`}>
              {rsiStatus.text}
            </span>
          </div>
          <div className="text-foreground font-semibold">{indicators.rsi}</div>
        </div>

        <div className="bg-slate-700 rounded-lg p-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-slate-300 text-sm">MACD</span>
            <span className={`text-xs px-2 py-1 rounded ${macdStatus.class}`}>
              {macdStatus.text}
            </span>
          </div>
          <div className="text-foreground font-semibold">{indicators.macd}</div>
        </div>

        <div className="bg-slate-700 rounded-lg p-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-slate-300 text-sm">MACD Histogram</span>
            <span className={`text-xs px-2 py-1 rounded ${histogramStatus.class}`}>
              {histogramStatus.text}
            </span>
          </div>
          <div className="text-foreground font-semibold">{indicators.macdHistogram}</div>
        </div>

        <div className="bg-slate-700 rounded-lg p-3">
          <div className="text-slate-300 text-sm mb-1">VWAP</div>
          <div className="text-foreground font-semibold">${indicators.vwap}</div>
        </div>

        <div className="bg-slate-700 rounded-lg p-3">
          <div className="text-slate-300 text-sm mb-1">Volume</div>
          <div className="text-foreground font-semibold">{formatVolume(indicators.volume)}</div>
        </div>

        <div className="bg-slate-700 rounded-lg p-3">
          <div className="text-slate-300 text-sm mb-1">ATR (14)</div>
          <div className="text-foreground font-semibold">{indicators.atr}</div>
        </div>

        {/* Strategy Status */}
        <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-3">
          <div className="text-blue-400 text-xs font-medium mb-1">📊 Strategy Status</div>
          <div className="text-blue-300 text-xs">
            {analysisData?.analysis ? 
              `${analysisData.analysis.marketBias} bias detected` : 
              'Analyzing market conditions...'
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisPanel;
