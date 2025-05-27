
import { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import ChartSection from './ChartSection';
import AnalysisPanel from './AnalysisPanel';
import TradePlan from './TradePlan';
import MarketData from './MarketData';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const TradingDashboard = () => {
  const [selectedSymbol, setSelectedSymbol] = useState('AAPL');
  const [selectedTimeframe, setSelectedTimeframe] = useState('5min');
  const [currentPrice, setCurrentPrice] = useState(0);
  const [priceChange, setPriceChange] = useState(0);
  const [tradePlan, setTradePlan] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

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

  return (
    <div className="flex h-screen bg-slate-900 text-white">
      <Sidebar 
        selectedSymbol={selectedSymbol}
        setSelectedSymbol={setSelectedSymbol}
        selectedTimeframe={selectedTimeframe}
        setSelectedTimeframe={setSelectedTimeframe}
      />
      
      <div className="flex-1 flex flex-col">
        <Navbar 
          selectedSymbol={selectedSymbol}
          currentPrice={currentPrice}
          priceChange={priceChange}
        />
        
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 flex flex-col">
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
            
            <div className="p-4">
              <button
                onClick={handleAnalyzeMarket}
                disabled={isAnalyzing}
                className={`w-full py-3 px-6 rounded-lg font-semibold text-lg transition-all duration-200 ${
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
          
          <div className="w-96 flex flex-col border-l border-slate-700">
            <MarketData symbol={selectedSymbol} />
            <AnalysisPanel symbol={selectedSymbol} timeframe={selectedTimeframe} />
            <TradePlan tradePlan={tradePlan} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradingDashboard;
