
import { useEffect, useState } from 'react';

interface MarketDataProps {
  symbol: string;
}

interface MarketStats {
  volume: string;
  avgVolume: string;
  marketCap: string;
  peRatio: string;
  high52w: number;
  low52w: number;
}

const MarketData = ({ symbol }: MarketDataProps) => {
  const [marketStats, setMarketStats] = useState<MarketStats>({
    volume: '0',
    avgVolume: '0',
    marketCap: '0',
    peRatio: '0',
    high52w: 0,
    low52w: 0
  });

  useEffect(() => {
    // Simulate market data
    const mockData: MarketStats = {
      volume: (Math.random() * 50000000).toFixed(0),
      avgVolume: (Math.random() * 30000000).toFixed(0),
      marketCap: (Math.random() * 2000).toFixed(1) + 'B',
      peRatio: (15 + Math.random() * 20).toFixed(1),
      high52w: 200 + Math.random() * 50,
      low52w: 80 + Math.random() * 40
    };
    
    setMarketStats(mockData);
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
      <h3 className="text-lg font-semibold mb-4 text-slate-200">Market Data</h3>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-slate-400 text-sm">Volume</span>
          <span className="text-white font-medium">{formatVolume(marketStats.volume)}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-slate-400 text-sm">Avg Volume</span>
          <span className="text-white font-medium">{formatVolume(marketStats.avgVolume)}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-slate-400 text-sm">Market Cap</span>
          <span className="text-white font-medium">${marketStats.marketCap}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-slate-400 text-sm">P/E Ratio</span>
          <span className="text-white font-medium">{marketStats.peRatio}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-slate-400 text-sm">52W High</span>
          <span className="text-green-400 font-medium">${marketStats.high52w.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-slate-400 text-sm">52W Low</span>
          <span className="text-red-400 font-medium">${marketStats.low52w.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default MarketData;
