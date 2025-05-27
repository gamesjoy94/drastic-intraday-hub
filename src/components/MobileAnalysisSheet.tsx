
import { Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import MarketData from './MarketData';
import AnalysisPanel from './AnalysisPanel';
import LivePatternRecognition from './LivePatternRecognition';
import TradePlan from './TradePlan';

interface MobileAnalysisSheetProps {
  selectedSymbol: string;
  selectedTimeframe: string;
  analysisData: any;
  tradePlan: any;
  currentPrice: number;
}

const MobileAnalysisSheet = ({ selectedSymbol, selectedTimeframe, analysisData, tradePlan, currentPrice }: MobileAnalysisSheetProps) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className="fixed bottom-4 right-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white p-3 rounded-full shadow-lg z-40">
          <Menu className="w-6 h-6" />
        </button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[70vh] bg-slate-900 border-slate-700">
        <div className="overflow-y-auto h-full">
          <MarketData symbol={selectedSymbol} />
          <AnalysisPanel 
            symbol={selectedSymbol} 
            timeframe={selectedTimeframe}
            analysisData={analysisData}
          />
          <LivePatternRecognition currentPrice={currentPrice} />
          <TradePlan tradePlan={tradePlan} />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileAnalysisSheet;
