
import { TrendingUp } from 'lucide-react';

interface NavbarPriceInfoProps {
  selectedSymbol: string;
  currentPrice: number;
  priceChange: number;
  isMobile?: boolean;
}

const NavbarPriceInfo = ({ selectedSymbol, currentPrice, priceChange, isMobile = false }: NavbarPriceInfoProps) => {
  if (isMobile) {
    return (
      <div className="flex items-center gap-1 min-w-0">
        <div className="flex items-center gap-1">
          <TrendingUp className="w-3 h-3 text-yellow-400" />
          <div className="text-sm font-semibold text-yellow-300">
            {selectedSymbol}
          </div>
        </div>
        {currentPrice > 0 && (
          <div className="flex flex-col items-end">
            <span className="text-sm font-bold text-white">
              ${currentPrice.toFixed(2)}
            </span>
            <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${
              priceChange >= 0 
                ? 'text-green-400 bg-green-400/10' 
                : 'text-red-400 bg-red-400/10'
            }`}>
              {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
            </span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 lg:gap-4 min-w-0 flex-1 justify-center">
      <div className="flex items-center gap-1">
        <TrendingUp className="w-4 h-4 text-yellow-400" />
        <div className="text-base lg:text-lg font-semibold text-yellow-300">
          {selectedSymbol}
        </div>
      </div>
      {currentPrice > 0 && (
        <div className="flex items-center gap-1 lg:gap-2 min-w-0">
          <span className="text-lg lg:text-2xl font-bold truncate text-white">
            ${currentPrice.toFixed(2)}
          </span>
          <span className={`text-xs lg:text-sm font-medium px-2 py-1 rounded-full ${
            priceChange >= 0 
              ? 'text-green-400 bg-green-400/10' 
              : 'text-red-400 bg-red-400/10'
          }`}>
            {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
          </span>
        </div>
      )}
    </div>
  );
};

export default NavbarPriceInfo;
