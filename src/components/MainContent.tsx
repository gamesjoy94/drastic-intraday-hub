
import { RefreshCw } from 'lucide-react';
import ChartSection from './ChartSection';

interface MainContentProps {
  selectedSymbol: string;
  selectedTimeframe: string;
  currentPrice: number;
  setCurrentPrice: (price: number) => void;
  priceChange: number;
  setPriceChange: (change: number) => void;
  isAnalyzing: boolean;
  connectionError: boolean;
  onAnalyze: () => void;
}

const MainContent = ({
  selectedSymbol,
  selectedTimeframe,
  currentPrice,
  setCurrentPrice,
  priceChange,
  setPriceChange,
  isAnalyzing,
  connectionError,
  onAnalyze
}: MainContentProps) => {
  return (
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
          onClick={onAnalyze}
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
              Analyzing with AI...
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
  );
};

export default MainContent;
