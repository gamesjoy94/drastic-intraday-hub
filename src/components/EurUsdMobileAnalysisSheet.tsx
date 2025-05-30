
import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { BarChart3 } from 'lucide-react';
import MarketData from './MarketData';
import EurUsdAnalysisPanel from './EurUsdAnalysisPanel';
import TradePlan from './TradePlan';
import EurUsdPatternRecognition from './EurUsdPatternRecognition';

interface EurUsdMobileAnalysisSheetProps {
  selectedSymbol: string;
  selectedTimeframe: string;
  analysisData: any;
  tradePlan: any;
  currentPrice: number;
}

const EurUsdMobileAnalysisSheet = ({ 
  selectedSymbol, 
  selectedTimeframe, 
  analysisData, 
  tradePlan, 
  currentPrice 
}: EurUsdMobileAnalysisSheetProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="fixed bottom-4 right-4 z-50 bg-slate-800 border-slate-600 text-white hover:bg-slate-700"
        >
          <BarChart3 className="w-4 h-4 mr-2" />
          EUR/USD Analysis
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="bg-slate-900 border-slate-700 h-[80vh]">
        <SheetHeader>
          <SheetTitle className="text-white">EUR/USD AI-Enhanced Analysis</SheetTitle>
        </SheetHeader>
        <div className="mt-4 overflow-y-auto h-full pb-20">
          <MarketData symbol={selectedSymbol} />
          <EurUsdAnalysisPanel 
            symbol={selectedSymbol} 
            timeframe={selectedTimeframe}
            analysisData={analysisData}
          />
          <EurUsdPatternRecognition currentPrice={currentPrice} />
          <TradePlan tradePlan={tradePlan} selectedTimeframe={selectedTimeframe} />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default EurUsdMobileAnalysisSheet;
