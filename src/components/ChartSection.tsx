
import { useEffect, useState } from 'react';
import LivePriceBanner from './LivePriceBanner';
import TradingViewWidget from './TradingViewWidget';
import ChartLoadingState from './ChartLoadingState';
import { useLivePrice } from '@/hooks/useLivePrice';

interface ChartSectionProps {
  symbol: string;
  timeframe: string;
  onPriceUpdate: (price: number, change: number) => void;
}

const ChartSection = ({ symbol, timeframe, onPriceUpdate }: ChartSectionProps) => {
  const [chartError, setChartError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [widgetKey, setWidgetKey] = useState(0);

  const { livePriceData } = useLivePrice({ onPriceUpdate });

  useEffect(() => {
    console.log('ChartSection: Loading XAUUSD chart');
    setIsLoading(true);
    setChartError(false);
    
    // Force re-render of widget container
    setWidgetKey(prev => prev + 1);
    
    const loadTimeout = setTimeout(() => {
      setIsLoading(false);
    }, 8000);

    return () => {
      clearTimeout(loadTimeout);
    };
  }, [symbol, timeframe]);

  const handleRetryChart = () => {
    console.log('ChartSection: Retrying XAUUSD chart load');
    setChartError(false);
    setIsLoading(true);
    setWidgetKey(prev => prev + 1);
  };

  return (
    <div className="flex-1 bg-slate-800 m-2 lg:m-4 rounded-lg overflow-hidden">
      <LivePriceBanner livePriceData={livePriceData} />

      <div className="h-full relative">
        <TradingViewWidget
          timeframe={timeframe}
          widgetKey={widgetKey}
          onLoadingChange={setIsLoading}
          onErrorChange={setChartError}
        />
        
        <ChartLoadingState
          isLoading={isLoading}
          chartError={chartError}
          onRetryChart={handleRetryChart}
        />
      </div>
    </div>
  );
};

export default ChartSection;
