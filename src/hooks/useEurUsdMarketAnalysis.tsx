
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useEurUsdMarketAnalysis = () => {
  const [currentPrice, setCurrentPrice] = useState(0);
  const [priceChange, setPriceChange] = useState(0);
  const [tradePlan, setTradePlan] = useState(null);
  const [analysisData, setAnalysisData] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [connectionError, setConnectionError] = useState(false);
  const [lastAnalysisTime, setLastAnalysisTime] = useState(0);
  const { toast } = useToast();

  const RATE_LIMIT_DELAY = 15000;

  const handleAnalyzeMarket = async (selectedSymbol: string, selectedTimeframe: string) => {
    const now = Date.now();
    if (now - lastAnalysisTime < RATE_LIMIT_DELAY) {
      const remainingTime = Math.ceil((RATE_LIMIT_DELAY - (now - lastAnalysisTime)) / 1000);
      toast({
        title: "Rate Limited",
        description: `Please wait ${remainingTime} seconds before making another request.`,
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setConnectionError(false);
    setLastAnalysisTime(now);
    
    console.log(`useEurUsdMarketAnalysis: Starting EUR/USD AI-Enhanced Trend Reversal analysis for ${selectedSymbol} on ${selectedTimeframe} timeframe`);
    
    try {
      const apiSymbol = 'EUR/USD';
      
      console.log(`useEurUsdMarketAnalysis: Sending analysis request with timeframe: ${selectedTimeframe}`);
      
      const { data, error } = await supabase.functions.invoke('analyze-eurusd-market', {
        body: { 
          symbol: apiSymbol, 
          timeframe: selectedTimeframe,
          strategy: 'AI_ENHANCED_TREND_REVERSAL'
        }
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        if (data.error.includes('API credits') || data.error.includes('rate limit')) {
          throw new Error(`API rate limit exceeded. Please wait before trying again.`);
        }
        throw new Error(data.error);
      }

      setCurrentPrice(data.currentPrice);
      setPriceChange(data.priceChange);
      setTradePlan(data.tradePlan);
      setAnalysisData(data);
      setConnectionError(false);

      console.log(`useEurUsdMarketAnalysis: AI-Enhanced Trend Reversal analysis completed for ${selectedTimeframe} timeframe`);

      toast({
        title: "EUR/USD Analysis Complete",
        description: `AI-Enhanced Trend Reversal analysis completed for ${selectedTimeframe} timeframe.`,
      });

    } catch (error) {
      console.error('useEurUsdMarketAnalysis: EUR/USD analysis failed:', error);
      setConnectionError(true);
      
      const errorMessage = error.message || 'Unknown error';
      
      if (errorMessage.includes('rate limit') || errorMessage.includes('API credits')) {
        toast({
          title: "API Limit Reached",
          description: "The market data API has reached its limit. Please try again later.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "EUR/USD Analysis Failed",
          description: `Unable to complete analysis for ${selectedTimeframe} timeframe. Click the button to retry.`,
          variant: "destructive",
        });
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRetryConnection = (selectedSymbol: string, selectedTimeframe: string) => {
    setLastAnalysisTime(0);
    handleAnalyzeMarket(selectedSymbol, selectedTimeframe);
  };

  return {
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
  };
};
