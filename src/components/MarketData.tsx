
import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface MarketDataProps {
  symbol: string;
}

interface GoldMarketStats {
  volume: string;
  avgVolume: string;
  marketCap: string;
  high24h: number;
  low24h: number;
  volatility: number;
  lastUpdate: string;
}

const MarketData = ({ symbol }: MarketDataProps) => {
  const [goldStats, setGoldStats] = useState<GoldMarketStats>({
    volume: '0',
    avgVolume: '0',
    marketCap: '0',
    high24h: 0,
    low24h: 0,
    volatility: 0,
    lastUpdate: ''
  });

  useEffect(() => {
    // Simulate realistic gold market data
    const updateGoldData = () => {
      const basePrice = 2650;
      const volatility = Math.random() * 2 + 0.5; // 0.5% to 2.5%
      
      const mockData: GoldMarketStats = {
        volume: (Math.random() * 150000 + 50000).toFixed(0), // Gold trading volume
        avgVolume: (Math.random() * 120000 + 60000).toFixed(0),
        marketCap: "13.2T", // Gold market cap is massive
        high24h: basePrice + (Math.random() * 50 + 10),
        low24h: basePrice - (Math.random() * 50 + 10),
        volatility: volatility,
        lastUpdate: new Date().toLocaleTimeString()
      };
      
      setGoldStats(mockData);
    };

    updateGoldData();
    // Update every 30 seconds for live feel
    const interval = setInterval(updateGoldData, 30000);
    
    return () => clearInterval(interval);
  }, [symbol]);

  const formatVolume = (volume: string) => {
    const num = parseInt(volume);
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  return (
    <div className="p-4 border-b border-slate-700">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-6 h-6 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full"></div>
        <h3 className="text-lg font-semibold text-slate-200">Gold Market Data</h3>
        <div className="ml-auto text-xs text-slate-400">
          Last: {goldStats.lastUpdate}
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-slate-400 text-sm">Volume (24h)</span>
          <span className="text-white font-medium">{formatVolume(goldStats.volume)}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-slate-400 text-sm">Avg Volume</span>
          <span className="text-white font-medium">{formatVolume(goldStats.avgVolume)}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-slate-400 text-sm">Market Cap</span>
          <span className="text-white font-medium">${goldStats.marketCap}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-slate-400 text-sm flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            24h High
          </span>
          <span className="text-green-400 font-medium">${goldStats.high24h.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-slate-400 text-sm flex items-center gap-1">
            <TrendingDown className="w-3 h-3" />
            24h Low
          </span>
          <span className="text-red-400 font-medium">${goldStats.low24h.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-slate-400 text-sm">Volatility</span>
          <span className={`font-medium ${
            goldStats.volatility > 1.5 ? 'text-red-400' : 
            goldStats.volatility > 1 ? 'text-yellow-400' : 'text-green-400'
          }`}>
            {goldStats.volatility.toFixed(2)}%
          </span>
        </div>

        <div className="mt-4 p-3 bg-slate-700 rounded-lg">
          <div className="text-xs text-slate-300 mb-1">Market Status</div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-green-400 font-medium text-sm">Live Trading Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketData;
