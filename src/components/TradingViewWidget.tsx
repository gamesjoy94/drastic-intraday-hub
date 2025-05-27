
import { useEffect, useRef } from 'react';

interface TradingViewWidgetProps {
  timeframe: string;
  widgetKey: number;
  onLoadingChange: (isLoading: boolean) => void;
  onErrorChange: (hasError: boolean) => void;
}

const TradingViewWidget = ({ 
  timeframe, 
  widgetKey, 
  onLoadingChange, 
  onErrorChange 
}: TradingViewWidgetProps) => {
  const widgetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log('TradingViewWidget: Loading TradingView widget for XAUUSD');
    
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
      
      // Try multiple symbol formats for better compatibility
      const config = {
        autosize: true,
        symbol: "TVC:GOLD", // Using TVC:GOLD which is more reliable
        interval: timeframe === '5min' ? '5' : timeframe,
        timezone: "Etc/UTC",
        theme: "dark",
        style: "1",
        locale: "en",
        enable_publishing: false,
        backgroundColor: "rgba(30, 41, 59, 1)",
        gridColor: "rgba(71, 85, 105, 0.5)",
        withdateranges: true,
        hide_side_toolbar: false,
        allow_symbol_change: true, // Allow symbol change for better flexibility
        details: true,
        hotlist: false,
        calendar: false,
        show_popup_button: false,
        support_host: "https://www.tradingview.com"
      };

      script.innerHTML = JSON.stringify(config);

      script.onload = () => {
        console.log('TradingViewWidget: TradingView Gold chart loaded successfully');
        setTimeout(() => {
          onLoadingChange(false);
          onErrorChange(false);
        }, 3000); // Increased timeout for better loading
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
      }, 20000); // Increased timeout

      return () => {
        clearTimeout(fallbackTimeout);
      };

    } catch (error) {
      console.error('TradingViewWidget: Error creating TradingView widget:', error);
      onLoadingChange(false);
      onErrorChange(true);
    }
  }, [widgetKey, timeframe, onLoadingChange, onErrorChange]);

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
