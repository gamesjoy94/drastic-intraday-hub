
import { useEffect, useRef, useState } from 'react';
import { AlertCircle, RefreshCw, TrendingUp } from 'lucide-react';

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
  const [livePriceData, setLivePriceData] = useState<{
    price: number;
    change: number;
    timestamp: string;
  } | null>(null);

  // Enhanced live price simulation for XAUUSD with more realistic movements
  useEffect(() => {
    let basePrice = 2650; // Typical XAUUSD price range
    let lastPrice = basePrice;
    
    const updatePrice = () => {
      // More realistic gold price movements (smaller, more frequent changes)
      const volatility = 0.0008; // 0.08% max change per update
      const randomChange = (Math.random() - 0.5) * volatility;
      const newPrice = lastPrice * (1 + randomChange);
      
      // Add some momentum (trending behavior)
      const momentum = Math.sin(Date.now() / 100000) * 0.0002;
      const finalPrice = newPrice * (1 + momentum);
      
      const priceChange = ((finalPrice - basePrice) / basePrice) * 100;
      
      setLivePriceData({
        price: finalPrice,
        change: priceChange,
        timestamp: new Date().toLocaleTimeString()
      });
      
      onPriceUpdate(finalPrice, priceChange);
      lastPrice = finalPrice;
    };

    // Update price every 2 seconds for more live feel
    updatePrice(); // Initial update
    const interval = setInterval(updatePrice, 2000);

    return () => clearInterval(interval);
  }, [onPriceUpdate]);

  useEffect(() => {
    console.log('ChartSection: Loading XAUUSD chart');
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
    console.log('ChartSection: Loading TradingView widget for XAUUSD');
    
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
        symbol: "FX:XAUUSD", // Explicit XAUUSD symbol
        interval: timeframe,
        timezone: "Etc/UTC",
        theme: "dark",
        style: "1",
        locale: "en",
        enable_publishing: false,
        withdateranges: true,
        hide_side_toolbar: false,
        allow_symbol_change: false, // Prevent changing from XAUUSD
        details: true,
        hotlist: true,
        calendar: true,
        support_host: "https://www.tradingview.com"
      };

      script.innerHTML = JSON.stringify(config);

      script.onload = () => {
        console.log('ChartSection: TradingView XAUUSD chart loaded successfully');
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
  }, [widgetKey, timeframe]);

  const handleRetryChart = () => {
    console.log('ChartSection: Retrying XAUUSD chart load');
    setChartError(false);
    setIsLoading(true);
    setWidgetKey(prev => prev + 1);
  };

  return (
    <div className="flex-1 bg-slate-800 m-4 rounded-lg overflow-hidden">
      {/* Live Price Banner */}
      {livePriceData && (
        <div className="bg-gradient-to-r from-yellow-600 to-yellow-700 p-3 border-b border-yellow-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-white" />
              <span className="text-white font-semibold">Live XAUUSD Feed</span>
            </div>
            <div className="flex items-center gap-4 text-white">
              <span className="text-lg font-bold">
                ${livePriceData.price.toFixed(2)}
              </span>
              <span className={`text-sm font-medium ${
                livePriceData.change >= 0 ? 'text-green-200' : 'text-red-200'
              }`}>
                {livePriceData.change >= 0 ? '+' : ''}{livePriceData.change.toFixed(3)}%
              </span>
              <span className="text-xs opacity-75">
                {livePriceData.timestamp}
              </span>
            </div>
          </div>
        </div>
      )}

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
              <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <div className="text-slate-400">Loading XAUUSD Chart...</div>
              <div className="text-xs text-slate-500 mt-2">Gold/USD Live Trading Chart</div>
            </div>
          </div>
        )}
        
        {/* Error State */}
        {chartError && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <div className="text-slate-400 mb-2">Failed to load XAUUSD chart</div>
              <div className="text-xs text-slate-500 mb-4">Chart connection interrupted</div>
              <button
                onClick={handleRetryChart}
                className="flex items-center gap-2 mx-auto px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg transition-colors"
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
