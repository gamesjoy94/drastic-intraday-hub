
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
import { Menu, RefreshCw } from 'lucide-react';

const TradingDashboard = () => {
  const [selectedSymbol, setSelectedSymbol] = useState('AAPL');
  const [selectedTimeframe, setSelectedTimeframe] = useState('5min');
  const [currentPrice, setCurrentPrice] = useState(0);
  const [priceChange, setPriceChange] = useState(0);
  const [tradePlan, setTradePlan] = useState(null);
  const [analysisData, setAnalysisData] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [connectionError, setConnectionError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const handleAnalyzeMarket = async (isRetry = false) => {
    setIsAnalyzing(true);
    setConnectionError(false);
    
    if (!isRetry) {
      setRetryCount(0);
    }
    
    console.log(`Running Smart Momentum Scalping analysis for ${selectedSymbol} on ${selectedTimeframe} timeframe`);
    
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

      // Update state with real analysis data
      setCurrentPrice(data.currentPrice);
      setPriceChange(data.priceChange);
      setTradePlan(data.tradePlan);
      setAnalysisData(data);
      setConnectionError(false);
      setRetryCount(0);

      toast({
        title: "Smart Momentum Analysis Complete",
        description: `AI-powered scalping analysis for ${selectedSymbol} completed with ${data.tradePlan?.confidence || 0}% confidence.`,
      });

    } catch (error) {
      console.error('Smart Momentum Scalping analysis failed:', error);
      setConnectionError(true);
      
      if (retryCount < 2) {
        // Auto retry up to 2 times
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          handleAnalyzeMarket(true);
        }, 2000);
        
        toast({
          title: "Connection Issue",
          description: `Retrying analysis... (${retryCount + 1}/3)`,
        });
      } else {
        toast({
          title: "Connection Failed",
          description: "Unable to connect to analysis service. Please check your connection and try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRetryConnection = () => {
    setRetryCount(0);
    handleAnalyzeMarket();
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
      {/* Connection Error Banner */}
      {connectionError && (
        <div className="fixed top-0 left-0 right-0 bg-red-600 text-white px-4 py-2 text-center text-sm z-50">
          <div className="flex items-center justify-center gap-2">
            <span>Connection issue detected</span>
            <button 
              onClick={handleRetryConnection}
              className="underline hover:no-underline flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              Retry
            </button>
          </div>
        </div>
      )}

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
      
      <div className={`flex-1 flex flex-col min-w-0 ${connectionError ? 'mt-10' : ''}`}>
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
                onClick={() => handleAnalyzeMarket()}
                disabled={isAnalyzing}
                className={`w-full py-3 px-4 lg:px-6 rounded-lg font-semibold text-base lg:text-lg transition-all duration-200 ${
                  isAnalyzing 
                    ? 'bg-gray-600 cursor-not-allowed' 
                    : connectionError
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:shadow-lg'
                }`}
              >
                {isAnalyzing ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {retryCount > 0 ? `Retrying... (${retryCount}/3)` : 'Analyzing with AI...'}
                  </div>
                ) : connectionError ? (
                  <div className="flex items-center justify-center gap-2">
                    <RefreshCw className="w-5 h-5" />
                    Reconnect & Analyze
                  </div>
                ) : (
                  '🚀 Smart Momentum Scalping Analysis'
                )}
              </button>
            </div>
          </div>
          
          {/* Right Panel - Desktop only or collapsible on mobile */}
          <div className={`${isMobile ? 'hidden' : 'w-80 lg:w-96'} flex flex-col border-l border-slate-700 bg-slate-900`}>
            <div className="flex-1 overflow-y-auto">
              <MarketData symbol={selectedSymbol} />
              <AnalysisPanel 
                symbol={selectedSymbol} 
                timeframe={selectedTimeframe}
                analysisData={analysisData}
              />
              <TradePlan tradePlan={tradePlan} />
            </div>
          </div>
          
          {/* Mobile Bottom Sheet for Analysis */}
          {isMobile && (
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
