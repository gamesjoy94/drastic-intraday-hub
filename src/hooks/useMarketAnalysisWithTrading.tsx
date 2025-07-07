
import { useMarketAnalysis } from './useMarketAnalysis';
import { useMT5Trading } from './useMT5Trading';
import { useEffect } from 'react';

export const useMarketAnalysisWithTrading = () => {
  const marketAnalysis = useMarketAnalysis();
  const mt5Trading = useMT5Trading();

  // Auto-process AI signals when new analysis is available
  useEffect(() => {
    if (marketAnalysis.analysisData && marketAnalysis.tradePlan && mt5Trading.isAutoTradingEnabled) {
      const processSignal = async () => {
        try {
          const aiAnalysis = {
            tradePlan: marketAnalysis.tradePlan,
            currentPrice: marketAnalysis.currentPrice
          };
          
          const executed = await mt5Trading.processAISignal(aiAnalysis);
          
          if (executed) {
            console.log('AI signal successfully executed as trade');
          }
        } catch (error) {
          console.error('Error processing AI signal for trading:', error);
        }
      };

      // Small delay to ensure analysis is complete
      setTimeout(processSignal, 1000);
    }
  }, [marketAnalysis.analysisData, marketAnalysis.tradePlan, mt5Trading.isAutoTradingEnabled]);

  return {
    ...marketAnalysis,
    ...mt5Trading,
    // Combined state
    isTradingActive: mt5Trading.isConnected && mt5Trading.isAutoTradingEnabled,
    canExecuteTrades: mt5Trading.isConnected && marketAnalysis.tradePlan && !marketAnalysis.isAnalyzing
  };
};
