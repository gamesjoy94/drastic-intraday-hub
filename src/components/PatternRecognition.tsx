
import { TrendingUp, TrendingDown, Target, AlertTriangle, BarChart3, Flag, Activity, DollarSign, TrendingUp as CorrelationIcon } from 'lucide-react';

interface PatternRecognitionProps {
  patternData: any;
}

const PatternRecognition = ({ patternData }: PatternRecognitionProps) => {
  if (!patternData) {
    return (
      <div className="p-4 flex-1">
        <h3 className="text-lg font-semibold mb-4 text-slate-200">Pattern Recognition</h3>
        <div className="bg-slate-700 rounded-lg p-6 text-center">
          <div className="text-slate-400 mb-2">No pattern analysis yet</div>
          <div className="text-sm text-slate-500">Click "Start" to begin live pattern recognition</div>
        </div>
      </div>
    );
  }

  const getPatternColor = (strength: string) => {
    switch (strength) {
      case 'STRONG': return 'text-green-400 bg-green-600/20 border-green-600';
      case 'MODERATE': return 'text-yellow-400 bg-yellow-600/20 border-yellow-600';
      case 'WEAK': return 'text-red-400 bg-red-600/20 border-red-600';
      default: return 'text-slate-400 bg-slate-600/20 border-slate-600';
    }
  };

  const getDirectionColor = (direction: string) => {
    switch (direction) {
      case 'BULLISH': return 'text-green-400';
      case 'BEARISH': return 'text-red-400';
      default: return 'text-yellow-400';
    }
  };

  const getVolatilityColor = (percentile: string) => {
    switch (percentile) {
      case 'LOW': return 'text-green-400';
      case 'HIGH': return 'text-red-400';
      default: return 'text-yellow-400';
    }
  };

  const getCorrelationColor = (value: number) => {
    const abs = Math.abs(value);
    if (abs > 0.6) return 'text-green-400'; // Strong correlation
    if (abs > 0.3) return 'text-yellow-400'; // Moderate correlation
    return 'text-red-400'; // Weak correlation
  };

  const getPatternIcon = (pattern: string) => {
    if (pattern.includes('Flag')) return <Flag className="w-4 h-4" />;
    if (pattern.includes('Triangle')) return <TrendingUp className="w-4 h-4" />;
    if (pattern.includes('Head')) return <BarChart3 className="w-4 h-4" />;
    return <Target className="w-4 h-4" />;
  };

  return (
    <div className="p-4 flex-1 custom-scrollbar overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-200">Pattern Recognition</h3>
        <div className={`px-2 py-1 rounded border text-xs font-medium ${getPatternColor(patternData.strength)}`}>
          {patternData.strength}
        </div>
      </div>
      
      <div className="space-y-4">
        {/* Primary Pattern */}
        <div className="bg-slate-700 rounded-lg p-4 border border-slate-600">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {getPatternIcon(patternData.pattern)}
              <span className="text-slate-300 text-sm">Detected Pattern</span>
            </div>
            <span className={`text-sm font-bold flex items-center gap-1 ${getDirectionColor(patternData.direction)}`}>
              {patternData.direction === 'BULLISH' ? <TrendingUp className="w-3 h-3" /> : 
               patternData.direction === 'BEARISH' ? <TrendingDown className="w-3 h-3" /> : null}
              {patternData.direction}
            </span>
          </div>
          <div className="text-white font-semibold mb-2">{patternData.pattern}</div>
          <div className="text-xs text-slate-400 mb-2">{patternData.description}</div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Probability:</span>
            <span className="text-white font-semibold text-sm">{patternData.probability}%</span>
          </div>
        </div>

        {/* Real-time Volatility */}
        {patternData.volatility && (
          <div className="bg-slate-700 rounded-lg p-4 border border-slate-600">
            <h4 className="font-semibold mb-3 text-slate-200 flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Real-time Volatility
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">Current Volatility</span>
                <span className={`font-semibold ${getVolatilityColor(patternData.volatility.percentile)}`}>
                  {patternData.volatility.current.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">Average Volatility</span>
                <span className="text-slate-300 font-semibold">{patternData.volatility.average.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">Volatility Level</span>
                <span className={`text-sm font-semibold ${getVolatilityColor(patternData.volatility.percentile)}`}>
                  {patternData.volatility.percentile}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">Trend</span>
                <span className="text-slate-300 font-semibold text-sm">{patternData.volatility.trend}</span>
              </div>
            </div>
          </div>
        )}

        {/* Risk/Reward & Position Sizing */}
        {patternData.riskMetrics && (
          <div className="bg-slate-700 rounded-lg p-4 border border-slate-600">
            <h4 className="font-semibold mb-3 text-slate-200 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Risk Management
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">Risk/Reward Ratio</span>
                <span className="text-green-400 font-semibold">1:{patternData.riskMetrics.riskRewardRatio}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">Position Size</span>
                <span className="text-blue-400 font-semibold">{patternData.riskMetrics.positionSize}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">Max Risk</span>
                <span className="text-red-400 font-semibold">{patternData.riskMetrics.maxRisk}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">Stop Distance</span>
                <span className="text-orange-400 font-semibold">{patternData.riskMetrics.stopLossDistance}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">Target Distance</span>
                <span className="text-purple-400 font-semibold">{patternData.riskMetrics.takeProfitDistance}</span>
              </div>
            </div>
          </div>
        )}

        {/* Asset Correlations */}
        {patternData.correlation && (
          <div className="bg-slate-700 rounded-lg p-4 border border-slate-600">
            <h4 className="font-semibold mb-3 text-slate-200 flex items-center gap-2">
              <CorrelationIcon className="w-4 h-4" />
              Asset Correlations
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">Gold/Silver</span>
                <span className={`font-semibold ${getCorrelationColor(patternData.correlation.goldSilverCorr)}`}>
                  {patternData.correlation.goldSilverCorr.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">Gold/USD (DXY)</span>
                <span className={`font-semibold ${getCorrelationColor(patternData.correlation.goldDxyCorr)}`}>
                  {patternData.correlation.goldDxyCorr.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">Gold/S&P 500</span>
                <span className={`font-semibold ${getCorrelationColor(patternData.correlation.goldSpyCorr)}`}>
                  {patternData.correlation.goldSpyCorr.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">Gold/Bonds</span>
                <span className={`font-semibold ${getCorrelationColor(patternData.correlation.goldBondCorr)}`}>
                  {patternData.correlation.goldBondCorr.toFixed(2)}
                </span>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-600">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-sm">Correlation Signal</span>
                  <span className={`text-sm font-semibold ${getDirectionColor(patternData.correlation.correlationSignal)}`}>
                    {patternData.correlation.correlationSignal}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Support & Resistance Levels */}
        <div className="bg-slate-700 rounded-lg p-4 border border-slate-600">
          <h4 className="font-semibold mb-3 text-slate-200 flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Key Price Levels
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-sm">Resistance</span>
              <span className="text-red-400 font-semibold">${parseFloat(patternData.resistance).toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-sm">Support</span>
              <span className="text-green-400 font-semibold">${parseFloat(patternData.support).toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-sm">Pivot Point</span>
              <span className="text-blue-400 font-semibold">${parseFloat(patternData.pivot).toFixed(2)}</span>
            </div>
            {patternData.signals?.keyLevels && patternData.signals.keyLevels.length > 0 && (
              <div className="mt-3 pt-2 border-t border-slate-600">
                <span className="text-slate-400 text-xs">Additional Key Levels:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {patternData.signals.keyLevels.map((level: string, index: number) => (
                    <span key={index} className="text-xs bg-slate-600 px-1 py-0.5 rounded text-slate-300">
                      {level}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Breakout Analysis */}
        <div className="bg-slate-700 rounded-lg p-4 border border-slate-600">
          <h4 className="font-semibold mb-3 text-slate-200 flex items-center gap-2">
            <Target className="w-4 h-4" />
            Breakout Prediction
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-sm">Breakout Level</span>
              <span className="text-blue-400 font-semibold">${parseFloat(patternData.breakoutLevel).toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-sm">Price Target</span>
              <span className="text-purple-400 font-semibold">${parseFloat(patternData.target).toFixed(2)}</span>
            </div>
            {patternData.signals?.breakoutPrediction && (
              <div className="mt-2 p-2 bg-slate-800 rounded text-xs text-slate-300">
                {patternData.signals.breakoutPrediction}
              </div>
            )}
          </div>
        </div>

        {/* Volume Confirmation Signals */}
        <div className="bg-slate-700 rounded-lg p-4 border border-slate-600">
          <h4 className="font-semibold mb-3 text-slate-200 flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Volume Confirmation
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-sm">Volume Status</span>
              <span className={`text-sm font-semibold ${
                patternData.signals?.volumeConfirmation === 'CONFIRMED' 
                  ? 'text-green-400' 
                  : 'text-yellow-400'
              }`}>
                {patternData.signals?.volumeConfirmation || 'PENDING'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-sm">Risk Level</span>
              <span className={`text-sm font-semibold ${
                patternData.signals?.riskLevel === 'LOW' 
                  ? 'text-green-400' 
                  : patternData.signals?.riskLevel === 'MEDIUM'
                  ? 'text-yellow-400'
                  : 'text-red-400'
              }`}>
                {patternData.signals?.riskLevel || 'MEDIUM'}
              </span>
            </div>
          </div>
        </div>

        {/* Pattern Analysis */}
        <div className="bg-slate-700 rounded-lg p-4 border border-slate-600">
          <h4 className="font-semibold mb-3 text-slate-200">Analysis Summary</h4>
          <p className="text-sm text-slate-300 leading-relaxed">
            {patternData.analysis}
          </p>
        </div>

        {/* Enhanced Info Cards */}
        <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-3">
          <div className="text-blue-400 text-xs font-medium mb-1 flex items-center gap-1">
            <Target className="w-3 h-3" />
            Advanced Trading Analytics
          </div>
          <div className="text-blue-300 text-xs">
            Real-time volatility, position sizing, risk/reward ratios, and correlation analysis
          </div>
        </div>

        <div className="bg-orange-900/20 border border-orange-600/30 rounded-lg p-3">
          <div className="text-orange-400 text-xs font-medium mb-1 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            Risk Management Warning
          </div>
          <div className="text-orange-300 text-xs">
            Intraday trading involves substantial risk. Use proper position sizing and stop losses. Current volatility: {patternData.volatility?.percentile || 'MEDIUM'}.
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatternRecognition;
