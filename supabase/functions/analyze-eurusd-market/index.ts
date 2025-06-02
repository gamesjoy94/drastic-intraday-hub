
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { TechnicalData } from './types.ts';
import { fetchMarketData } from './dataFetcher.ts';
import { analyzeEurUsdTrendReversal } from './eurUsdTrendAnalyzer.ts';
import { analyzePatterns } from './patternAnalyzer.ts';
import { getEurUsdAITradePlan } from './eurUsdAIAnalyzer.ts';
import { getAdvancedEurUsdAIAnalysis, generateEnhancedTradePlan } from './eurUsdAdvancedAI.ts';
import { generateEurUsdFallbackTradePlan } from './eurUsdFallbackGenerator.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { symbol, timeframe, strategy } = await req.json();
    console.log(`Analyzing EUR/USD with ADVANCED AI-Enhanced Trend Reversal Strategy on ${timeframe} timeframe`);

    // Fetch comprehensive market data for EUR/USD
    const marketData = await fetchMarketData(symbol, timeframe);
    const { ohlcvData, ema8Data, ema21Data, rsiData, macdData, vwapData, atrData } = marketData;

    // Extract current values
    const currentPrice = parseFloat(ohlcvData.values[0].close);
    const previousPrice = parseFloat(ohlcvData.values[1].close);
    const priceChange = ((currentPrice - previousPrice) / previousPrice) * 100;

    console.log(`EUR/USD market data: ${symbol} at $${currentPrice.toFixed(5)} (${priceChange.toFixed(3)}%)`);

    const technicalData: TechnicalData = {
      ema8: ema8Data.values?.slice(0, 10).map((v: any) => parseFloat(v.ema)) || [],
      ema21: ema21Data.values?.slice(0, 10).map((v: any) => parseFloat(v.ema)) || [],
      rsi: rsiData.values?.slice(0, 10).map((v: any) => parseFloat(v.rsi)) || [],
      macd: macdData.values?.slice(0, 10).map((v: any) => parseFloat(v.macd)) || [],
      macdSignal: macdData.values?.slice(0, 10).map((v: any) => parseFloat(v.macd_signal)) || [],
      macdHistogram: macdData.values?.slice(0, 10).map((v: any) => parseFloat(v.macd_hist)) || [],
      volume: ohlcvData.values.slice(0, 25).map((v: any) => parseFloat(v.volume)),
      vwap: vwapData.values?.slice(0, 10).map((v: any) => parseFloat(v.vwap)) || [],
      atr: atrData.values?.slice(0, 10).map((v: any) => parseFloat(v.atr)) || [],
      ohlcv: ohlcvData.values.slice(0, 50)
    };

    // Calculate EUR/USD AI-Enhanced Trend Reversal signals
    const analysis = analyzeEurUsdTrendReversal(technicalData, currentPrice);
    console.log(`EUR/USD AI-Enhanced Trend Reversal analysis: ${analysis.marketBias} bias, ${analysis.confidenceScore}% confidence`);
    
    // Pattern Recognition Analysis
    const patternData = analyzePatterns(technicalData, currentPrice);
    console.log(`EUR/USD pattern analysis: ${patternData.pattern} (${patternData.probability}% probability)`);

    // Market context for advanced AI
    const marketContext = {
      sessionTime: new Date().getHours(),
      priceNearRoundNumbers: Math.abs(currentPrice - Math.round(currentPrice * 10000) / 10000) < 0.0001,
      weeklyHigh: Math.max(...ohlcvData.values.slice(0, 35).map((v: any) => parseFloat(v.high))),
      weeklyLow: Math.min(...ohlcvData.values.slice(0, 35).map((v: any) => parseFloat(v.low))),
      averageVolume: technicalData.volume.slice(0, 20).reduce((sum, vol) => sum + vol, 0) / 20
    };

    // Get advanced AI analysis
    console.log('Requesting advanced AI analysis for EUR/USD...');
    const advancedAI = await getAdvancedEurUsdAIAnalysis(
      symbol, 
      timeframe, 
      currentPrice, 
      priceChange, 
      technicalData, 
      analysis, 
      patternData,
      marketContext
    );

    // Attempt to get basic AI analysis as fallback
    let tradePlan = await getEurUsdAITradePlan(symbol, timeframe, currentPrice, priceChange, technicalData, analysis, patternData);
    
    if (!tradePlan) {
      console.log('Basic AI analysis failed, using enhanced rule-based analysis');
      tradePlan = generateEurUsdFallbackTradePlan(analysis, currentPrice, technicalData.atr[0], patternData);
    }

    // Enhance trade plan with advanced AI if available
    if (advancedAI) {
      console.log('Enhancing trade plan with advanced AI analysis');
      tradePlan = generateEnhancedTradePlan(tradePlan, advancedAI, currentPrice, technicalData);
    }

    const result = {
      currentPrice,
      priceChange,
      analysis: {
        ...analysis,
        // Add AI enhancements to analysis
        aiEnhanced: !!advancedAI,
        marketRegime: advancedAI?.marketRegime || 'UNKNOWN',
        volatilityForecast: advancedAI?.volatilityForecast || 'MEDIUM',
        aiConfidence: advancedAI?.aiConfidence || analysis.confidenceScore
      },
      patternData,
      advancedAI: advancedAI || null,
      tradePlan: {
        direction: tradePlan.direction || 'NO TRADE',
        entry: parseFloat(tradePlan.entry) || currentPrice,
        stopLoss: parseFloat(tradePlan.stopLoss) || currentPrice * 0.998,
        takeProfit: parseFloat(tradePlan.takeProfit) || currentPrice * 1.002,
        riskReward: tradePlan.riskReward || "1:1.5",
        positionSize: tradePlan.positionSize || "0%",
        timing: tradePlan.timing || "Monitor for entry",
        risks: tradePlan.risks || "Standard forex market risks apply",
        strategy: tradePlan.strategy || `${analysis.summary} Combined with AI-Enhanced Trend Reversal signals.`,
        confidence: parseInt(tradePlan.confidence) || analysis.confidenceScore,
        indicators: tradePlan.indicators || analysis.indicators,
        aiEnhanced: tradePlan.aiEnhanced || false,
        aiInsights: tradePlan.aiInsights || null,
        predictiveAnalysis: tradePlan.predictiveAnalysis || null,
        advancedMetrics: tradePlan.advancedMetrics || null
      },
      technicalData: {
        ema8: technicalData.ema8[0]?.toFixed(5) || 'N/A',
        ema21: technicalData.ema21[0]?.toFixed(5) || 'N/A',
        rsi: technicalData.rsi[0]?.toFixed(1) || 'N/A',
        macd: technicalData.macd[0]?.toFixed(6) || 'N/A',
        macdHistogram: technicalData.macdHistogram[0]?.toFixed(6) || 'N/A',
        vwap: technicalData.vwap[0]?.toFixed(5) || 'N/A',
        atr: technicalData.atr[0]?.toFixed(5) || 'N/A',
        volume: technicalData.volume[0]?.toLocaleString() || 'N/A'
      },
      dataSource: 'REAL_TIME',
      strategy: 'ADVANCED_AI_ENHANCED_TREND_REVERSAL',
      analysisMethod: advancedAI ? 'ADVANCED_AI_MULTI_MODEL' : tradePlan.strategy ? 'AI_ENHANCED' : 'RULE_BASED'
    };

    console.log('EUR/USD Advanced AI-Enhanced Trend Reversal analysis completed successfully');

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in EUR/USD Advanced AI analysis:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        currentPrice: 0,
        priceChange: 0,
        tradePlan: null,
        analysis: null,
        patternData: null,
        advancedAI: null,
        dataSource: 'ERROR'
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
