import { useState } from 'react';
import Navbar from './Navbar';
import ConnectionErrorBanner from './ConnectionErrorBanner';
import MainContent from './MainContent';
import RightPanel from './RightPanel';
import MobileAnalysisSheet from './MobileAnalysisSheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { useMarketAnalysis } from '@/hooks/useMarketAnalysis';

const TradingDashboard = () => {
  const selectedSymbol = 'XAUUSD';
  const selectedTimeframe = '5min';

  const isMobile = useIsMobile();

  const {
    currentPrice,
    setCurrentPrice,
    priceChange,
    setPriceChange,
    tradePlan,
    analysisData,
    isAnalyzing,
    connectionError,
    handleAnalyzeMarket,
    handleRetryConnection
  } = useMarketAnalysis();

  const handleAnalyze = () => {
    handleAnalyzeMarket(selectedSymbol, selectedTimeframe);
  };

  const handleRetry = () => {
    handleRetryConnection(selectedSymbol, selectedTimeframe);
  };

  return (
    <div className="flex h-screen bg-slate-900 text-white overflow-hidden">
      <div className="flex-1 flex flex-col min-w-0">
        {/* Connection Error Banner - Only show when there's an error */}
        {connectionError && (
          <div className="relative z-50">
            <ConnectionErrorBanner onRetry={handleRetry} />
          </div>
        )}
        
        {/* Main content with proper spacing */}
        <div className={`flex-1 flex flex-col ${connectionError ? 'pt-12' : ''}`}>
          <Navbar 
            selectedSymbol={selectedSymbol}
            currentPrice={currentPrice}
            priceChange={priceChange}
          />
          
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            {/* Main Chart Section */}
            <MainContent
              selectedSymbol={selectedSymbol}
              selectedTimeframe={selectedTimeframe}
              currentPrice={currentPrice}
              setCurrentPrice={setCurrentPrice}
              priceChange={priceChange}
              setPriceChange={setPriceChange}
              isAnalyzing={isAnalyzing}
              connectionError={connectionError}
              onAnalyze={handleAnalyze}
            />
            
            {/* Right Panel - Desktop only */}
            {!isMobile && (
              <RightPanel
                selectedSymbol={selectedSymbol}
                selectedTimeframe={selectedTimeframe}
                analysisData={analysisData}
                tradePlan={tradePlan}
              />
            )}
            
            {/* Mobile Bottom Sheet for Analysis */}
            {isMobile && (
              <MobileAnalysisSheet
                selectedSymbol={selectedSymbol}
                selectedTimeframe={selectedTimeframe}
                analysisData={analysisData}
                tradePlan={tradePlan}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradingDashboard;
