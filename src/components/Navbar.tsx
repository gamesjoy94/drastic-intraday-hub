
import { Clock } from 'lucide-react';

interface NavbarProps {
  selectedSymbol: string;
  currentPrice: number;
  priceChange: number;
}

const Navbar = ({ selectedSymbol, currentPrice, priceChange }: NavbarProps) => {
  const currentTime = new Date().toLocaleTimeString();
  
  return (
    <nav className="bg-slate-800 border-b border-slate-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <h1 className="text-2xl font-bold text-blue-400">TradingAI Pro</h1>
          
          <div className="flex items-center gap-4">
            <div className="text-lg font-semibold">{selectedSymbol}</div>
            {currentPrice > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">
                  ${currentPrice.toFixed(2)}
                </span>
                <span className={`text-sm font-medium ${
                  priceChange >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
                </span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-slate-400">
            <Clock className="w-4 h-4" />
            <span className="text-sm">{currentTime}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-green-400">Live Market</span>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
