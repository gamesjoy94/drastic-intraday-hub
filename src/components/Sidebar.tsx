
import { useState } from 'react';
import { ChartBar, Settings } from 'lucide-react';

interface SidebarProps {
  selectedSymbol: string;
  setSelectedSymbol: (symbol: string) => void;
  selectedTimeframe: string;
  setSelectedTimeframe: (timeframe: string) => void;
}

const Sidebar = ({ selectedSymbol, setSelectedSymbol, selectedTimeframe, setSelectedTimeframe }: SidebarProps) => {
  const [symbolInput, setSymbolInput] = useState('');
  
  const popularSymbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META', 'NFLX'];
  const timeframes = [
    { value: '1min', label: '1 Minute' },
    { value: '5min', label: '5 Minutes' },
    { value: '15min', label: '15 Minutes' },
    { value: '30min', label: '30 Minutes' },
    { value: '1h', label: '1 Hour' },
    { value: '1day', label: '1 Day' }
  ];

  const handleSymbolSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (symbolInput.trim()) {
      setSelectedSymbol(symbolInput.toUpperCase().trim());
      setSymbolInput('');
    }
  };

  return (
    <div className="w-80 bg-slate-800 border-r border-slate-700 flex flex-col">
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center gap-3 mb-6">
          <ChartBar className="w-6 h-6 text-blue-400" />
          <h2 className="text-xl font-semibold">Market Analysis</h2>
        </div>
        
        {/* Symbol Search */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Symbol
          </label>
          <form onSubmit={handleSymbolSubmit} className="flex gap-2">
            <input
              type="text"
              value={symbolInput}
              onChange={(e) => setSymbolInput(e.target.value)}
              placeholder="Enter symbol..."
              className="flex-1 bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md transition-colors"
            >
              Go
            </button>
          </form>
        </div>

        {/* Popular Symbols */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Popular Symbols
          </label>
          <div className="grid grid-cols-2 gap-2">
            {popularSymbols.map((symbol) => (
              <button
                key={symbol}
                onClick={() => setSelectedSymbol(symbol)}
                className={`p-2 text-sm rounded transition-colors ${
                  selectedSymbol === symbol
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {symbol}
              </button>
            ))}
          </div>
        </div>

        {/* Timeframe Selection */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Timeframe
          </label>
          <div className="space-y-2">
            {timeframes.map((tf) => (
              <button
                key={tf.value}
                onClick={() => setSelectedTimeframe(tf.value)}
                className={`w-full p-2 text-sm text-left rounded transition-colors ${
                  selectedTimeframe === tf.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Trading Tools */}
      <div className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Settings className="w-5 h-5 text-slate-400" />
          <h3 className="font-medium text-slate-300">Trading Tools</h3>
        </div>
        
        <div className="space-y-3">
          <div className="bg-slate-700 rounded-lg p-3">
            <div className="text-sm text-slate-300">Market Status</div>
            <div className="text-green-400 font-medium">Open</div>
          </div>
          
          <div className="bg-slate-700 rounded-lg p-3">
            <div className="text-sm text-slate-300">Session</div>
            <div className="text-blue-400 font-medium">US Market</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
