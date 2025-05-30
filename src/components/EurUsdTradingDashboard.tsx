
import { useState, useEffect } from 'react';
import Navbar from './Navbar';
import ConnectionErrorBanner from './ConnectionErrorBanner';
import MainContent from './MainContent';
import EurUsdRightPanel from './EurUsdRightPanel';
import EurUsdMobileAnalysisSheet from './EurUsdMobileAnalysisSheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { useEurUsdMarketAnalysis } from '@/hooks/useEurUsdMarketAnalysis';

const EurUsdTradingDashboard = () => {
  const selectedSymbol = 'EURUSD';
  const [selectedTimeframe, setSelectedTimeframe] = useState('15min'); // Default to 15min for this strategy

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
  } = useEurUsdMarketAnalysis();

  const handleAnalyze = () => {
    console.log(`EurUsdTradingDashboard: Initiating AI-Enhanced Trend Reversal analysis for ${selectedSymbol} on ${selectedTimeframe} timeframe`);
    handleAnalyzeMarket(selectedSymbol, selectedTimeframe);
  };

  const handleRetry = () => {
    console.log(`EurUsdTradingDashboard: Retrying analysis for ${selectedSymbol} on ${selectedTimeframe} timeframe`);
    handleRetryConnection(selectedSymbol, selectedTimeframe);
  };

  const handleTimeframeChange = (newTimeframe: string) => {
    console.log(`EurUsdTradingDashboard: Changing timeframe from ${selectedTimeframe} to ${newTimeframe}`);
    setSelectedTimeframe(newTimeframe);
    
    if (tradePlan || analysisData) {
      console.log(`EurUsdTradingDashboard: Auto-analyzing with new timeframe: ${newTimeframe}`);
      setTimeout(() => {
        handleAnalyzeMarket(selectedSymbol, newTimeframe);
      }, 100);
    }
  };

  return (
    <div className="flex h-screen bg-slate-900 text-white overflow-hidden">
      <div className="flex-1 flex flex-col min-w-0 h-full">
        {connectionError && (
          <div className="relative z-50">
            <ConnectionErrorBanner onRetry={handleRetry} />
          </div>
        )}
        
        <div className={`flex-1 flex flex-col min-h-0 ${connectionError ? 'pt-12' : ''}`}>
          <Navbar 
            selectedSymbol={selectedSymbol}
            currentPrice={currentPrice}
            priceChange={priceChange}
            selectedTimeframe={selectedTimeframe}
            onTimeframeChange={handleTimeframeChange}
          />
          
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
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
            
            {!isMobile && (
              <EurUsdRightPanel
                selectedSymbol={selectedSymbol}
                selectedTimeframe={selectedTimeframe}
                analysisData={analysisData}
                tradePlan={tradePlan}
                currentPrice={currentPrice}
              />
            )}
            
            {isMobile && (
              <EurUsdMobileAnalysisSheet
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

export default EurUsdTradingDashboard;
