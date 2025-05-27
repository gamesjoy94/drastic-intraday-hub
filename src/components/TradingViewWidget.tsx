
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
      
      // Create widget container with proper styling
      const widgetContainer = document.createElement('div');
      widgetContainer.className = 'tradingview-widget-container__widget';
      widgetContainer.style.cssText = `
        height: 100% !important;
        width: 100% !important;
        position: relative;
        box-sizing: border-box;
      `;

      // Create script element
      const script = document.createElement('script');
      script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
      script.type = 'text/javascript';
      script.async = true;
      
      const config = {
        autosize: true,
        symbol: "FX:XAUUSD",
        interval: timeframe,
        timezone: "Etc/UTC",
        theme: "dark",
        style: "1",
        locale: "en",
        enable_publishing: false,
        withdateranges: true,
        hide_side_toolbar: false,
        allow_symbol_change: false,
        details: true,
        hotlist: true,
        calendar: true,
        studies: [
          "MASimple@tv-basicstudies"
        ],
        show_popup_button: true,
        popup_width: "1000",
        popup_height: "650",
        support_host: "https://www.tradingview.com"
      };

      script.innerHTML = JSON.stringify(config);

      script.onload = () => {
        console.log('TradingViewWidget: TradingView XAUUSD chart loaded successfully');
        onLoadingChange(false);
        onErrorChange(false);
      };

      script.onerror = (error) => {
        console.error('TradingViewWidget: TradingView script failed to load', error);
        onLoadingChange(false);
        onErrorChange(true);
      };

      widgetContainer.appendChild(script);
      widgetRef.current.appendChild(widgetContainer);

      // Force layout recalculation after a short delay
      setTimeout(() => {
        if (widgetRef.current) {
          widgetRef.current.style.display = 'none';
          widgetRef.current.offsetHeight; // Force reflow
          widgetRef.current.style.display = 'block';
        }
      }, 100);

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
      className="absolute inset-0 tradingview-widget-container"
      style={{ 
        height: '100%', 
        width: '100%',
        minHeight: '400px',
        background: '#1e293b'
      }}
    />
  );
};

export default TradingViewWidget;
