
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
  spread: number;
  marketStatus: 'ACTIVE' | 'SLOW' | 'CLOSED';
}

const MarketData = ({ symbol }: MarketDataProps) => {
  const [goldStats, setGoldStats] = useState<GoldMarketStats>({
    volume: '0',
    avgVolume: '0',
    marketCap: '0',
    high24h: 0,
    low24h: 0,
    volatility: 0,
    lastUpdate: '',
    spread: 0,
    marketStatus: 'ACTIVE'
  });

  useEffect(() => {
    // More realistic gold market data with real-time updates
    const updateGoldData = () => {
      const basePrice = 2655;
      const now = new Date();
      const marketHour = now.getUTCHours();
      
      // Determine market status based on trading sessions
      let marketStatus: 'ACTIVE' | 'SLOW' | 'CLOSED' = 'ACTIVE';
      if (marketHour >= 22 || marketHour <= 6) {
        marketStatus = 'SLOW'; // Asian session - typically slower for gold
      } else if (marketHour >= 13 && marketHour <= 17) {
        marketStatus = 'ACTIVE'; // NY + London overlap - most active
      }
      
      const volatility = marketStatus === 'ACTIVE' ? 
        Math.random() * 1.5 + 1.0 : // 1.0% to 2.5% during active hours
        Math.random() * 0.8 + 0.3;   // 0.3% to 1.1% during slow hours
      
      // More realistic volume based on market hours
      const baseVolume = marketStatus === 'ACTIVE' ? 180000 : 80000;
      const volumeVariation = Math.random() * 0.4 + 0.8; // ±20% variation
      
      const mockData: GoldMarketStats = {
        volume: Math.floor(baseVolume * volumeVariation).toString(),
        avgVolume: (baseVolume * 0.9).toFixed(0),
        marketCap: "13.2T",
        high24h: basePrice + (Math.random() * 45 + 15), // Realistic daily range
        low24h: basePrice - (Math.random() * 45 + 15),
        volatility: volatility,
        lastUpdate: now.toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        }),
        spread: marketStatus === 'ACTIVE' ? 
          Math.random() * 0.8 + 0.2 : // Tighter spreads during active hours
          Math.random() * 1.5 + 0.5,   // Wider spreads during slow hours
        marketStatus
      };
      
      setGoldStats(mockData);
    };

    updateGoldData();
    // Update every 15 seconds for more responsive market data
    const interval = setInterval(updateGoldData, 15000);
    
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

  const getMarketStatusColor = () => {
    switch (goldStats.marketStatus) {
      case 'ACTIVE': return 'text-green-400';
      case 'SLOW': return 'text-yellow-400';
      case 'CLOSED': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getMarketStatusText = () => {
    switch (goldStats.marketStatus) {
      case 'ACTIVE': return 'High Activity';
      case 'SLOW': return 'Low Activity';
      case 'CLOSED': return 'Market Closed';
      default: return 'Unknown';
    }
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
          <span className="text-slate-400 text-sm">Bid/Ask Spread</span>
          <span className="text-white font-medium">${goldStats.spread.toFixed(2)}</span>
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
            goldStats.volatility > 2.0 ? 'text-red-400' : 
            goldStats.volatility > 1.2 ? 'text-yellow-400' : 'text-green-400'
          }`}>
            {goldStats.volatility.toFixed(2)}%
          </span>
        </div>

        <div className="mt-4 p-3 bg-slate-700 rounded-lg">
          <div className="text-xs text-slate-300 mb-1">Market Status</div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full animate-pulse ${
              goldStats.marketStatus === 'ACTIVE' ? 'bg-green-400' :
              goldStats.marketStatus === 'SLOW' ? 'bg-yellow-400' : 'bg-red-400'
            }`}></div>
            <span className={`font-medium text-sm ${getMarketStatusColor()}`}>
              {getMarketStatusText()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketData;
