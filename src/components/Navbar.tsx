
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
    <nav className="bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-700 px-2 sm:px-3 lg:px-6 py-2 sm:py-3 lg:py-4 shadow-lg">
      {/* Mobile Layout - Stacked */}
      <div className="flex flex-col gap-2 sm:hidden">
        {/* Top row - Logo and Price Info */}
        <div className="flex items-center justify-between">
          {/* Logo Section - Compact for mobile */}
          <div className="flex items-center gap-2 min-w-0 flex-shrink-0">
            <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg p-1.5 shadow-lg">
              <div className="text-slate-900 font-bold text-xs leading-none">
                ED
              </div>
            </div>
            <div className="flex flex-col min-w-0">
              <h1 className="text-sm font-bold text-yellow-400 truncate">
                E.DRASTIC pro
              </h1>
              <span className="text-xs text-slate-400 truncate">
                by E.drastic
              </span>
            </div>
          </div>

          {/* Price Info - Mobile */}
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
        </div>

        {/* Bottom row - Timeframe and Controls */}
        <div className="flex items-center justify-between gap-2">
          {/* Timeframe Selector - Mobile optimized */}
          <div className="bg-slate-800 rounded-lg border border-yellow-400/30 p-0.5 shadow-lg flex-1 max-w-xs">
            <div className="flex items-center gap-0.5 overflow-x-auto">
              {timeframes.map((tf) => (
                <button
                  key={tf.value}
                  onClick={() => onTimeframeChange(tf.value)}
                  className={`px-1.5 py-1 text-xs font-semibold rounded-md transition-all duration-200 min-w-[28px] flex-shrink-0 ${
                    selectedTimeframe === tf.value
                      ? 'bg-yellow-400 text-slate-900 shadow-md'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/70'
                  }`}
                >
                  {tf.label}
                </button>
              ))}
            </div>
          </div>
          
          {/* Right Controls - Mobile */}
          <div className="flex items-center gap-1">
            <div className="flex items-center gap-1 text-xs text-yellow-300 bg-yellow-400/10 px-1.5 py-1 rounded-full border border-yellow-400/20">
              <Zap className="w-3 h-3" />
              <span className="font-medium">P³</span>
            </div>
            
            <div className="flex items-center gap-1 bg-green-500/10 px-1.5 py-1 rounded-lg border border-green-500/20">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-400 font-medium">Live</span>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop/Tablet Layout - Single Row */}
      <div className="hidden sm:flex items-center justify-between gap-2 lg:gap-4">
        {/* Left Section - Logo and Brand */}
        <div className="flex items-center gap-2 lg:gap-3 min-w-0 flex-shrink-0">
          <div className="flex items-center gap-2 lg:gap-3">
            <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg p-2 lg:p-3 shadow-lg flex-shrink-0">
              <div className="text-slate-900 font-bold text-sm lg:text-lg leading-none">
                ED
              </div>
            </div>
            <div className="flex flex-col min-w-0">
              <h1 className="text-base lg:text-2xl font-bold text-yellow-400 truncate">
                E.DRASTIC pro
              </h1>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">
                  by E.drastic
                </span>
                <div className="hidden lg:flex items-center gap-1 text-xs text-yellow-300 bg-yellow-400/10 px-2 py-1 rounded-full border border-yellow-400/20">
                  <Zap className="w-3 h-3" />
                  <span className="font-medium">Precision. Profit. Performance.</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Center Section - Symbol and Price Info */}
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
        
        {/* Right Section - Controls */}
        <div className="flex items-center gap-2 lg:gap-3 flex-shrink-0">
          {/* Timeframe Selector - Desktop/Tablet */}
          <div className="bg-slate-800 rounded-lg border border-yellow-400/30 p-1 shadow-lg">
            <div className="flex items-center gap-0.5">
              {timeframes.map((tf) => (
                <button
                  key={tf.value}
                  onClick={() => onTimeframeChange(tf.value)}
                  className={`px-2 py-1.5 text-xs font-semibold rounded-md transition-all duration-200 min-w-[32px] ${
                    selectedTimeframe === tf.value
                      ? 'bg-yellow-400 text-slate-900 shadow-md'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/70'
                  }`}
                >
                  {tf.label}
                </button>
              ))}
            </div>
          </div>
          
          {/* Tablet motto - Compact */}
          <div className="lg:hidden flex items-center gap-1 text-xs text-yellow-300 bg-yellow-400/10 px-2 py-1 rounded-full border border-yellow-400/20">
            <Zap className="w-3 h-3" />
            <span className="font-medium">P³</span>
          </div>
          
          {/* Time Display */}
          <div className="hidden md:flex items-center gap-2 text-slate-400 bg-slate-800/50 px-2 lg:px-3 py-2 rounded-lg border border-slate-600">
            <Clock className="w-4 h-4" />
            <span className="text-xs lg:text-sm font-medium">{currentTime}</span>
          </div>
          
          {/* Live Market Indicator */}
          <div className="flex items-center gap-1 lg:gap-2 bg-green-500/10 px-2 lg:px-3 py-2 rounded-lg border border-green-500/20">
            <div className="w-2 h-2 lg:w-3 lg:h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs lg:text-sm text-green-400 font-medium hidden md:inline">
              Live
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
