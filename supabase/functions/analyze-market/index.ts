
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const TWELVE_DATA_KEY = Deno.env.get('TWELVE_DATA_KEY');
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

interface TechnicalData {
  ema8: number[];
  ema21: number[];
  rsi: number[];
  macd: number[];
  macdSignal: number[];
  macdHistogram: number[];
  volume: number[];
  vwap: number[];
  atr: number[];
  ohlcv: any[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { symbol, timeframe } = await req.json();
    console.log(`Analyzing ${symbol} on ${timeframe} timeframe with Smart Momentum Scalping strategy`);

    // Fetch comprehensive market data
    const [ohlcvResponse, ema8Response, ema21Response, rsiResponse, macdResponse, vwapResponse, atrResponse] = await Promise.all([
      fetch(`https://api.twelvedata.com/time_series?symbol=${symbol}&interval=${timeframe}&apikey=${TWELVE_DATA_KEY}&outputsize=100`),
      fetch(`https://api.twelvedata.com/ema?symbol=${symbol}&interval=${timeframe}&time_period=8&apikey=${TWELVE_DATA_KEY}&outputsize=50`),
      fetch(`https://api.twelvedata.com/ema?symbol=${symbol}&interval=${timeframe}&time_period=21&apikey=${TWELVE_DATA_KEY}&outputsize=50`),
      fetch(`https://api.twelvedata.com/rsi?symbol=${symbol}&interval=${timeframe}&time_period=14&apikey=${TWELVE_DATA_KEY}&outputsize=50`),
      fetch(`https://api.twelvedata.com/macd?symbol=${symbol}&interval=${timeframe}&apikey=${TWELVE_DATA_KEY}&outputsize=50`),
      fetch(`https://api.twelvedata.com/vwap?symbol=${symbol}&interval=${timeframe}&apikey=${TWELVE_DATA_KEY}&outputsize=50`),
      fetch(`https://api.twelvedata.com/atr?symbol=${symbol}&interval=${timeframe}&time_period=14&apikey=${TWELVE_DATA_KEY}&outputsize=50`)
    ]);

    const [ohlcvData, ema8Data, ema21Data, rsiData, macdData, vwapData, atrData] = await Promise.all([
      ohlcvResponse.json(),
      ema8Response.json(),
      ema21Response.json(),
      rsiResponse.json(),
      macdResponse.json(),
      vwapResponse.json(),
      atrResponse.json()
    ]);

    // Validate data
    if (ohlcvData.status === 'error') {
      throw new Error(`Market data error: ${ohlcvData.message}`);
    }

    // Extract current values and historical data
    const currentPrice = parseFloat(ohlcvData.values[0].close);
    const previousPrice = parseFloat(ohlcvData.values[1].close);
    const priceChange = ((currentPrice - previousPrice) / previousPrice) * 100;

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
      ohlcv: ohlcvData.values.slice(0, 10)
    };

    // Calculate Smart Momentum Scalping signals
    const analysis = analyzeSmartMomentumScalping(technicalData, currentPrice);

