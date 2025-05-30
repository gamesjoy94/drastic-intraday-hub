
import MarketData from './MarketData';
import EurUsdAnalysisPanel from './EurUsdAnalysisPanel';
import TradePlan from './TradePlan';
import EurUsdPatternRecognition from './EurUsdPatternRecognition';

interface EurUsdRightPanelProps {
  selectedSymbol: string;
  selectedTimeframe: string;
  analysisData: any;
  tradePlan: any;
  currentPrice: number;
}

const EurUsdRightPanel = ({ selectedSymbol, selectedTimeframe, analysisData, tradePlan, currentPrice }: EurUsdRightPanelProps) => {
  return (
    <div className="w-80 lg:w-96 flex flex-col border-l border-slate-700 bg-slate-900">
      <div className="flex-1 overflow-y-auto">
        <MarketData symbol={selectedSymbol} />
        <EurUsdAnalysisPanel 
          symbol={selectedSymbol} 
          timeframe={selectedTimeframe}
          analysisData={analysisData}
        />
        <EurUsdPatternRecognition currentPrice={currentPrice} />
        <TradePlan tradePlan={tradePlan} selectedTimeframe={selectedTimeframe} />
      </div>
    </div>
  );
};

export default EurUsdRightPanel;
