
import MarketData from './MarketData';
import AnalysisPanel from './AnalysisPanel';
import TradePlan from './TradePlan';
import PriceAlerts from './PriceAlerts';
import DashboardMetrics from './DashboardMetrics';
import { useEffect, useState } from 'react';

interface RightPanelProps {
  selectedSymbol: string;
  selectedTimeframe: string;
  analysisData: any;
  tradePlan: any;
}

const RightPanel = ({ selectedSymbol, selectedTimeframe, analysisData, tradePlan }: RightPanelProps) => {
  const [currentPrice, setCurrentPrice] = useState(2650);

  // Simulate price updates for alerts
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPrice(prev => {
        const change = (Math.random() - 0.5) * 10;
        return Math.max(2500, Math.min(2800, prev + change));
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  return (
    <div className="w-80 lg:w-96 bg-slate-900 border-l border-slate-700 flex flex-col overflow-hidden">
      {/* Dashboard Metrics at the top */}
      <div className="border-b border-slate-700">
        <DashboardMetrics />
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {/* Price Alerts */}
        <div className="p-4 border-b border-slate-700">
          <PriceAlerts currentPrice={currentPrice} />
        </div>
        
        {/* Market Data */}
        <MarketData symbol={selectedSymbol} />
        
        {/* Analysis Panel */}
        <AnalysisPanel
          symbol={selectedSymbol}
          timeframe={selectedTimeframe}
          analysisData={analysisData}
        />
        
        {/* Trade Plan */}
        <TradePlan tradePlan={tradePlan} />
      </div>
    </div>
  );
};

export default RightPanel;