    // Create detailed AI prompt for trade plan generation
    const strategyPrompt = `
SMART MOMENTUM SCALPING STRATEGY ANALYSIS FOR ${symbol}

Current Market State:
- Price: $${currentPrice.toFixed(2)}
- Price Change: ${priceChange.toFixed(2)}%
- Timeframe: ${timeframe}

Technical Indicators:
- EMA 8: $${technicalData.ema8[0]?.toFixed(2) || 'N/A'}
- EMA 21: $${technicalData.ema21[0]?.toFixed(2) || 'N/A'}
- EMA Crossover Signal: ${analysis.emaCrossover}
- RSI: ${technicalData.rsi[0]?.toFixed(1) || 'N/A'} (Previous: ${technicalData.rsi[1]?.toFixed(1) || 'N/A'})
- RSI Direction: ${analysis.rsiDirection}
- MACD: ${technicalData.macd[0]?.toFixed(4) || 'N/A'}
- MACD Histogram: ${technicalData.macdHistogram[0]?.toFixed(4) || 'N/A'} (Previous: ${technicalData.macdHistogram[1]?.toFixed(4) || 'N/A'})
- MACD Signal: ${analysis.macdSignal}
- Volume: ${technicalData.volume[0]?.toLocaleString() || 'N/A'}
- Volume Spike: ${analysis.volumeSpike}
- VWAP: $${technicalData.vwap[0]?.toFixed(2) || 'N/A'}
- Price vs VWAP: ${analysis.vwapPosition}
- ATR: $${technicalData.atr[0]?.toFixed(2) || 'N/A'}

Strategy Conditions Analysis:
LONG SETUP:
✓ EMA 8 > EMA 21: ${analysis.ema8AboveEma21 ? 'YES' : 'NO'}
✓ RSI > 50 and Rising: ${analysis.rsiLongCondition ? 'YES' : 'NO'}
✓ MACD Histogram Turning Green: ${analysis.macdBullish ? 'YES' : 'NO'}
✓ Volume Above Average: ${analysis.volumeSpike ? 'YES' : 'NO'}
✓ Price Above VWAP: ${analysis.priceAboveVwap ? 'YES' : 'NO'}

SHORT SETUP:
✓ EMA 8 < EMA 21: ${analysis.ema8BelowEma21 ? 'YES' : 'NO'}
✓ RSI < 50 and Falling: ${analysis.rsiShortCondition ? 'YES' : 'NO'}
✓ MACD Histogram Turning Red: ${analysis.macdBearish ? 'YES' : 'NO'}
✓ Volume Above Average: ${analysis.volumeSpike ? 'YES' : 'NO'}
✓ Price Below VWAP: ${analysis.priceBelowVwap ? 'YES' : 'NO'}

Overall Signal Strength:
- Long Signal Score: ${analysis.longScore}/5
- Short Signal Score: ${analysis.shortScore}/5
- Market Bias: ${analysis.marketBias}

Recent Price Action:
${technicalData.ohlcv.slice(0, 5).map((v: any, i: number) => 
  `${i + 1}. O: $${v.open}, H: $${v.high}, L: $${v.low}, C: $${v.close}, Vol: ${parseInt(v.volume).toLocaleString()}`
).join('\n')}

Based on this Smart Momentum Scalping analysis, provide a professional intraday trade recommendation with:
1. Trade Direction (LONG/SHORT/NO TRADE)
2. Entry Price (current market or specific level)
3. Stop Loss (below last swing low for long, above swing high for short)
4. Take Profit (1.5x ATR target: $${(technicalData.atr[0] * 1.5).toFixed(2)})
5. Risk-Reward Ratio
6. Position Size Recommendation (% of capital)
7. Market Timing Assessment
8. Key Risk Factors
9. Strategy Rationale (max 150 words)
10. Confidence Level (0-100%)

Respond in JSON format with these exact keys: direction, entry, stopLoss, takeProfit, riskReward, positionSize, timing, risks, strategy, confidence, indicators
`;

