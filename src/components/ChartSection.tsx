
import { useEffect, useRef, useState } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ChartSectionProps {
  symbol: string;
  timeframe: string;
  onPriceUpdate: (price: number, change: number) => void;
}

const ChartSection = ({ symbol, timeframe, onPriceUpdate }: ChartSectionProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<HTMLDivElement>(null);
  const [chartError, setChartError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [widgetKey, setWidgetKey] = useState(0);

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
    console.log('ChartSection: Symbol or timeframe changed', { symbol, timeframe });
    setIsLoading(true);
    setChartError(false);
    
    // Force re-render of widget container by changing key
    setWidgetKey(prev => prev + 1);
    
    const loadTimeout = setTimeout(() => {
      if (isLoading) {
        console.log('ChartSection: Widget load timeout');
        setIsLoading(false);
        setChartError(false); // Don't show error for timeout, just stop loading
      }
    }, 8000);

    return () => {
      clearTimeout(loadTimeout);
    };
  }, [symbol, timeframe]);

  useEffect(() => {
    console.log('ChartSection: Loading widget with key', widgetKey);
    
    if (!widgetRef.current) {
      console.log('ChartSection: Widget ref not available');
      return;
    }

    try {
      // Create widget container
      const widgetContainer = document.createElement('div');
      widgetContainer.className = 'tradingview-widget-container__widget';
      widgetContainer.style.height = '100%';
      widgetContainer.style.width = '100%';

      // Create script element
      const script = document.createElement('script');
      script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
      script.type = 'text/javascript';
      script.async = true;
      
      const config = {
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
      };

      script.innerHTML = JSON.stringify(config);

      script.onload = () => {
        console.log('ChartSection: TradingView script loaded successfully');
        setIsLoading(false);
        setChartError(false);
      };

      script.onerror = (error) => {
        console.error('ChartSection: TradingView script failed to load', error);
        setIsLoading(false);
        setChartError(true);
      };

      // Clear and append new content
      widgetRef.current.innerHTML = '';
      widgetContainer.appendChild(script);
      widgetRef.current.appendChild(widgetContainer);

    } catch (error) {
      console.error('ChartSection: Error creating TradingView widget:', error);
      setIsLoading(false);
      setChartError(true);
    }
  }, [widgetKey, symbol, timeframe]);

  const handleRetryChart = () => {
    console.log('ChartSection: Retrying chart load');
    setChartError(false);
    setIsLoading(true);
    setWidgetKey(prev => prev + 1);
  };

  return (
    <div className="flex-1 bg-slate-800 m-4 rounded-lg overflow-hidden">
      <div className="h-full relative">
        {/* Widget Container */}
        <div
          key={widgetKey}
          ref={widgetRef}
          className="absolute inset-0 tradingview-widget-container"
          style={{ height: '100%', width: '100%' }}
        />
        
        {/* Loading State */}
        {isLoading && !chartError && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <div className="text-slate-400">Loading {symbol} Chart...</div>
            </div>
          </div>
        )}
        
        {/* Error State */}
        {chartError && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
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
  );
};

export default ChartSection;
