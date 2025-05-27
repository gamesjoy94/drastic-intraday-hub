
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
            setCurrentPrice(price);
            setPriceChange(change);
          }}
        />
      </div>
      
      {/* Fixed bottom button with better spacing */}
      <div className="p-3 lg:p-4 border-t border-slate-700 bg-slate-900 relative z-10">
        <button
          onClick={onAnalyze}
          disabled={isAnalyzing}
          className={`w-full py-2 lg:py-3 px-4 lg:px-6 rounded-lg font-semibold text-sm lg:text-lg transition-all duration-200 ${
            isAnalyzing 
              ? 'bg-gray-600 cursor-not-allowed' 
              : connectionError
              ? 'bg-red-600 hover:bg-red-700'
              : 'bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 hover:shadow-lg'
          }`}
        >
          {isAnalyzing ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 lg:w-5 lg:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs lg:text-base">Analyzing Gold Market...</span>
            </div>
          ) : connectionError ? (
            <div className="flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 lg:w-5 lg:h-5" />
              <span className="text-xs lg:text-base">Reconnect & Analyze Gold</span>
            </div>
          ) : (
            <span className="text-xs lg:text-base">🏆 Smart Gold Trading Analysis</span>
          )}
        </button>
      </div>
    </div>
  );
};

export default MainContent;
