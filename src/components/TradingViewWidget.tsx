
import { useEffect, useRef } from 'react';

interface TradingViewWidgetProps {
  timeframe: string;
  widgetKey: number;
  onLoadingChange: (isLoading: boolean) => void;
  onErrorChange: (hasError: boolean) => void;
  symbol?: string; // Add symbol prop to make it flexible
}

const TradingViewWidget = ({ 
  timeframe, 
  widgetKey, 
  onLoadingChange, 
  onErrorChange,
  symbol = "TVC:GOLD" // Default to Gold
}: TradingViewWidgetProps) => {
  const widgetRef = useRef<HTMLDivElement>(null);

  // Convert our timeframe format to TradingView format
  const convertToTradingViewInterval = (tf: string) => {
    console.log(`TradingViewWidget: Converting timeframe ${tf} to TradingView format`);
    switch (tf) {
      case '1min': return '1';
      case '5min': return '5';
      case '15min': return '15';
      case '30min': return '30';
      case '1h': return '60';
      case '4h': return '240';
      case '1D': return 'D';
      default: 
        console.warn(`TradingViewWidget: Unknown timeframe ${tf}, defaulting to 5min`);
        return '5'; // Default to 5 min
    }
  };

  // Get the appropriate symbol based on current route or prop
  const getTradingViewSymbol = () => {
    if (window.location.pathname.includes('/eurusd')) {
      return "FX:EURUSD";
    }
    return symbol;
  };

  useEffect(() => {
    const tvInterval = convertToTradingViewInterval(timeframe);
    const tradingViewSymbol = getTradingViewSymbol();
    console.log(`TradingViewWidget: Loading TradingView widget for ${tradingViewSymbol} on ${timeframe} timeframe (TradingView interval: ${tvInterval})`);
    
    if (!widgetRef.current) {
      console.log('TradingViewWidget: Widget ref not available');
      return;
    }

    try {
      // Clear existing content
      widgetRef.current.innerHTML = '';
      
      // Create container div first
      const container = document.createElement('div');
      container.className = 'tradingview-widget-container__widget';
      container.style.height = '100%';
      container.style.width = '100%';
      
      // Create script element
      const script = document.createElement('script');
      script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
      script.type = 'text/javascript';
      script.async = true;
      
      console.log(`TradingViewWidget: Setting TradingView chart to ${timeframe} timeframe (interval: ${tvInterval})`);
      
      const config = {
        autosize: true,
        symbol: tradingViewSymbol,
        interval: tvInterval,
        timezone: "Etc/UTC",
        theme: "dark",
        style: "1",
        locale: "en",
        enable_publishing: false,
        backgroundColor: "rgba(30, 41, 59, 1)",
        gridColor: "rgba(71, 85, 105, 0.5)",
        withdateranges: true,
        hide_side_toolbar: false,
        allow_symbol_change: true,
        details: true,
        hotlist: false,
        calendar: false,
        show_popup_button: false,
        support_host: "https://www.tradingview.com"
      };

      script.innerHTML = JSON.stringify(config);

      script.onload = () => {
        console.log(`TradingViewWidget: TradingView chart loaded successfully for ${tradingViewSymbol} on ${timeframe} timeframe (interval: ${tvInterval})`);
        setTimeout(() => {
          onLoadingChange(false);
          onErrorChange(false);
        }, 3000);
      };

      script.onerror = (error) => {
        console.error('TradingViewWidget: TradingView script failed to load', error);
        onLoadingChange(false);
        onErrorChange(true);
      };

      container.appendChild(script);
      widgetRef.current.appendChild(container);

      // Set a fallback timeout to stop loading state
      const fallbackTimeout = setTimeout(() => {
        console.log('TradingViewWidget: Fallback timeout reached');
        onLoadingChange(false);
      }, 20000);

      return () => {
        clearTimeout(fallbackTimeout);
      };

    } catch (error) {
      console.error('TradingViewWidget: Error creating TradingView widget:', error);
      onLoadingChange(false);
      onErrorChange(true);
    }
  }, [widgetKey, timeframe, symbol, onLoadingChange, onErrorChange]);

  return (
    <div
      key={widgetKey}
      ref={widgetRef}
      className="tradingview-widget-container absolute inset-0"
      style={{ 
        height: '100%', 
        width: '100%',
        minHeight: '400px',
        background: 'rgba(30, 41, 59, 1)'
      }}
    />
  );
};

export default TradingViewWidget;
