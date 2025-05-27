
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
      
      {/* Always visible analysis button */}
      <div className="p-3 lg:p-4 border-t border-slate-700 bg-slate-900 relative z-10">
        <button
          onClick={onAnalyze}
          disabled={isAnalyzing}
          className={`w-full py-3 lg:py-4 px-4 lg:px-6 rounded-lg font-semibold text-base lg:text-lg transition-all duration-200 ${
            isAnalyzing 
              ? 'bg-gray-600 cursor-not-allowed opacity-70' 
              : connectionError
              ? 'bg-red-600 hover:bg-red-700 shadow-lg'
              : 'bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 hover:shadow-lg transform hover:scale-[1.02]'
          }`}
        >
          {isAnalyzing ? (
            <div className="flex items-center justify-center gap-3">
              <div className="w-5 h-5 lg:w-6 lg:h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Analyzing Gold Market...</span>
            </div>
          ) : connectionError ? (
            <div className="flex items-center justify-center gap-3">
              <RefreshCw className="w-5 h-5 lg:w-6 lg:h-6" />
              <span>Retry Analysis</span>
            </div>
          ) : (
            <span>🏆 Start Gold Trading Analysis</span>
          )}
        </button>
      </div>
    </div>
  );
};

export default MainContent;
