
import { TrendingUp } from 'lucide-react';

interface LivePriceBannerProps {
  livePriceData: {
    price: number;
    change: number;
    timestamp: string;
  } | null;
}

const LivePriceBanner = ({ livePriceData }: LivePriceBannerProps) => {
  if (!livePriceData) return null;

  return (
    <div className="bg-gradient-to-r from-yellow-600 to-yellow-700 p-2 lg:p-3 border-b border-yellow-500 relative z-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 lg:gap-3">
          <TrendingUp className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
          <span className="text-white font-semibold text-sm lg:text-base">Live XAUUSD Feed</span>
        </div>
        <div className="flex items-center gap-2 lg:gap-4 text-white">
          <span className="text-base lg:text-lg font-bold">
            ${livePriceData.price.toFixed(2)}
          </span>
          <span className={`text-xs lg:text-sm font-medium ${
            livePriceData.change >= 0 ? 'text-green-200' : 'text-red-200'
          }`}>
            {livePriceData.change >= 0 ? '+' : ''}{livePriceData.change.toFixed(3)}%
          </span>
          <span className="text-xs opacity-75 hidden sm:inline">
            {livePriceData.timestamp}
          </span>
        </div>
      </div>
    </div>
  );
};

export default LivePriceBanner;
