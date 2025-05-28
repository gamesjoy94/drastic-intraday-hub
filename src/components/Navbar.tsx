
import { Clock, TrendingUp, Zap } from 'lucide-react';

interface NavbarProps {
  selectedSymbol: string;
  currentPrice: number;
  priceChange: number;
  selectedTimeframe: string;
  onTimeframeChange: (newTimeframe: string) => void;
}

const Navbar = ({ 
  selectedSymbol, 
  currentPrice, 
  priceChange, 
  selectedTimeframe, 
  onTimeframeChange 
}: NavbarProps) => {
  const currentTime = new Date().toLocaleTimeString();
  
  const timeframes = [
    { value: '1min', label: '1m' },
    { value: '5min', label: '5m' },
    { value: '15min', label: '15m' },
    { value: '30min', label: '30m' },
    { value: '1h', label: '1h' },
    { value: '4h', label: '4h' },
    { value: '1D', label: '1D' }
  ];
  
  return (
    <nav className="bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-700 px-3 lg:px-6 py-3 lg:py-4 shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 lg:gap-6 min-w-0">
          {/* Professional Logo with Initials */}
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg p-2 lg:p-3 shadow-lg">
              <div className="text-slate-900 font-bold text-sm lg:text-lg leading-none">
                ED
              </div>
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg lg:text-2xl font-bold text-yellow-400 truncate">
                E.DRASTIC pro
              </h1>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 hidden sm:block">
                  by E.drastic
                </span>
                <div className="hidden md:flex items-center gap-1 text-xs text-yellow-300 bg-yellow-400/10 px-2 py-1 rounded-full border border-yellow-400/20">
                  <Zap className="w-3 h-3" />
                  <span className="font-medium">Precision. Profit. Performance.</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 lg:gap-4 min-w-0">
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
            
            {/* Timeframe Selector */}
            <div className="flex items-center gap-1 bg-slate-800/50 rounded-lg border border-slate-600 p-1">
              {timeframes.map((tf) => (
                <button
                  key={tf.value}
                  onClick={() => onTimeframeChange(tf.value)}
                  className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                    selectedTimeframe === tf.value
                      ? 'bg-yellow-400 text-slate-900'
                      : 'text-slate-400 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  {tf.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 lg:gap-4">
          {/* Mobile motto */}
          <div className="md:hidden flex items-center gap-1 text-xs text-yellow-300 bg-yellow-400/10 px-2 py-1 rounded-full border border-yellow-400/20">
            <Zap className="w-3 h-3" />
            <span className="font-medium">P³</span>
          </div>
          
          <div className="hidden sm:flex items-center gap-2 text-slate-400 bg-slate-800/50 px-3 py-2 rounded-lg border border-slate-600">
            <Clock className="w-4 h-4" />
            <span className="text-xs lg:text-sm font-medium">{currentTime}</span>
          </div>
          
          <div className="flex items-center gap-1 lg:gap-2 bg-green-500/10 px-3 py-2 rounded-lg border border-green-500/20">
            <div className="w-2 h-2 lg:w-3 lg:h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs lg:text-sm text-green-400 font-medium hidden sm:inline">
              Live Market
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
