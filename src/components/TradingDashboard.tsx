
import { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import ConnectionErrorBanner from './ConnectionErrorBanner';
import MobileSidebar from './MobileSidebar';
import MainContent from './MainContent';
import RightPanel from './RightPanel';
import MobileAnalysisSheet from './MobileAnalysisSheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { useMarketAnalysis } from '@/hooks/useMarketAnalysis';

const TradingDashboard = () => {
  const [selectedSymbol, setSelectedSymbol] = useState('AAPL');
  const [selectedTimeframe, setSelectedTimeframe] = useState('5min');
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
      {/* Connection Error Banner */}
      {connectionError && <ConnectionErrorBanner onRetry={handleRetry} />}

      {/* Desktop Sidebar */}
      {!isMobile && (
        <Sidebar 
          selectedSymbol={selectedSymbol}
          setSelectedSymbol={setSelectedSymbol}
          selectedTimeframe={selectedTimeframe}
          setSelectedTimeframe={setSelectedTimeframe}
        />
      )}
      
      {/* Mobile Sidebar */}
      {isMobile && (
        <MobileSidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          selectedSymbol={selectedSymbol}
          setSelectedSymbol={setSelectedSymbol}
          selectedTimeframe={selectedTimeframe}
          setSelectedTimeframe={setSelectedTimeframe}
        />
      )}
      
      <div className={`flex-1 flex flex-col min-w-0 ${connectionError ? 'mt-10' : ''}`}>
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
  );
};

export default TradingDashboard;
