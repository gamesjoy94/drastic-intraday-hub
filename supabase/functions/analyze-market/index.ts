
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { TechnicalData } from './types.ts';
import { fetchMarketData } from './dataFetcher.ts';
import { analyzeSmartMomentumScalping } from './smartMomentumAnalyzer.ts';
import { analyzePatterns } from './patternAnalyzer.ts';
import { getAITradePlan } from './aiAnalyzer.ts';
import { generateFallbackTradePlan } from './fallbackGenerator.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { symbol, timeframe } = await req.json();
    console.log(`Analyzing ${symbol} on ${timeframe} timeframe with REAL market data`);

    // Fetch comprehensive REAL market data
    const marketData = await fetchMarketData(symbol, timeframe);
    const { ohlcvData, ema8Data, ema21Data, rsiData, macdData, vwapData, atrData } = marketData;

    // Extract current values and historical data from REAL API responses
    const currentPrice = parseFloat(ohlcvData.values[0].close);
    const previousPrice = parseFloat(ohlcvData.values[1].close);
    const priceChange = ((currentPrice - previousPrice) / previousPrice) * 100;

    console.log(`REAL market data: ${symbol} at $${currentPrice.toFixed(2)} (${priceChange.toFixed(2)}%)`);

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

    // Calculate Smart Momentum Scalping signals from REAL data
    const analysis = analyzeSmartMomentumScalping(technicalData, currentPrice);
    console.log(`Real technical analysis complete: ${analysis.marketBias} bias, ${analysis.confidenceScore}% confidence`);
    
    // Add Pattern Recognition Analysis from REAL data
    const patternData = analyzePatterns(technicalData, currentPrice);
    console.log(`Pattern analysis: ${patternData.pattern} (${patternData.probability}% probability)`);

    // Attempt to get AI analysis first
    let tradePlan = await getAITradePlan(symbol, timeframe, currentPrice, priceChange, technicalData, analysis, patternData);
    
    if (!tradePlan) {
      console.log('AI analysis failed, using enhanced rule-based analysis with REAL data');
      tradePlan = generateFallbackTradePlan(analysis, currentPrice, technicalData.atr[0], patternData);
    } else {
      console.log('AI analysis successful, using AI-generated trade plan');
    }

    const result = {
      currentPrice,
      priceChange,
      analysis,
      patternData,
      tradePlan: {
        direction: tradePlan.direction || 'NO TRADE',
        entry: parseFloat(tradePlan.entry) || currentPrice,
        stopLoss: parseFloat(tradePlan.stopLoss) || currentPrice * 0.98,
        takeProfit: parseFloat(tradePlan.takeProfit) || currentPrice * 1.02,
        riskReward: tradePlan.riskReward || "1:1.5",
        positionSize: tradePlan.positionSize || "0%",
        timing: tradePlan.timing || "Monitor for entry",
        risks: tradePlan.risks || "Standard market risks apply",
        strategy: tradePlan.strategy || `${analysis.summary} Combined with ${patternData.pattern} pattern analysis.`,
        confidence: parseInt(tradePlan.confidence) || analysis.confidenceScore,
        indicators: tradePlan.indicators || analysis.indicators
      },
      technicalData: {
        ema8: technicalData.ema8[0]?.toFixed(2) || 'N/A',
        ema21: technicalData.ema21[0]?.toFixed(2) || 'N/A',
        rsi: technicalData.rsi[0]?.toFixed(1) || 'N/A',
        macd: technicalData.macd[0]?.toFixed(4) || 'N/A',
        macdHistogram: technicalData.macdHistogram[0]?.toFixed(4) || 'N/A',
        vwap: technicalData.vwap[0]?.toFixed(2) || 'N/A',
        atr: technicalData.atr[0]?.toFixed(2) || 'N/A',
        volume: technicalData.volume[0]?.toLocaleString() || 'N/A'
      },
      dataSource: 'REAL_TIME',
      analysisMethod: tradePlan.strategy ? 'AI_ENHANCED' : 'RULE_BASED'
    };

    console.log('REAL market analysis completed successfully. Data source: TwelveData API');

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in REAL market analysis:', error);
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
