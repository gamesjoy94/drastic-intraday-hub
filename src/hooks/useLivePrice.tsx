
import { useEffect, useState, useRef } from 'react';

interface LivePriceData {
  price: number;
  change: number;
  timestamp: string;
}

interface UseLivePriceProps {
  onPriceUpdate: (price: number, change: number) => void;
}

export const useLivePrice = ({ onPriceUpdate }: UseLivePriceProps) => {
  const [livePriceData, setLivePriceData] = useState<LivePriceData | null>(null);
  const onPriceUpdateRef = useRef(onPriceUpdate);
  const lastUpdateRef = useRef<number>(0);
  
  // Keep the ref updated without causing re-renders
  useEffect(() => {
    onPriceUpdateRef.current = onPriceUpdate;
  }, [onPriceUpdate]);

  // Enhanced live price simulation for XAUUSD with faster updates and market-realistic movements
  useEffect(() => {
    // More realistic starting price based on recent gold market levels
    let basePrice = 2655;
    let lastPrice = basePrice;
    let isMounted = true;
    let trend = 0; // Market trend momentum
    
    const updatePrice = () => {
      if (!isMounted) return;
      
      const now = Date.now();
      
      // Faster updates during market hours (simulate more activity)
      const marketHour = new Date().getUTCHours();
      const isActiveMarketHours = (marketHour >= 13 && marketHour <= 21); // NY + London overlap
      
      // More realistic gold price movements with trend continuation
      const baseVolatility = isActiveMarketHours ? 0.0012 : 0.0006;
      const randomFactor = (Math.random() - 0.5) * 2;
      
      // Add trend momentum (gold often moves in trends)
      trend = trend * 0.95 + randomFactor * 0.1;
      const trendInfluence = trend * 0.0003;
      
      // Market microstructure simulation
      const tickMovement = (randomFactor * baseVolatility) + trendInfluence;
      const newPrice = lastPrice * (1 + tickMovement);
      
      // Add some realistic price clustering around psychological levels
      const roundedPrice = Math.round(newPrice * 100) / 100;
      
      const priceChange = ((roundedPrice - basePrice) / basePrice) * 100;
      
      const newPriceData = {
        price: roundedPrice,
        change: priceChange,
        timestamp: new Date().toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })
      };
      
      setLivePriceData(newPriceData);
      onPriceUpdateRef.current(roundedPrice, priceChange);
      lastPrice = roundedPrice;
      lastUpdateRef.current = now;
    };

    // Initial update
    updatePrice();
    
    // Faster update interval for more responsive live data
    // Use different intervals based on market activity
    const updateInterval = 1000; // Update every 1 second for more real-time feel
    const interval = setInterval(updatePrice, updateInterval);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []); // Empty dependency array to prevent infinite loops

  return { livePriceData };
};
