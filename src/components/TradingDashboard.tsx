
import { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import ChartSection from './ChartSection';
import AnalysisPanel from './AnalysisPanel';
import TradePlan from './TradePlan';
import MarketData from './MarketData';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';

const TradingDashboard = () => {
  const [selectedSymbol, setSelectedSymbol] = useState('AAPL');
  const [selectedTimeframe, setSelectedTimeframe] = useState('5min');
  const [currentPrice, setCurrentPrice] = useState(0);
  const [priceChange, setPriceChange] = useState(0);
  const [tradePlan, setTradePlan] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const handleAnalyzeMarket = async () => {
    setIsAnalyzing(true);
    console.log(`Analyzing ${selectedSymbol} on ${selectedTimeframe} timeframe`);
    
    try {
      const { data, error } = await supabase.functions.invoke('analyze-market', {
        body: { 
          symbol: selectedSymbol, 
          timeframe: selectedTimeframe 
        }
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      // Update current price from real data
      setCurrentPrice(data.currentPrice);
      setPriceChange(data.priceChange);
      setTradePlan(data.tradePlan);

      toast({
        title: "Analysis Complete",
        description: `Market analysis for ${selectedSymbol} completed successfully.`,
      });

    } catch (error) {
      console.error('Analysis failed:', error);
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to analyze market data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const SidebarContent = () => (
    <Sidebar 
      selectedSymbol={selectedSymbol}
      setSelectedSymbol={setSelectedSymbol}
      selectedTimeframe={selectedTimeframe}
      setSelectedTimeframe={setSelectedTimeframe}
      onClose={() => setSidebarOpen(false)}
    />
  );

  return (
    <div className="flex h-screen bg-slate-900 text-white overflow-hidden">
      {/* Desktop Sidebar */}
      {!isMobile && <SidebarContent />}
      
      {/* Mobile Sidebar */}
      {isMobile && (
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetTrigger asChild>
            <button className="fixed top-4 left-4 z-50 p-2 bg-slate-800 rounded-md border border-slate-700 md:hidden">
              <Menu className="w-5 h-5" />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 p-0 bg-slate-800 border-slate-700">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      )}
      
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar 
          selectedSymbol={selectedSymbol}
          currentPrice={currentPrice}
          priceChange={priceChange}
        />
        
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Main Chart Section */}
          <div className="flex-1 flex flex-col min-w-0">
            <div className="flex-1 min-h-0">
              <ChartSection 
                symbol={selectedSymbol}
                timeframe={selectedTimeframe}
                onPriceUpdate={(price, change) => {
                  if (currentPrice === 0) { // Only update if we don't have real data yet
                    setCurrentPrice(price);
                    setPriceChange(change);
                  }
                }}
              />
            </div>
            
            <div className="p-3 lg:p-4 border-t border-slate-700">
              <button
                onClick={handleAnalyzeMarket}
                disabled={isAnalyzing}
                className={`w-full py-3 px-4 lg:px-6 rounded-lg font-semibold text-base lg:text-lg transition-all duration-200 ${
                  isAnalyzing 
                    ? 'bg-gray-600 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg'
                }`}
              >
                {isAnalyzing ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Analyzing Market...
                  </div>
                ) : (
                  'Analyze Market'
                )}
              </button>
            </div>
          </div>
          
          {/* Right Panel - Desktop only or collapsible on mobile */}
          <div className={`${isMobile ? 'hidden' : 'w-80 lg:w-96'} flex flex-col border-l border-slate-700 bg-slate-900`}>
            <div className="flex-1 overflow-y-auto">
              <MarketData symbol={selectedSymbol} />
              <AnalysisPanel symbol={selectedSymbol} timeframe={selectedTimeframe} />
              <TradePlan tradePlan={tradePlan} />
            </div>
          </div>
          
          {/* Mobile Bottom Sheet for Analysis */}
          {isMobile && (
            <Sheet>
              <SheetTrigger asChild>
                <button className="fixed bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg z-40">
                  <Menu className="w-6 h-6" />
                </button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[70vh] bg-slate-900 border-slate-700">
                <div className="overflow-y-auto h-full">
                  <MarketData symbol={selectedSymbol} />
                  <AnalysisPanel symbol={selectedSymbol} timeframe={selectedTimeframe} />
                  <TradePlan tradePlan={tradePlan} />
                </div>
              </SheetContent>
            </Sheet>
          )}
        </div>
      </div>
    </div>
  );
};

export default TradingDashboard;
