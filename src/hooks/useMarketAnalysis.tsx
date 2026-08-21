
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import APIErrorHandler from '@/utils/apiErrorHandler';
import DataValidator from '@/utils/dataValidation';

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
  const RATE_LIMIT_DELAY = 15000; // 15 seconds between calls

  const handleAnalyzeMarket = async (
    selectedSymbol: string,
    selectedTimeframe: string,
    options: { silent?: boolean } = {},
  ) => {
    const silent = !!options.silent;
    // Rate limiting check
    const now = Date.now();
    if (now - lastAnalysisTime < RATE_LIMIT_DELAY) {
      const remainingTime = Math.ceil((RATE_LIMIT_DELAY - (now - lastAnalysisTime)) / 1000);
      if (silent) return;
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
    
    console.log(`useMarketAnalysis: Starting Gold Trading analysis for ${selectedSymbol} on ${selectedTimeframe} timeframe`);
    
    try {
      // Always use XAU/USD format for the API
      const apiSymbol = DataValidator.validateSymbol(selectedSymbol);
      const validTimeframe = DataValidator.validateTimeframe(selectedTimeframe);
      
      console.log(`useMarketAnalysis: Sending analysis request with timeframe: ${validTimeframe}`);
      
      const { data, error } = await supabase.functions.invoke('analyze-market', {
        body: { 
          symbol: apiSymbol, 
          timeframe: validTimeframe 
        }
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        // Check if it's a rate limit error
        if (data.error.includes('API credits') || data.error.includes('rate limit')) {
          throw new Error(`API rate limit exceeded. Please wait before trying again.`);
        }
        throw new Error(data.error);
      }

      // Validate and update state with real analysis data
      const validatedData = DataValidator.validateMarketData(data);
      
      if (validatedData) {
        setCurrentPrice(validatedData.currentPrice);
        setPriceChange(validatedData.priceChange);
        setTradePlan(validatedData.tradePlan);
        setAnalysisData(validatedData.analysisData || data);
        setConnectionError(false);

        console.log(`useMarketAnalysis: Analysis completed for ${validTimeframe} timeframe`);

        if (!silent) toast({
          title: "Analysis Complete",
          description: `Gold trading analysis completed for ${validTimeframe} timeframe.`,
        });
      } else {
        throw new Error('Invalid data received from market analysis API');
      }

    } catch (error) {
      console.error('useMarketAnalysis: Gold Trading analysis failed:', error);
      setConnectionError(true);
      
      const apiError = APIErrorHandler.handleMarketDataError(error);
      
      // Show appropriate error message based on error type
      if (silent) {
        console.warn('Silent analysis error:', apiError.message);
      } else if (apiError.code === 'RATE_LIMIT') {
        toast({
          title: "API Limit Reached",
          description: apiError.message,
          variant: "destructive",
        });
      } else if (apiError.code === 'NETWORK_ERROR') {
        toast({
          title: "Connection Error",
          description: apiError.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Analysis Failed",
          description: `Unable to complete analysis for ${selectedTimeframe} timeframe. Click the button to retry.`,
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