    // Get AI analysis from OpenAI
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are a professional intraday trading analyst specializing in Smart Momentum Scalping strategies. Provide precise, actionable trade recommendations based on technical analysis. Always respond with valid JSON format.'
          },
          {
            role: 'user',
            content: strategyPrompt
          }
        ],
        temperature: 0.2,
        max_tokens: 1200,
      }),
    });

    if (!openAIResponse.ok) {
      throw new Error(`OpenAI API error: ${openAIResponse.status}`);
    }

    const aiResponse = await openAIResponse.json();
    let tradePlan;

    try {
      tradePlan = JSON.parse(aiResponse.choices[0].message.content);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      // Fallback trade plan based on analysis
      tradePlan = generateFallbackTradePlan(analysis, currentPrice, technicalData.atr[0]);
    }

    const result = {
      currentPrice,
      priceChange,
      analysis,
      tradePlan: {
        direction: tradePlan.direction || 'NO TRADE',
        entry: parseFloat(tradePlan.entry) || currentPrice,
        stopLoss: parseFloat(tradePlan.stopLoss) || currentPrice * 0.98,
        takeProfit: parseFloat(tradePlan.takeProfit) || currentPrice * 1.02,
        riskReward: tradePlan.riskReward || "1:1.5",
        positionSize: tradePlan.positionSize || "1-2%",
        timing: tradePlan.timing || "Monitor for entry",
        risks: tradePlan.risks || "Standard market risks apply",
        strategy: tradePlan.strategy || analysis.summary,
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
      }
    };

    console.log('Smart Momentum Scalping analysis completed successfully:', result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in Smart Momentum Scalping analysis:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        currentPrice: 0,
        priceChange: 0,
        tradePlan: null,
        analysis: null
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function analyzeSmartMomentumScalping(data: TechnicalData, currentPrice: number) {
  const ema8 = data.ema8[0] || currentPrice;
  const ema21 = data.ema21[0] || currentPrice;
  const ema8Prev = data.ema8[1] || currentPrice;
  const ema21Prev = data.ema21[1] || currentPrice;
  
  const rsi = data.rsi[0] || 50;
  const rsiPrev = data.rsi[1] || 50;
  
  const macdHist = data.macdHistogram[0] || 0;
  const macdHistPrev = data.macdHistogram[1] || 0;
  
  const volume = data.volume[0] || 0;
  const avgVolume = data.volume.slice(0, 20).reduce((a, b) => a + b, 0) / Math.min(20, data.volume.length);
  
  const vwap = data.vwap[0] || currentPrice;
  
  // Strategy conditions
  const ema8AboveEma21 = ema8 > ema21;
  const ema8BelowEma21 = ema8 < ema21;
  const emaCrossover = (ema8 > ema21 && ema8Prev <= ema21Prev) ? 'BULLISH' : 
                      (ema8 < ema21 && ema8Prev >= ema21Prev) ? 'BEARISH' : 'NONE';
  
  const rsiLongCondition = rsi > 50 && rsi > rsiPrev;
  const rsiShortCondition = rsi < 50 && rsi < rsiPrev;
  const rsiDirection = rsi > rsiPrev ? 'RISING' : rsi < rsiPrev ? 'FALLING' : 'NEUTRAL';
  
  const macdBullish = macdHist > 0 && macdHist > macdHistPrev;
  const macdBearish = macdHist < 0 && macdHist < macdHistPrev;
  const macdSignal = macdBullish ? 'BULLISH' : macdBearish ? 'BEARISH' : 'NEUTRAL';
  
  const volumeSpike = volume > avgVolume * 1.2;
  
  const priceAboveVwap = currentPrice > vwap;
  const priceBelowVwap = currentPrice < vwap;
  const vwapPosition = priceAboveVwap ? 'ABOVE' : 'BELOW';
  
  // Score calculations
  let longScore = 0;
  let shortScore = 0;
  
  if (ema8AboveEma21) longScore++;
  if (rsiLongCondition) longScore++;
  if (macdBullish) longScore++;
  if (volumeSpike) longScore++;
  if (priceAboveVwap) longScore++;
  
  if (ema8BelowEma21) shortScore++;
  if (rsiShortCondition) shortScore++;
  if (macdBearish) shortScore++;
  if (volumeSpike) shortScore++;
  if (priceBelowVwap) shortScore++;
  
  const marketBias = longScore > shortScore ? 'BULLISH' : shortScore > longScore ? 'BEARISH' : 'NEUTRAL';
  const confidenceScore = Math.max(longScore, shortScore) * 20; // Convert to percentage
  
  const summary = `Smart Momentum Scalping Analysis: ${marketBias} bias with ${confidenceScore}% confidence. 
                   Long conditions: ${longScore}/5, Short conditions: ${shortScore}/5. 
                   Key signals: ${emaCrossover} EMA crossover, ${rsiDirection} RSI, ${macdSignal} MACD, 
                   ${volumeSpike ? 'High' : 'Normal'} volume, Price ${vwapPosition} VWAP.`;
  
  return {
    ema8AboveEma21,
    ema8BelowEma21,
    emaCrossover,
    rsiLongCondition,
    rsiShortCondition,
    rsiDirection,
    macdBullish,
    macdBearish,
    macdSignal,
    volumeSpike,
    priceAboveVwap,
    priceBelowVwap,
    vwapPosition,
    longScore,
    shortScore,
    marketBias,
    confidenceScore,
    summary,
    indicators: {
      ema: `${ema8.toFixed(2)} / ${ema21.toFixed(2)}`,
      rsi: `${rsi.toFixed(1)} (${rsiDirection})`,
      macd: `${macdSignal}`,
      volume: volumeSpike ? 'HIGH' : 'NORMAL',
      vwap: vwapPosition
    }
  };
}

function generateFallbackTradePlan(analysis: any, currentPrice: number, atr: number) {
  const direction = analysis.longScore >= 4 ? 'LONG' : analysis.shortScore >= 4 ? 'SHORT' : 'NO TRADE';
  const atrValue = atr || currentPrice * 0.02;
  
  let entry = currentPrice;
  let stopLoss = direction === 'LONG' ? currentPrice - atrValue : currentPrice + atrValue;
  let takeProfit = direction === 'LONG' ? currentPrice + (atrValue * 1.5) : currentPrice - (atrValue * 1.5);
  
  if (direction === 'NO TRADE') {
    stopLoss = currentPrice * 0.98;
    takeProfit = currentPrice * 1.02;
  }
  
  return {
    direction,
    entry: entry.toFixed(2),
    stopLoss: stopLoss.toFixed(2),
    takeProfit: takeProfit.toFixed(2),
    riskReward: "1:1.5",
    positionSize: direction === 'NO TRADE' ? "0%" : "1-2%",
    timing: direction === 'NO TRADE' ? "Wait for better setup" : "Ready for entry",
    risks: "Market volatility, news events, false breakouts",
    strategy: analysis.summary,
    confidence: analysis.confidenceScore,
    indicators: analysis.indicators
  };
}
