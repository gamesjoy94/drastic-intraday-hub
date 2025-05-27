
import { useEffect, useRef } from 'react';

interface ChartSectionProps {
  symbol: string;
  timeframe: string;
  onPriceUpdate: (price: number, change: number) => void;
}

const ChartSection = ({ symbol, timeframe, onPriceUpdate }: ChartSectionProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Simulate price updates
    const interval = setInterval(() => {
      const basePrice = 150 + Math.random() * 50;
      const change = (Math.random() - 0.5) * 4;
      onPriceUpdate(basePrice, change);
    }, 3000);

    return () => clearInterval(interval);
  }, [onPriceUpdate]);

  useEffect(() => {
    if (containerRef.current) {
      // Clear previous widget
      containerRef.current.innerHTML = '';

      // Create TradingView widget script
      const script = document.createElement('script');
      script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
      script.type = 'text/javascript';
      script.async = true;
      script.innerHTML = JSON.stringify({
        autosize: true,
        symbol: symbol,
        interval: timeframe,
        timezone: "Etc/UTC",
        theme: "dark",
        style: "1",
        locale: "en",
        enable_publishing: false,
        withdateranges: true,
        hide_side_toolbar: false,
        allow_symbol_change: true,
        details: true,
        hotlist: true,
        calendar: false,
        support_host: "https://www.tradingview.com"
      });

      containerRef.current.appendChild(script);
    }
  }, [symbol, timeframe]);

  return (
    <div className="flex-1 bg-slate-800 m-4 rounded-lg overflow-hidden">
      <div className="h-full">
        <div
          ref={containerRef}
          className="tradingview-widget-container h-full"
          style={{ height: '100%', width: '100%' }}
        >
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <div className="text-slate-400">Loading {symbol} Chart...</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartSection;
