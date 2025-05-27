
import { useEffect, useRef, useState } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ChartSectionProps {
  symbol: string;
  timeframe: string;
  onPriceUpdate: (price: number, change: number) => void;
}

const ChartSection = ({ symbol, timeframe, onPriceUpdate }: ChartSectionProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [chartError, setChartError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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
    setIsLoading(true);
    setChartError(false);

    if (containerRef.current) {
      // Clear previous widget
      containerRef.current.innerHTML = '';

      try {
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

        script.onload = () => {
          setIsLoading(false);
          setChartError(false);
        };

        script.onerror = () => {
          setIsLoading(false);
          setChartError(true);
        };

        containerRef.current.appendChild(script);

        // Set a timeout to handle cases where the script doesn't load
        const timeout = setTimeout(() => {
          setIsLoading(false);
        }, 10000);

        return () => clearTimeout(timeout);

      } catch (error) {
        console.error('Error loading TradingView chart:', error);
        setIsLoading(false);
        setChartError(true);
      }
    }
  }, [symbol, timeframe]);

  const handleRetryChart = () => {
    setChartError(false);
    setIsLoading(true);
    // Re-trigger the chart loading
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
      const event = new Event('retry');
      containerRef.current.dispatchEvent(event);
    }
  };

  return (
    <div className="flex-1 bg-slate-800 m-4 rounded-lg overflow-hidden">
      <div className="h-full">
        <div
          ref={containerRef}
          className="tradingview-widget-container h-full"
          style={{ height: '100%', width: '100%' }}
        >
          {isLoading && !chartError && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <div className="text-slate-400">Loading {symbol} Chart...</div>
              </div>
            </div>
          )}
          
          {chartError && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <div className="text-slate-400 mb-4">Failed to load chart</div>
                <button
                  onClick={handleRetryChart}
                  className="flex items-center gap-2 mx-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Retry Chart
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChartSection;
