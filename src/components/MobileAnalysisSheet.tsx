
import { Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import MarketData from './MarketData';
import AnalysisPanel from './AnalysisPanel';
import TradePlan from './TradePlan';

interface MobileAnalysisSheetProps {
  selectedSymbol: string;
  selectedTimeframe: string;
  analysisData: any;
  tradePlan: any;
}

const MobileAnalysisSheet = ({ selectedSymbol, selectedTimeframe, analysisData, tradePlan }: MobileAnalysisSheetProps) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white p-4 rounded-full shadow-xl z-40 border-2 border-white/20 backdrop-blur-sm transition-all duration-200 hover:scale-105">
          <Menu className="w-6 h-6" />
        </button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[70vh] bg-slate-900 border-slate-700 z-50">
        <div className="overflow-y-auto h-full custom-scrollbar">
          <MarketData symbol={selectedSymbol} />
          <AnalysisPanel 
            symbol={selectedSymbol} 
            timeframe={selectedTimeframe}
            analysisData={analysisData}
          />
          <TradePlan tradePlan={tradePlan} />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileAnalysisSheet;
