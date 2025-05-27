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
  
  // Keep the ref updated without causing re-renders
  useEffect(() => {
    onPriceUpdateRef.current = onPriceUpdate;
  }, [onPriceUpdate]);

  // Enhanced live price simulation for XAUUSD with stable dependencies
  useEffect(() => {
    let basePrice = 2650;
    let lastPrice = basePrice;
    let isMounted = true;
    
    const updatePrice = () => {
      if (!isMounted) return;
      
      // More realistic gold price movements
      const volatility = 0.0008;
      const randomChange = (Math.random() - 0.5) * volatility;
      const newPrice = lastPrice * (1 + randomChange);
      
      // Add some momentum
      const momentum = Math.sin(Date.now() / 100000) * 0.0002;
      const finalPrice = newPrice * (1 + momentum);
      
      const priceChange = ((finalPrice - basePrice) / basePrice) * 100;
      
      const newPriceData = {
        price: finalPrice,
        change: priceChange,
        timestamp: new Date().toLocaleTimeString()
      };
      
      setLivePriceData(newPriceData);
      onPriceUpdateRef.current(finalPrice, priceChange);
      lastPrice = finalPrice;
    };

    // Initial update
    updatePrice();
    
    // Set up interval
    const interval = setInterval(updatePrice, 2000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []); // Empty dependency array to prevent infinite loops

  return { livePriceData };
};
