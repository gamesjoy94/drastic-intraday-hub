
import MarketData from './MarketData';
import AnalysisPanel from './AnalysisPanel';
import TradePlan from './TradePlan';
import LivePatternRecognition from './LivePatternRecognition';

interface RightPanelProps {
  selectedSymbol: string;
  selectedTimeframe: string;
  analysisData: any;
  tradePlan: any;
  currentPrice: number;
}

const RightPanel = ({ selectedSymbol, selectedTimeframe, analysisData, tradePlan, currentPrice }: RightPanelProps) => {
  return (
    <div className="w-80 lg:w-96 flex flex-col border-l border-slate-700 bg-slate-900">
      <div className="flex-1 overflow-y-auto">
        <MarketData symbol={selectedSymbol} />
        <AnalysisPanel 
          symbol={selectedSymbol} 
          timeframe={selectedTimeframe}
          analysisData={analysisData}
        />
        <LivePatternRecognition currentPrice={currentPrice} />
        <TradePlan tradePlan={tradePlan} selectedTimeframe={selectedTimeframe} />
      </div>
    </div>
  );
};

export default RightPanel;
