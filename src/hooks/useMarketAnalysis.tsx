
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useMarketAnalysis = () => {
  const [currentPrice, setCurrentPrice] = useState(0);
  const [priceChange, setPriceChange] = useState(0);
  const [tradePlan, setTradePlan] = useState(null);
  const [analysisData, setAnalysisData] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [connectionError, setConnectionError] = useState(false);
  const [lastAnalysisTime, setLastAnalysisTime] = useState(0);
  const { toast } = useToast();

  // Rate limiting: prevent too frequent API calls
  const RATE_LIMIT_DELAY = 10000; // 10 seconds between calls

  const handleAnalyzeMarket = async (selectedSymbol: string, selectedTimeframe: string) => {
    // Rate limiting check
    const now = Date.now();
    if (now - lastAnalysisTime < RATE_LIMIT_DELAY) {
      const remainingTime = Math.ceil((RATE_LIMIT_DELAY - (now - lastAnalysisTime)) / 1000);
      toast({
        title: "Rate Limited",
        description: `Please wait ${remainingTime} seconds before making another request to avoid API limits.`,
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setConnectionError(false);
    setLastAnalysisTime(now);
    
    console.log(`Running Smart Gold Trading analysis for ${selectedSymbol} on ${selectedTimeframe} timeframe`);
    
    try {
      // Always use XAU/USD format for the API
      const apiSymbol = 'XAU/USD';
      
      const { data, error } = await supabase.functions.invoke('analyze-market', {
        body: { 
          symbol: apiSymbol, 
          timeframe: selectedTimeframe 
        }
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        // Check if it's a rate limit error
        if (data.error.includes('API credits') || data.error.includes('rate limit')) {
          throw new Error(`Rate limit exceeded. The API has reached its quota. Please wait a moment before trying again.`);
        }
        throw new Error(data.error);
      }

      // Update state with real analysis data
      setCurrentPrice(data.currentPrice);
      setPriceChange(data.priceChange);
      setTradePlan(data.tradePlan);
      setAnalysisData(data);
      setConnectionError(false);

      toast({
        title: "Smart Gold Analysis Complete",
        description: `AI-powered gold trading analysis completed with ${data.tradePlan?.confidence || 0}% confidence.`,
      });

    } catch (error) {
      console.error('Smart Gold Trading analysis failed:', error);
      setConnectionError(true);
      
      const errorMessage = error.message || 'Unknown error';
      
      // Show appropriate error message without auto-retry
      if (errorMessage.includes('rate limit') || errorMessage.includes('API credits')) {
        toast({
          title: "API Rate Limit",
          description: "The market data API has reached its limit. Please wait a few minutes before trying again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Connection Failed",
          description: "Unable to connect to analysis service. Please check your connection and use the retry button to try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRetryConnection = (selectedSymbol: string, selectedTimeframe: string) => {
    setLastAnalysisTime(0); // Reset rate limit for manual retry
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
