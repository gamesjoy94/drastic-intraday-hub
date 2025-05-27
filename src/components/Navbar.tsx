
import { Clock } from 'lucide-react';

interface NavbarProps {
  selectedSymbol: string;
  currentPrice: number;
  priceChange: number;
}

const Navbar = ({ selectedSymbol, currentPrice, priceChange }: NavbarProps) => {
  const currentTime = new Date().toLocaleTimeString();
  
  return (
    <nav className="bg-slate-800 border-b border-slate-700 px-3 lg:px-6 py-3 lg:py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 lg:gap-6 min-w-0">
          <h1 className="text-lg lg:text-2xl font-bold text-yellow-400 truncate">
            Gold Trading Pro
          </h1>
          
          <div className="flex items-center gap-2 lg:gap-4 min-w-0">
            <div className="text-base lg:text-lg font-semibold text-yellow-300">
              {selectedSymbol}
            </div>
            {currentPrice > 0 && (
              <div className="flex items-center gap-1 lg:gap-2 min-w-0">
                <span className="text-lg lg:text-2xl font-bold truncate text-white">
                  ${currentPrice.toFixed(2)}
                </span>
                <span className={`text-xs lg:text-sm font-medium ${
                  priceChange >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
                </span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2 lg:gap-4">
          <div className="hidden sm:flex items-center gap-2 text-slate-400">
            <Clock className="w-4 h-4" />
            <span className="text-xs lg:text-sm">{currentTime}</span>
          </div>
          
          <div className="flex items-center gap-1 lg:gap-2">
            <div className="w-2 h-2 lg:w-3 lg:h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs lg:text-sm text-green-400 hidden sm:inline">
              Live Gold Market
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
