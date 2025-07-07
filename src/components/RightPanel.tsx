
import React from 'react';
import AnalysisPanel from './AnalysisPanel';
import TradePlan from './TradePlan';
import MT5TradingPanel from './MT5TradingPanel';

interface RightPanelProps {
  selectedSymbol: string;
  selectedTimeframe: string;
  analysisData: any;
  tradePlan: any;
  currentPrice: number;
}

const RightPanel = ({ 
  selectedSymbol, 
  selectedTimeframe, 
  analysisData, 
  tradePlan, 
  currentPrice 
}: RightPanelProps) => {
  return (
    <div className="w-96 bg-slate-800 border-l border-slate-700 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* MT5 Trading Panel - Always visible at the top */}
        <div className="mb-4">
          <MT5TradingPanel />
        </div>
        
        {/* Analysis Panel */}
        <AnalysisPanel 
          analysisData={analysisData}
          symbol={selectedSymbol}
          timeframe={selectedTimeframe}
        />
        
        {/* Trade Plan */}
        <TradePlan 
          tradePlan={tradePlan}
          selectedTimeframe={selectedTimeframe}
        />
      </div>
    </div>
  );
};

export default RightPanel;
