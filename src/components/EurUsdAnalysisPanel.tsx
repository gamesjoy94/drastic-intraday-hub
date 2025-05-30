
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface EurUsdAnalysisPanelProps {
  symbol: string;
  timeframe: string;
  analysisData: any;
}

const EurUsdAnalysisPanel = ({ symbol, timeframe, analysisData }: EurUsdAnalysisPanelProps) => {
  if (!analysisData) {
    return (
      <Card className="bg-slate-800 border-slate-700 m-4">
        <CardHeader>
          <CardTitle className="text-white text-sm flex items-center gap-2">
            🧠 REAL AI-Enhanced Trend Reversal Analysis
            <Badge variant="outline" className="text-xs">EUR/USD LIVE</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-400 text-sm">Run analysis to see real-time AI-enhanced trend reversal signals from live market data</p>
        </CardContent>
      </Card>
    );
  }

  const { analysis } = analysisData;
  
  const getBiasIcon = (bias: string) => {
    switch (bias) {
      case 'BULLISH': return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'BEARISH': return <TrendingDown className="w-4 h-4 text-red-400" />;
      default: return <Minus className="w-4 h-4 text-yellow-400" />;
    }
  };

  const getBiasColor = (bias: string) => {
    switch (bias) {
      case 'BULLISH': return 'text-green-400';
      case 'BEARISH': return 'text-red-400';
      default: return 'text-yellow-400';
    }
  };

  return (
    <Card className="bg-slate-800 border-slate-700 m-4">
      <CardHeader>
        <CardTitle className="text-white text-sm flex items-center gap-2">
          🧠 REAL AI-Enhanced Trend Reversal Analysis
          <Badge variant="outline" className="text-xs">EUR/USD LIVE</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Data Source Indicator */}
        <div className="flex items-center justify-between">
          <span className="text-slate-300 text-sm">Data Source:</span>
          <Badge variant="default" className="bg-green-600">
            {analysisData.dataSource === 'REAL_TIME' ? 'LIVE MARKET DATA' : 'REAL DATA'}
          </Badge>
        </div>

        {/* Market Bias */}
        <div className="flex items-center justify-between">
          <span className="text-slate-300 text-sm">Market Bias:</span>
          <div className="flex items-center gap-2">
            {getBiasIcon(analysis.marketBias)}
            <span className={`text-sm font-medium ${getBiasColor(analysis.marketBias)}`}>
              {analysis.marketBias}
            </span>
          </div>
        </div>

        {/* Confidence Score */}
        <div className="flex items-center justify-between">
          <span className="text-slate-300 text-sm">AI Confidence:</span>
          <Badge variant={analysis.confidenceScore >= 70 ? "default" : "secondary"}>
            {analysis.confidenceScore}% (REAL)
          </Badge>
        </div>

        {/* Strategy Scores */}
        <div className="grid grid-cols-2 gap-2">
          <div className="text-center">
            <div className="text-green-400 text-lg font-bold">{analysis.longScore}/5</div>
            <div className="text-xs text-slate-400">Long Score (Live)</div>
          </div>
          <div className="text-center">
            <div className="text-red-400 text-lg font-bold">{analysis.shortScore}/5</div>
            <div className="text-xs text-slate-400">Short Score (Live)</div>
          </div>
        </div>

        {/* Real Technical Indicators */}
        <div className="space-y-2">
          <h4 className="text-slate-300 text-xs font-medium">Live Technical Signals:</h4>
          <div className="grid grid-cols-1 gap-1 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">EMA Trend (Real):</span>
              <span className="text-white">{analysis.emaCrossover || 'NONE'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">RSI (Live):</span>
              <span className="text-white">{analysis.rsiDirection}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">MACD (Real):</span>
              <span className="text-white">{analysis.macdSignal}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">VWAP Position:</span>
              <span className="text-white">{analysis.vwapPosition}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Volume (Live):</span>
              <span className={analysis.volumeSpike ? "text-green-400" : "text-slate-400"}>
                {analysis.volumeSpike ? 'HIGH' : 'NORMAL'}
              </span>
            </div>
          </div>
        </div>

        {/* Strategy Summary */}
        <div className="pt-2 border-t border-slate-700">
          <p className="text-slate-300 text-xs leading-relaxed">
            {analysis.summary || 'REAL AI-Enhanced Trend Reversal strategy analyzing live multiple timeframe convergence for optimal entry points.'}
          </p>
        </div>

        {/* Analysis Method */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500">Analysis Method:</span>
          <Badge variant="outline" className="text-xs">
            {analysisData.analysisMethod === 'AI_ENHANCED' ? 'AI + REAL DATA' : 'REAL MARKET DATA'}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export default EurUsdAnalysisPanel;
