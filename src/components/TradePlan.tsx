
interface TradePlanProps {
  tradePlan: any;
  selectedTimeframe?: string;
}

const TradePlan = ({ tradePlan, selectedTimeframe }: TradePlanProps) => {
  if (!tradePlan) {
    return (
      <div className="p-4 flex-1">
        <h3 className="text-lg font-semibold mb-4 text-slate-200">
          Smart Momentum Scalping {selectedTimeframe && `(${selectedTimeframe})`}
        </h3>
        <div className="bg-slate-700 rounded-lg p-6 text-center">
          <div className="text-slate-400 mb-2">No analysis yet</div>
          <div className="text-sm text-slate-500">Click "Analyze Market" to generate an AI-powered trade plan</div>
        </div>
      </div>
    );
  }

  const getDirectionColor = (direction: string) => {
    switch (direction) {
      case 'LONG': return 'text-green-400 bg-green-600';
      case 'SHORT': return 'text-red-400 bg-red-600';
      default: return 'text-yellow-400 bg-yellow-600';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'bg-green-600';
    if (confidence >= 60) return 'bg-yellow-600';
    return 'bg-red-600';
  };

  // Helper function to safely render values
  const renderValue = (value: any): string => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  return (
    <div className="p-4 flex-1 custom-scrollbar overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-200">
            Smart Momentum Scalping
          </h3>
          {selectedTimeframe && (
            <div className="text-sm text-blue-400 font-medium">
              Timeframe: {selectedTimeframe}
            </div>
          )}
        </div>
        <div className={`px-2 py-1 rounded text-xs font-medium ${getConfidenceColor(tradePlan.confidence || 0)}`}>
          {renderValue(tradePlan.confidence)}% Confidence
        </div>
      </div>
      
      <div className="space-y-4">
        {/* Trade Direction */}
        <div className="bg-slate-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-300 text-sm">Trade Direction</span>
            <span className={`px-3 py-1 rounded text-sm font-bold ${getDirectionColor(renderValue(tradePlan.direction))}`}>
              {renderValue(tradePlan.direction)}
            </span>
          </div>
          <div className="text-xs text-slate-400">{renderValue(tradePlan.timing)}</div>
        </div>

        {/* Trade Levels */}
        <div className="bg-slate-700 rounded-lg p-4">
          <h4 className="font-semibold mb-3 text-slate-200">Trade Levels</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-400">Entry</span>
              <span className="text-blue-400 font-semibold">${parseFloat(tradePlan.entry || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Stop Loss</span>
              <span className="text-red-400 font-semibold">${parseFloat(tradePlan.stopLoss || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Take Profit</span>
              <span className="text-green-400 font-semibold">${parseFloat(tradePlan.takeProfit || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t border-slate-600 pt-2">
              <span className="text-slate-400">Risk:Reward</span>
              <span className="text-white font-semibold">{renderValue(tradePlan.riskReward)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Position Size</span>
              <span className="text-blue-300 font-semibold">{renderValue(tradePlan.positionSize)}</span>
            </div>
          </div>
        </div>

        {/* Strategy Indicators */}
        <div className="bg-slate-700 rounded-lg p-4">
          <h4 className="font-semibold mb-3 text-slate-200">Strategy Signals</h4>
          <div className="space-y-2">
            {tradePlan.indicators && Object.entries(tradePlan.indicators).map(([key, value]) => (
              <div key={key} className="flex justify-between text-sm">
                <span className="text-slate-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                <span className="text-slate-200 font-mono">{renderValue(value)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Strategy Rationale */}
        <div className="bg-slate-700 rounded-lg p-4">
          <h4 className="font-semibold mb-3 text-slate-200">AI Analysis</h4>
          <p className="text-sm text-slate-300 leading-relaxed">
            {renderValue(tradePlan.strategy)}
          </p>
        </div>

        {/* Risk Factors */}
        <div className="bg-slate-700 rounded-lg p-4">
          <h4 className="font-semibold mb-3 text-slate-200">Risk Assessment</h4>
          <p className="text-sm text-slate-300 leading-relaxed">
            {renderValue(tradePlan.risks)}
          </p>
        </div>

        {/* Strategy Info */}
        <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-3">
          <div className="text-blue-400 text-xs font-medium mb-1">📈 Strategy: Smart Momentum Scalping</div>
          <div className="text-blue-300 text-xs">
            Uses EMA crossover + RSI + MACD + Volume + VWAP for high-probability {selectedTimeframe || 'intraday'} setups
          </div>
        </div>

        {/* Risk Warning */}
        <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-3">
          <div className="text-yellow-400 text-xs font-medium mb-1">⚠️ Risk Warning</div>
          <div className="text-yellow-300 text-xs">
            {selectedTimeframe} trading involves substantial risk. This AI analysis is for educational purposes only.
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradePlan;
