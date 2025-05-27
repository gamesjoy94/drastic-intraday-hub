
import { useEffect, useRef, useState } from 'react';

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
      style={{ height: '100%', width: '100%' }}
    />
  );
};

export default TradingViewWidget;
