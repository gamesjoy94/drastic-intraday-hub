
import { TrendingUp, Clock } from 'lucide-react';

interface LivePriceBannerProps {
  livePriceData: {
    price: number;
    change: number;
    timestamp: string;
  } | null;
}

const LivePriceBanner = ({ livePriceData }: LivePriceBannerProps) => {
  if (!livePriceData) return null;

  // Determine if price movement is significant
  const isSignificantMove = Math.abs(livePriceData.change) > 0.5;
  
  // Get current market session
  const getCurrentSession = () => {
    const hour = new Date().getUTCHours();
    if (hour >= 22 || hour <= 6) return 'Asian Session';
    if (hour >= 7 && hour <= 12) return 'London Session';
    if (hour >= 13 && hour <= 17) return 'NY/London Overlap';
    return 'NY Session';
  };

  return (
    <div className={`p-2 lg:p-3 border-b relative z-10 transition-colors duration-300 ${
      isSignificantMove 
        ? 'bg-gradient-to-r from-orange-600 to-red-600 border-red-500' 
        : 'bg-gradient-to-r from-yellow-600 to-yellow-700 border-yellow-500'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 lg:gap-3">
          <TrendingUp className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
          <span className="text-white font-semibold text-sm lg:text-base">Live XAUUSD Feed</span>
          <span className="text-xs text-white/80 hidden md:inline">
            {getCurrentSession()}
          </span>
        </div>
        <div className="flex items-center gap-2 lg:gap-4 text-white">
          <span className="text-base lg:text-lg font-bold">
            ${livePriceData.price.toFixed(2)}
          </span>
          <span className={`text-xs lg:text-sm font-medium px-2 py-1 rounded ${
            livePriceData.change >= 0 ? 'text-green-200 bg-green-500/20' : 'text-red-200 bg-red-500/20'
          } ${isSignificantMove ? 'animate-pulse' : ''}`}>
            {livePriceData.change >= 0 ? '+' : ''}{livePriceData.change.toFixed(3)}%
          </span>
          <div className="flex items-center gap-1 text-xs opacity-75 hidden sm:flex">
            <Clock className="w-3 h-3" />
            <span>{livePriceData.timestamp}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LivePriceBanner;
