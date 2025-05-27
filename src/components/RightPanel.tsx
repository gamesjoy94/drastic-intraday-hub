
import MarketData from './MarketData';
import AnalysisPanel from './AnalysisPanel';
import TradePlan from './TradePlan';
import PatternRecognition from './PatternRecognition';

interface RightPanelProps {
  selectedSymbol: string;
  selectedTimeframe: string;
  analysisData: any;
  tradePlan: any;
}

const RightPanel = ({ selectedSymbol, selectedTimeframe, analysisData, tradePlan }: RightPanelProps) => {
  return (
    <div className="w-80 lg:w-96 flex flex-col border-l border-slate-700 bg-slate-900">
      <div className="flex-1 overflow-y-auto">
        <MarketData symbol={selectedSymbol} />
        <AnalysisPanel 
          symbol={selectedSymbol} 
          timeframe={selectedTimeframe}
          analysisData={analysisData}
        />
        <PatternRecognition patternData={analysisData?.patternData} />
        <TradePlan tradePlan={tradePlan} />
      </div>
    </div>
  );
};

export default RightPanel;
