
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
    console.log(`🚀 ENHANCED EUR/USD AI Analysis: ${symbol} on ${timeframe} with advanced multi-dimensional strategy`);

    // Fetch comprehensive market data for EUR/USD
    const marketData = await fetchMarketData(symbol, timeframe);
    const { ohlcvData, ema8Data, ema21Data, rsiData, macdData, vwapData, atrData } = marketData;

    // Extract current values
    const currentPrice = parseFloat(ohlcvData.values[0].close);
    const previousPrice = parseFloat(ohlcvData.values[1].close);
    const priceChange = ((currentPrice - previousPrice) / previousPrice) * 100;

    console.log(`📊 ENHANCED EUR/USD data: ${symbol} at $${currentPrice.toFixed(5)} (${priceChange.toFixed(3)}%)`);

    const technicalData: TechnicalData = {
      ema8: ema8Data.values?.slice(0, 20).map((v: any) => parseFloat(v.ema)) || [],
      ema21: ema21Data.values?.slice(0, 20).map((v: any) => parseFloat(v.ema)) || [],
      rsi: rsiData.values?.slice(0, 20).map((v: any) => parseFloat(v.rsi)) || [],
      macd: macdData.values?.slice(0, 20).map((v: any) => parseFloat(v.macd)) || [],
      macdSignal: macdData.values?.slice(0, 20).map((v: any) => parseFloat(v.macd_signal)) || [],
      macdHistogram: macdData.values?.slice(0, 20).map((v: any) => parseFloat(v.macd_hist)) || [],
      volume: ohlcvData.values.slice(0, 50).map((v: any) => parseFloat(v.volume)),
      vwap: vwapData.values?.slice(0, 20).map((v: any) => parseFloat(v.vwap)) || [],
      atr: atrData.values?.slice(0, 20).map((v: any) => parseFloat(v.atr)) || [],
      ohlcv: ohlcvData.values.slice(0, 100) // Extended for better analysis
    };

    // Calculate ENHANCED EUR/USD AI Trend Reversal signals
    const analysis = analyzeEurUsdTrendReversal(technicalData, currentPrice);
    console.log(`🎯 ENHANCED EUR/USD analysis: ${analysis.marketBias} bias, ${analysis.confidenceScore.toFixed(1)}% confidence`);
    console.log(`📈 Session: ${analysis.sessionAnalysis?.currentSession}, Currency Strength: EUR ${analysis.currencyStrengthAnalysis?.eurStrength.toFixed(1)} vs USD ${analysis.currencyStrengthAnalysis?.usdStrength.toFixed(1)}`);
    
    // Enhanced Pattern Recognition Analysis
    const patternData = analyzePatterns(technicalData, currentPrice);
    console.log(`🔍 ENHANCED pattern analysis: ${patternData.pattern} (${patternData.probability}% probability)`);

    // Enhanced market context for advanced AI
    const marketContext = {
      sessionTime: analysis.sessionAnalysis?.utcHour || new Date().getHours(),
      currentSession: analysis.sessionAnalysis?.currentSession || 'UNKNOWN',
      isHighVolatilitySession: analysis.sessionAnalysis?.isHighVolatilitySession || false,
      priceNearRoundNumbers: Math.abs(currentPrice - Math.round(currentPrice * 10000) / 10000) < 0.0001,
      weeklyHigh: Math.max(...ohlcvData.values.slice(0, 35).map((v: any) => parseFloat(v.high))),
      weeklyLow: Math.min(...ohlcvData.values.slice(0, 35).map((v: any) => parseFloat(v.low))),
      averageVolume: technicalData.volume.slice(0, 20).reduce((sum, vol) => sum + vol, 0) / 20,
      currencyStrength: analysis.currencyStrengthAnalysis,
      multitimeframeConfluence: analysis.multitimeframeSignal,
      advancedSignals: analysis.advancedSignals
    };

    // Get ENHANCED advanced AI analysis with new context
    console.log('🤖 Requesting ENHANCED advanced AI analysis for EUR/USD...');
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
      console.log('🔄 Basic AI analysis failed, using ENHANCED rule-based analysis');
      tradePlan = generateEurUsdFallbackTradePlan(analysis, currentPrice, technicalData.atr[0], patternData);
    }

    // ENHANCE trade plan with advanced AI if available
    if (advancedAI) {
      console.log('⚡ Enhancing trade plan with ADVANCED AI analysis');
      tradePlan = generateEnhancedTradePlan(tradePlan, advancedAI, currentPrice, technicalData);
    }

    const result = {
      currentPrice,
      priceChange,
      analysis: {
        ...analysis,
        // Add ENHANCED AI enhancements to analysis
        aiEnhanced: !!advancedAI,
        marketRegime: advancedAI?.marketRegime || 'UNKNOWN',
        volatilityForecast: advancedAI?.volatilityForecast || 'MEDIUM',
        aiConfidence: advancedAI?.aiConfidence || analysis.confidenceScore,
        enhancedAnalysisActive: true,
        analysisVersion: 'ENHANCED_v2.0'
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
        strategy: tradePlan.strategy || `${analysis.summary} ENHANCED with multi-dimensional AI analysis.`,
        confidence: parseInt(tradePlan.confidence) || analysis.confidenceScore,
        indicators: tradePlan.indicators || analysis.indicators,
        aiEnhanced: tradePlan.aiEnhanced || false,
        aiInsights: tradePlan.aiInsights || null,
        predictiveAnalysis: tradePlan.predictiveAnalysis || null,
        advancedMetrics: tradePlan.advancedMetrics || null,
        enhancedFeatures: {
          sessionAnalysis: analysis.sessionAnalysis,
          currencyStrength: analysis.currencyStrengthAnalysis,
          multitimeframeSignal: analysis.multitimeframeSignal,
          advancedTechnicals: analysis.advancedSignals ? 'ACTIVE' : 'INACTIVE'
        }
      },
      technicalData: {
        ema8: technicalData.ema8[0]?.toFixed(5) || 'N/A',
        ema21: technicalData.ema21[0]?.toFixed(5) || 'N/A',
        rsi: technicalData.rsi[0]?.toFixed(1) || 'N/A',
        macd: technicalData.macd[0]?.toFixed(6) || 'N/A',
        macdHistogram: technicalData.macdHistogram[0]?.toFixed(6) || 'N/A',
        vwap: technicalData.vwap[0]?.toFixed(5) || 'N/A',
        atr: technicalData.atr[0]?.toFixed(5) || 'N/A',
        volume: technicalData.volume[0]?.toLocaleString() || 'N/A',
        // Enhanced technical data
        stochastic: analysis.indicators.stochastic || 'N/A',
        bollinger: analysis.indicators.bollinger || 'N/A',
        ichimoku: analysis.indicators.ichimoku || 'N/A',
        fibonacci: analysis.indicators.fibonacci || 'N/A'
      },
      dataSource: 'REAL_TIME_ENHANCED',
      strategy: 'ENHANCED_AI_MULTI_DIMENSIONAL_TREND_REVERSAL',
      analysisMethod: advancedAI ? 'ENHANCED_AI_MULTI_MODEL_v2.0' : tradePlan.strategy ? 'ENHANCED_AI_v2.0' : 'ENHANCED_RULE_BASED_v2.0'
    };

    console.log('🎉 ENHANCED EUR/USD Advanced AI Analysis completed successfully with multi-dimensional improvements');

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Error in ENHANCED EUR/USD Advanced AI analysis:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        currentPrice: 0,
        priceChange: 0,
        tradePlan: null,
        analysis: null,
        patternData: null,
        advancedAI: null,
        dataSource: 'ERROR_ENHANCED'
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
