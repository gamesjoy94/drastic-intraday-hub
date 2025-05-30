
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { TechnicalData } from '../analyze-market/types.ts';
import { fetchMarketData } from '../analyze-market/dataFetcher.ts';
import { analyzeEurUsdTrendReversal } from './eurUsdTrendAnalyzer.ts';
import { analyzePatterns } from '../analyze-market/patternAnalyzer.ts';
import { getEurUsdAITradePlan } from './eurUsdAIAnalyzer.ts';
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
    console.log(`Analyzing EUR/USD with AI-Enhanced Trend Reversal Strategy on ${timeframe} timeframe`);

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

    // Attempt to get AI analysis
    let tradePlan = await getEurUsdAITradePlan(symbol, timeframe, currentPrice, priceChange, technicalData, analysis, patternData);
    
    if (!tradePlan) {
      console.log('EUR/USD AI analysis failed, using enhanced rule-based analysis');
      tradePlan = generateEurUsdFallbackTradePlan(analysis, currentPrice, technicalData.atr[0], patternData);
    } else {
      console.log('EUR/USD AI analysis successful');
    }

    const result = {
      currentPrice,
      priceChange,
      analysis,
      patternData,
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
        indicators: tradePlan.indicators || analysis.indicators
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
      strategy: 'AI_ENHANCED_TREND_REVERSAL',
      analysisMethod: tradePlan.strategy ? 'AI_ENHANCED' : 'RULE_BASED'
    };

    console.log('EUR/USD AI-Enhanced Trend Reversal analysis completed successfully');

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in EUR/USD AI-Enhanced Trend Reversal analysis:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        currentPrice: 0,
        priceChange: 0,
        tradePlan: null,
        analysis: null,
        patternData: null,
        dataSource: 'ERROR'
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
