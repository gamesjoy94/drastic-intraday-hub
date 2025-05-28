
import { useState } from 'react';
import Navbar from './Navbar';
import ConnectionErrorBanner from './ConnectionErrorBanner';
import MainContent from './MainContent';
import RightPanel from './RightPanel';
import MobileAnalysisSheet from './MobileAnalysisSheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { useMarketAnalysis } from '@/hooks/useMarketAnalysis';

const TradingDashboard = () => {
  // Fixed to XAUUSD but now support multiple timeframes
  const selectedSymbol = 'XAUUSD';
  const [selectedTimeframe, setSelectedTimeframe] = useState('5min');

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
    console.log(`TradingDashboard: Initiating analysis for ${selectedSymbol} on ${selectedTimeframe} timeframe`);
    handleAnalyzeMarket(selectedSymbol, selectedTimeframe);
  };

  const handleRetry = () => {
    console.log(`TradingDashboard: Retrying analysis for ${selectedSymbol} on ${selectedTimeframe} timeframe`);
    handleRetryConnection(selectedSymbol, selectedTimeframe);
  };

  const handleTimeframeChange = (newTimeframe: string) => {
    console.log(`TradingDashboard: Changing timeframe from ${selectedTimeframe} to ${newTimeframe}`);
    setSelectedTimeframe(newTimeframe);
    // Note: This will trigger the TradingView widget to reload with the new timeframe
    // If you want to automatically re-analyze when timeframe changes, uncomment the line below:
    // handleAnalyzeMarket(selectedSymbol, newTimeframe);
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
            selectedTimeframe={selectedTimeframe}
            onTimeframeChange={handleTimeframeChange}
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
                currentPrice={currentPrice}
              />
            )}
            
            {/* Mobile Bottom Sheet for Analysis */}
            {isMobile && (
              <MobileAnalysisSheet
                selectedSymbol={selectedSymbol}
                selectedTimeframe={selectedTimeframe}
                analysisData={analysisData}
                tradePlan={tradePlan}
                currentPrice={currentPrice}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradingDashboard;
