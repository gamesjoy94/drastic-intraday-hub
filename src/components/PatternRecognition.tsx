
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
          <div className="text-sm text-slate-500">Click "Analyze Market" to identify chart patterns</div>
        </div>
      </div>
    );
  }

  const getPatternColor = (strength: string) => {
    switch (strength) {
      case 'STRONG': return 'text-green-400 bg-green-600';
      case 'MODERATE': return 'text-yellow-400 bg-yellow-600';
      case 'WEAK': return 'text-red-400 bg-red-600';
      default: return 'text-slate-400 bg-slate-600';
    }
  };

  const getDirectionColor = (direction: string) => {
    switch (direction) {
      case 'BULLISH': return 'text-green-400';
      case 'BEARISH': return 'text-red-400';
      default: return 'text-yellow-400';
    }
  };

  return (
    <div className="p-4 flex-1 custom-scrollbar overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-200">Pattern Recognition</h3>
        <div className={`px-2 py-1 rounded text-xs font-medium ${getPatternColor(patternData.strength)}`}>
          {patternData.strength}
        </div>
      </div>
      
      <div className="space-y-4">
        {/* Primary Pattern */}
        <div className="bg-slate-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-300 text-sm">Primary Pattern</span>
            <span className={`text-sm font-bold ${getDirectionColor(patternData.direction)}`}>
              {patternData.direction}
            </span>
          </div>
          <div className="text-white font-semibold mb-1">{patternData.pattern}</div>
          <div className="text-xs text-slate-400">{patternData.description}</div>
        </div>

        {/* Support & Resistance */}
        <div className="bg-slate-700 rounded-lg p-4">
          <h4 className="font-semibold mb-3 text-slate-200">Key Levels</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-400">Resistance</span>
              <span className="text-red-400 font-semibold">${parseFloat(patternData.resistance).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Support</span>
              <span className="text-green-400 font-semibold">${parseFloat(patternData.support).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Pivot Point</span>
              <span className="text-blue-400 font-semibold">${parseFloat(patternData.pivot).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Breakout Analysis */}
        <div className="bg-slate-700 rounded-lg p-4">
          <h4 className="font-semibold mb-3 text-slate-200">Breakout Analysis</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-400">Breakout Level</span>
              <span className="text-blue-400 font-semibold">${parseFloat(patternData.breakoutLevel).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Target</span>
              <span className="text-purple-400 font-semibold">${parseFloat(patternData.target).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Probability</span>
              <span className="text-white font-semibold">{patternData.probability}%</span>
            </div>
          </div>
        </div>

        {/* Pattern Indicators */}
        <div className="bg-slate-700 rounded-lg p-4">
          <h4 className="font-semibold mb-3 text-slate-200">Pattern Signals</h4>
          <div className="space-y-2">
            {patternData.signals && Object.entries(patternData.signals).map(([key, value]) => (
              <div key={key} className="flex justify-between text-sm">
                <span className="text-slate-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                <span className="text-slate-200 font-mono">{value as string}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pattern Analysis */}
        <div className="bg-slate-700 rounded-lg p-4">
          <h4 className="font-semibold mb-3 text-slate-200">Pattern Analysis</h4>
          <p className="text-sm text-slate-300 leading-relaxed">
            {patternData.analysis}
          </p>
        </div>

        {/* Pattern Info */}
        <div className="bg-purple-900/20 border border-purple-600/30 rounded-lg p-3">
          <div className="text-purple-400 text-xs font-medium mb-1">📊 Pattern Recognition Engine</div>
          <div className="text-purple-300 text-xs">
            Advanced chart pattern detection using price action and volume analysis
          </div>
        </div>

        {/* Risk Warning */}
        <div className="bg-orange-900/20 border border-orange-600/30 rounded-lg p-3">
          <div className="text-orange-400 text-xs font-medium mb-1">⚠️ Pattern Risk</div>
          <div className="text-orange-300 text-xs">
            Pattern recognition has {100 - patternData.probability}% failure rate. Use with proper risk management.
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatternRecognition;
