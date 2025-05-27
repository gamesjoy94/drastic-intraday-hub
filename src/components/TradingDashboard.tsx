
import { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import ChartSection from './ChartSection';
import AnalysisPanel from './AnalysisPanel';
import TradePlan from './TradePlan';
import MarketData from './MarketData';

const TradingDashboard = () => {
  const [selectedSymbol, setSelectedSymbol] = useState('AAPL');
  const [selectedTimeframe, setSelectedTimeframe] = useState('5m');
  const [currentPrice, setCurrentPrice] = useState(0);
  const [priceChange, setPriceChange] = useState(0);
  const [tradePlan, setTradePlan] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyzeMarket = async () => {
    setIsAnalyzing(true);
    console.log(`Analyzing ${selectedSymbol} on ${selectedTimeframe} timeframe`);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock trade plan for demonstration
      const mockTradePlan = {
        entry: currentPrice + (Math.random() - 0.5) * 2,
        stopLoss: currentPrice - Math.random() * 5,
        takeProfit: currentPrice + Math.random() * 10,
        riskReward: (2 + Math.random() * 2).toFixed(1),
        strategy: `Based on technical analysis of ${selectedSymbol}, we identified a potential bullish setup with EMA crossover and RSI divergence. Entry recommended near current support level with favorable risk-reward ratio.`,
        confidence: Math.floor(70 + Math.random() * 25),
        indicators: {
          ema: 'Bullish crossover detected',
          rsi: 'Oversold condition',
          macd: 'Positive momentum',
          volume: 'Above average'
        }
      };
      
      setTradePlan(mockTradePlan);
    } catch (error) {
      console.error('Analysis failed:', error);
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
                setCurrentPrice(price);
                setPriceChange(change);
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
