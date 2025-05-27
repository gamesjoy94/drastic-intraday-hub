
interface TradePlanProps {
  tradePlan: any;
}

const TradePlan = ({ tradePlan }: TradePlanProps) => {
  if (!tradePlan) {
    return (
      <div className="p-4 flex-1">
        <h3 className="text-lg font-semibold mb-4 text-slate-200">Trade Plan</h3>
        <div className="bg-slate-700 rounded-lg p-6 text-center">
          <div className="text-slate-400 mb-2">No analysis yet</div>
          <div className="text-sm text-slate-500">Click "Analyze Market" to generate a trade plan</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 flex-1 custom-scrollbar overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-200">Trade Plan</h3>
        <div className={`px-2 py-1 rounded text-xs font-medium ${
          tradePlan.confidence >= 80 ? 'bg-green-600' :
          tradePlan.confidence >= 60 ? 'bg-yellow-600' : 'bg-red-600'
        }`}>
          {tradePlan.confidence}% Confidence
        </div>
      </div>
      
      <div className="space-y-4">
        {/* Trade Levels */}
        <div className="bg-slate-700 rounded-lg p-4">
          <h4 className="font-semibold mb-3 text-slate-200">Trade Levels</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-400">Entry</span>
              <span className="text-blue-400 font-semibold">${tradePlan.entry.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Stop Loss</span>
              <span className="text-red-400 font-semibold">${tradePlan.stopLoss.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Take Profit</span>
              <span className="text-green-400 font-semibold">${tradePlan.takeProfit.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t border-slate-600 pt-2">
              <span className="text-slate-400">Risk:Reward</span>
              <span className="text-white font-semibold">1:{tradePlan.riskReward}</span>
            </div>
          </div>
        </div>

        {/* Indicators Summary */}
        <div className="bg-slate-700 rounded-lg p-4">
          <h4 className="font-semibold mb-3 text-slate-200">Indicators</h4>
          <div className="space-y-2">
            {Object.entries(tradePlan.indicators).map(([key, value]) => (
              <div key={key} className="flex justify-between text-sm">
                <span className="text-slate-400 capitalize">{key}</span>
                <span className="text-slate-200">{value as string}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Strategy Rationale */}
        <div className="bg-slate-700 rounded-lg p-4">
          <h4 className="font-semibold mb-3 text-slate-200">Strategy</h4>
          <p className="text-sm text-slate-300 leading-relaxed">
            {tradePlan.strategy}
          </p>
        </div>

        {/* Risk Warning */}
        <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-3">
          <div className="text-yellow-400 text-xs font-medium mb-1">⚠️ Risk Warning</div>
          <div className="text-yellow-300 text-xs">
            Trading involves substantial risk. This analysis is for educational purposes only and should not be considered financial advice.
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradePlan;
