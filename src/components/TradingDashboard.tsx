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
  const [lastAnalysisTime, setLastAnalysisTime] = useState(0);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  // Rate limiting: prevent too frequent API calls
  const RATE_LIMIT_DELAY = 10000; // 10 seconds between calls

  const formatSymbolForAPI = (symbol: string) => {
    // Convert forex pairs to API format
    const forexPairs: { [key: string]: string } = {
      'XAUUSD': 'XAU/USD',
      'EURUSD': 'EUR/USD',
      'GBPUSD': 'GBP/USD',
      'USDJPY': 'USD/JPY',
      'AUDUSD': 'AUD/USD',
      'USDCAD': 'USD/CAD',
      'USDCHF': 'USD/CHF',
      'NZDUSD': 'NZD/USD'
    };
    
    return forexPairs[symbol] || symbol;
  };

  const handleAnalyzeMarket = async (isRetry = false) => {
    // Rate limiting check
    const now = Date.now();
    if (!isRetry && now - lastAnalysisTime < RATE_LIMIT_DELAY) {
      const remainingTime = Math.ceil((RATE_LIMIT_DELAY - (now - lastAnalysisTime)) / 1000);
      toast({
        title: "Rate Limited",
        description: `Please wait ${remainingTime} seconds before making another request to avoid API limits.`,
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setConnectionError(false);
    
    if (!isRetry) {
      setRetryCount(0);
      setLastAnalysisTime(now);
    }
    
    console.log(`Running Smart Momentum Scalping analysis for ${selectedSymbol} on ${selectedTimeframe} timeframe`);
    
    try {
      // Format symbol for API
      const apiSymbol = formatSymbolForAPI(selectedSymbol);
      
      const { data, error } = await supabase.functions.invoke('analyze-market', {
        body: { 
          symbol: apiSymbol, 
          timeframe: selectedTimeframe 
        }
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        // Check if it's a rate limit error
        if (data.error.includes('API credits') || data.error.includes('rate limit')) {
          throw new Error(`Rate limit exceeded. The API has reached its quota. Please wait a moment before trying again.`);
        }
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
      
      const errorMessage = error.message || 'Unknown error';
      
      // Don't auto-retry on rate limit errors
      if (errorMessage.includes('rate limit') || errorMessage.includes('API credits')) {
        toast({
          title: "API Rate Limit",
          description: "The market data API has reached its limit. Please wait a few minutes before trying again.",
          variant: "destructive",
        });
      } else if (retryCount < 1) { // Reduced retry count to prevent rate limiting
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          handleAnalyzeMarket(true);
        }, 5000); // Increased delay between retries
        
        toast({
          title: "Connection Issue",
          description: `Retrying analysis... (${retryCount + 1}/2)`,
        });
      } else {
        toast({
          title: "Connection Failed",
          description: "Unable to connect to analysis service. Please check your connection and try again later.",
          variant: "destructive",
        });
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRetryConnection = () => {
    setRetryCount(0);
    setLastAnalysisTime(0); // Reset rate limit
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
                    {retryCount > 0 ? `Retrying... (${retryCount}/2)` : 'Analyzing with AI...'}
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
