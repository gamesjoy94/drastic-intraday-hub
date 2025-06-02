
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, TrendingUp, TrendingDown, Activity, AlertTriangle, Target, BarChart3, Zap } from 'lucide-react';

interface EurUsdAdvancedAIProps {
  analysisData: any;
  tradePlan: any;
  currentPrice: number;
}

const EurUsdAdvancedAI = ({ analysisData, tradePlan, currentPrice }: EurUsdAdvancedAIProps) => {
  if (!analysisData?.advancedAI) {
    return (
      <Card className="bg-slate-800 border-slate-700 m-4">
        <CardHeader>
          <CardTitle className="text-white text-sm flex items-center gap-2">
            🤖 Advanced AI Analysis
            <Badge variant="outline" className="text-xs">PENDING</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-400 text-sm">Run analysis to activate advanced AI multi-model EUR/USD insights</p>
        </CardContent>
      </Card>
    );
  }

  const { advancedAI } = analysisData;

  const getRegimeColor = (regime: string) => {
    switch (regime) {
      case 'TRENDING_BULLISH': return 'text-green-400 bg-green-600';
      case 'TRENDING_BEARISH': return 'text-red-400 bg-red-600';
      case 'BREAKOUT_PENDING': return 'text-yellow-400 bg-yellow-600';
      case 'RANGING': return 'text-blue-400 bg-blue-600';
      default: return 'text-slate-400 bg-slate-600';
    }
  };

  const getSignalIcon = (signal: string) => {
    if (signal.includes('LONG')) return <TrendingUp className="w-4 h-4 text-green-400" />;
    if (signal.includes('SHORT')) return <TrendingDown className="w-4 h-4 text-red-400" />;
    return <Activity className="w-4 h-4 text-yellow-400" />;
  };

  return (
    <Card className="bg-slate-800 border-slate-700 m-4">
      <CardHeader>
        <CardTitle className="text-white text-sm flex items-center gap-2">
          🤖 Advanced AI Multi-Model Analysis
          <Badge variant="default" className="text-xs bg-purple-600">GPT-4O ENHANCED</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* AI Confidence & Market Regime */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-slate-700 rounded p-2 text-center">
            <Brain className="w-4 h-4 text-purple-400 mx-auto mb-1" />
            <div className="text-purple-400 text-lg font-bold">{advancedAI.aiConfidence}%</div>
            <div className="text-xs text-slate-400">AI Confidence</div>
          </div>
          <div className="bg-slate-700 rounded p-2 text-center">
            <Badge className={`text-xs ${getRegimeColor(advancedAI.marketRegime)}`}>
              {advancedAI.marketRegime?.replace('_', ' ')}
            </Badge>
            <div className="text-xs text-slate-400 mt-1">Market Regime</div>
          </div>
        </div>

        {/* Trading Signal */}
        <div className="bg-slate-700 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            {getSignalIcon(advancedAI.tradingSignal?.direction)}
            <span className="text-white font-medium text-sm">
              AI Signal: {advancedAI.tradingSignal?.direction} 
            </span>
            <Badge variant="outline" className="text-xs">
              {advancedAI.tradingSignal?.timeHorizon}
            </Badge>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Risk Level:</span>
              <span className="text-white">{advancedAI.tradingSignal?.riskLevel}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Volatility:</span>
              <span className="text-white">{advancedAI.volatilityForecast}</span>
            </div>
          </div>
        </div>

        {/* Advanced Metrics */}
        <div className="space-y-2">
          <h4 className="text-slate-200 text-sm font-medium">🎯 AI Advanced Metrics:</h4>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(advancedAI.advancedMetrics || {}).map(([key, value]) => (
              <div key={key} className="bg-slate-700 rounded p-2">
                <div className="text-xs text-slate-400 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                </div>
                <div className="text-sm font-medium text-white">{String(value)}%</div>
              </div>
            ))}
          </div>
        </div>

        {/* Predictive Analysis */}
        <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-blue-400" />
            <span className="text-blue-400 text-xs font-medium">AI Predictive Analysis</span>
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Next 4H Bias:</span>
              <span className="text-blue-300">{advancedAI.predictiveAnalysis?.next4HourBias}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Breakout Probability:</span>
              <span className="text-blue-300">{advancedAI.predictiveAnalysis?.breakoutProbability}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Reversal Risk:</span>
              <span className="text-blue-300">{advancedAI.predictiveAnalysis?.reversalRisk}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Vol Expansion:</span>
              <span className="text-blue-300">
                {advancedAI.predictiveAnalysis?.volatilityExpansion ? 'Expected' : 'Unlikely'}
              </span>
            </div>
          </div>
        </div>

        {/* AI Insights */}
        <div className="space-y-3">
          <h4 className="text-slate-200 text-sm font-medium">💡 AI Key Insights:</h4>
          
          <div className="bg-green-900/20 border border-green-600/30 rounded-lg p-3">
            <div className="text-green-400 text-xs font-medium mb-1">📈 Key Drivers:</div>
            <div className="space-y-1">
              {advancedAI.aiInsights?.keyDrivers?.map((driver: string, index: number) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="w-1 h-1 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-xs text-green-300">{driver}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-amber-900/20 border border-amber-600/30 rounded-lg p-3">
            <div className="text-amber-400 text-xs font-medium mb-1">⚠️ Risk Factors:</div>
            <div className="space-y-1">
              {advancedAI.aiInsights?.riskFactors?.map((risk: string, index: number) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="w-1 h-1 bg-amber-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-xs text-amber-300">{risk}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-red-900/20 border border-red-600/30 rounded-lg p-3">
            <div className="text-red-400 text-xs font-medium mb-1">🔄 Conflicting Signals:</div>
            <div className="space-y-1">
              {advancedAI.aiInsights?.conflictingSignals?.map((signal: string, index: number) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="w-1 h-1 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-xs text-red-300">{signal}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Dynamic Levels */}
        {advancedAI.dynamicLevels && (
          <div className="bg-slate-700 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-purple-400" />
              <span className="text-slate-200 text-xs font-medium">AI Dynamic Levels</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Strong Support:</span>
                <span className="text-green-400">${advancedAI.dynamicLevels.strongSupport?.toFixed(5)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Strong Resistance:</span>
                <span className="text-red-400">${advancedAI.dynamicLevels.strongResistance?.toFixed(5)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Weak Support:</span>
                <span className="text-green-300">${advancedAI.dynamicLevels.weakSupport?.toFixed(5)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Weak Resistance:</span>
                <span className="text-red-300">${advancedAI.dynamicLevels.weakResistance?.toFixed(5)}</span>
              </div>
            </div>
          </div>
        )}

        {/* AI Enhancement Confirmation */}
        <div className="bg-purple-900/20 border border-purple-600/30 rounded-lg p-3">
          <div className="text-purple-400 text-xs font-medium mb-1">🚀 Advanced AI Active</div>
          <div className="text-purple-300 text-xs">
            Multi-model analysis using GPT-4O with ensemble thinking, Bayesian inference, and market microstructure analysis for maximum EUR/USD trading precision.
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EurUsdAdvancedAI;
