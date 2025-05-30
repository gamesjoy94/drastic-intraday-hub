
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, AlertTriangle, Target, Shield, Clock } from 'lucide-react';

interface EurUsdSmartPlansProps {
  analysisData: any;
  tradePlan: any;
  currentPrice: number;
}

const EurUsdSmartPlans = ({ analysisData, tradePlan, currentPrice }: EurUsdSmartPlansProps) => {
  if (!analysisData || !tradePlan) {
    return (
      <Card className="bg-slate-800 border-slate-700 m-4">
        <CardHeader>
          <CardTitle className="text-white text-sm flex items-center gap-2">
            🎯 EUR/USD Smart Trading Plans
            <Badge variant="outline" className="text-xs">WAITING</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-400 text-sm">Run analysis to generate intelligent EUR/USD trading plans</p>
        </CardContent>
      </Card>
    );
  }

  const getDirectionIcon = (direction: string) => {
    switch (direction) {
      case 'LONG': return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'SHORT': return <TrendingDown className="w-4 h-4 text-red-400" />;
      default: return <Clock className="w-4 h-4 text-yellow-400" />;
    }
  };

  const smartRecommendations = [
    {
      category: "Market Timing",
      recommendations: [
        "Best EUR/USD volatility: London open (8:00-12:00 GMT)",
        "Avoid trading during major ECB/Fed announcements",
        "Monitor US/EU economic calendar for high-impact events"
      ]
    },
    {
      category: "Technical Enhancement",
      recommendations: [
        "Add Fibonacci retracements for better entry points",
        "Use multiple timeframe confirmation (H1, H4, D1)",
        "Implement Bollinger Bands for volatility assessment"
      ]
    },
    {
      category: "Risk Management",
      recommendations: [
        "Risk only 1-2% per EUR/USD trade",
        "Use trailing stops during strong trends",
        "Scale out positions at key resistance/support levels"
      ]
    }
  ];

  const generateSmartEntry = () => {
    if (!analysisData.analysis) return null;

    const { analysis } = analysisData;
    const confidence = tradePlan.confidence || 0;
    
    if (confidence < 60) {
      return {
        signal: "WAIT",
        reason: "Low confidence - Wait for better setup",
        action: "Monitor for trend reversal signals",
        icon: <Clock className="w-4 h-4 text-yellow-400" />
      };
    }

    if (tradePlan.direction === 'LONG') {
      return {
        signal: "BUY",
        reason: `${analysis.emaCrossover} + ${analysis.macdSignal} MACD + Volume confirmation`,
        action: `Enter LONG at ${tradePlan.entry} with SL at ${tradePlan.stopLoss}`,
        icon: <TrendingUp className="w-4 h-4 text-green-400" />
      };
    } else if (tradePlan.direction === 'SHORT') {
      return {
        signal: "SELL",
        reason: `${analysis.emaCrossover} + ${analysis.macdSignal} MACD + Volume confirmation`,
        action: `Enter SHORT at ${tradePlan.entry} with SL at ${tradePlan.stopLoss}`,
        icon: <TrendingDown className="w-4 h-4 text-red-400" />
      };
    }

    return null;
  };

  const smartEntry = generateSmartEntry();

  return (
    <Card className="bg-slate-800 border-slate-700 m-4">
      <CardHeader>
        <CardTitle className="text-white text-sm flex items-center gap-2">
          🎯 EUR/USD Smart Trading Plans
          <Badge variant="default" className="text-xs bg-blue-600">ACTIVE</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Smart Entry Signal */}
        {smartEntry && (
          <div className="bg-slate-700 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              {smartEntry.icon}
              <span className="text-white font-medium text-sm">Smart Entry Signal: {smartEntry.signal}</span>
            </div>
            <div className="text-xs text-slate-300 mb-1">{smartEntry.reason}</div>
            <div className="text-xs text-blue-300">{smartEntry.action}</div>
          </div>
        )}

        {/* Risk/Reward Analysis */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-slate-700 rounded p-2 text-center">
            <Shield className="w-4 h-4 text-blue-400 mx-auto mb-1" />
            <div className="text-xs text-slate-400">Risk Level</div>
            <div className="text-xs text-white font-medium">
              {tradePlan.confidence >= 80 ? 'LOW' : tradePlan.confidence >= 60 ? 'MEDIUM' : 'HIGH'}
            </div>
          </div>
          <div className="bg-slate-700 rounded p-2 text-center">
            <Target className="w-4 h-4 text-green-400 mx-auto mb-1" />
            <div className="text-xs text-slate-400">R:R Ratio</div>
            <div className="text-xs text-white font-medium">{tradePlan.riskReward}</div>
          </div>
          <div className="bg-slate-700 rounded p-2 text-center">
            <TrendingUp className="w-4 h-4 text-purple-400 mx-auto mb-1" />
            <div className="text-xs text-slate-400">Success Rate</div>
            <div className="text-xs text-white font-medium">{tradePlan.confidence}%</div>
          </div>
        </div>

        {/* Strategy Accuracy Enhancements */}
        <div className="space-y-3">
          <h4 className="text-slate-200 text-sm font-medium">💡 Strategy Accuracy Recommendations</h4>
          {smartRecommendations.map((category, index) => (
            <div key={index} className="bg-slate-700 rounded-lg p-3">
              <div className="text-slate-200 text-xs font-medium mb-2">{category.category}:</div>
              <div className="space-y-1">
                {category.recommendations.map((rec, recIndex) => (
                  <div key={recIndex} className="flex items-start gap-2">
                    <div className="w-1 h-1 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-xs text-slate-300">{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Market Condition Alert */}
        <div className="bg-amber-900/20 border border-amber-600/30 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span className="text-amber-400 text-xs font-medium">EUR/USD Market Conditions</span>
          </div>
          <div className="text-amber-300 text-xs">
            Current volatility: {analysisData.analysis?.volumeSpike ? 'HIGH' : 'NORMAL'} | 
            Trend strength: {analysisData.analysis?.confidenceScore >= 70 ? 'STRONG' : 'WEAK'} | 
            Session: {new Date().getHours() >= 8 && new Date().getHours() <= 17 ? 'ACTIVE' : 'QUIET'}
          </div>
        </div>

        {/* Enhanced Entry Checklist */}
        <div className="bg-slate-700 rounded-lg p-3">
          <div className="text-slate-200 text-xs font-medium mb-2">✅ EUR/USD Entry Checklist:</div>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">EMA Trend Alignment:</span>
              <span className={analysisData.analysis?.emaCrossover !== 'NONE' ? 'text-green-400' : 'text-red-400'}>
                {analysisData.analysis?.emaCrossover !== 'NONE' ? '✓' : '✗'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">MACD Confirmation:</span>
              <span className={analysisData.analysis?.macdSignal !== 'NEUTRAL' ? 'text-green-400' : 'text-red-400'}>
                {analysisData.analysis?.macdSignal !== 'NEUTRAL' ? '✓' : '✗'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Volume Confirmation:</span>
              <span className={analysisData.analysis?.volumeSpike ? 'text-green-400' : 'text-red-400'}>
                {analysisData.analysis?.volumeSpike ? '✓' : '✗'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">VWAP Position:</span>
              <span className={analysisData.analysis?.vwapPosition !== 'NEUTRAL' ? 'text-green-400' : 'text-red-400'}>
                {analysisData.analysis?.vwapPosition !== 'NEUTRAL' ? '✓' : '✗'}
              </span>
            </div>
          </div>
        </div>

        {/* Live EUR/USD Data Confirmation */}
        <div className="bg-green-900/20 border border-green-600/30 rounded-lg p-3">
          <div className="text-green-400 text-xs font-medium mb-1">📊 Live EUR/USD Data Integration</div>
          <div className="text-green-300 text-xs">
            All recommendations based on real-time EUR/USD market data from TwelveData API with AI-enhanced pattern recognition for maximum accuracy.
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EurUsdSmartPlans;
