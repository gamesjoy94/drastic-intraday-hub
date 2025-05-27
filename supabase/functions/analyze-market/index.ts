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
      ohlcv: ohlcvData.values.slice(0, 50)
    };

    // Calculate Smart Momentum Scalping signals
    const analysis = analyzeSmartMomentumScalping(technicalData, currentPrice);
    
    // Add Pattern Recognition Analysis
    const patternData = analyzePatterns(technicalData, currentPrice);

    // Create detailed AI prompt for trade plan generation
    const strategyPrompt = `
SMART MOMENTUM SCALPING + PATTERN RECOGNITION ANALYSIS FOR ${symbol}

Current Market State:
- Price: $${currentPrice.toFixed(2)}
- Price Change: ${priceChange.toFixed(2)}%
- Timeframe: ${timeframe}

MOMENTUM ANALYSIS:
- EMA 8: $${technicalData.ema8[0]?.toFixed(2) || 'N/A'}
- EMA 21: $${technicalData.ema21[0]?.toFixed(2) || 'N/A'}
- EMA Crossover Signal: ${analysis.emaCrossover}
- RSI: ${technicalData.rsi[0]?.toFixed(1) || 'N/A'}
- MACD: ${technicalData.macd[0]?.toFixed(4) || 'N/A'}
- Volume Spike: ${analysis.volumeSpike}
- VWAP Position: ${analysis.vwapPosition}

PATTERN RECOGNITION:
- Primary Pattern: ${patternData.pattern} (${patternData.strength})
- Direction: ${patternData.direction}
- Support: $${patternData.support}
- Resistance: $${patternData.resistance}
- Breakout Level: $${patternData.breakoutLevel}
- Pattern Probability: ${patternData.probability}%

COMBINED SIGNAL STRENGTH:
- Momentum Score: ${Math.max(analysis.longScore, analysis.shortScore)}/5
- Pattern Strength: ${patternData.strength}
- Overall Bias: ${analysis.marketBias}

Based on this combined analysis, provide a professional trade recommendation with JSON format containing: direction, entry, stopLoss, takeProfit, riskReward, positionSize, timing, risks, strategy, confidence, indicators
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
            content: 'You are a professional trading analyst specializing in Smart Momentum Scalping and Pattern Recognition. Provide precise, actionable trade recommendations. Always respond with valid JSON format.'
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
      tradePlan = generateFallbackTradePlan(analysis, currentPrice, technicalData.atr[0]);
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
        positionSize: tradePlan.positionSize || "1-2%",
        timing: tradePlan.timing || "Monitor for entry",
        risks: tradePlan.risks || "Standard market risks apply",
        strategy: tradePlan.strategy || `${analysis.summary} Combined with ${patternData.pattern} pattern.`,
        confidence: parseInt(tradePlan.confidence) || Math.min(analysis.confidenceScore + patternData.probability, 100) / 2,
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

    console.log('Smart Momentum + Pattern Recognition analysis completed successfully:', result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analysis:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        currentPrice: 0,
        priceChange: 0,
        tradePlan: null,
        analysis: null,
        patternData: null
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

function analyzePatterns(data: TechnicalData, currentPrice: number) {
  const ohlcv = data.ohlcv.slice(0, 20);
  const highs = ohlcv.map(v => parseFloat(v.high));
  const lows = ohlcv.map(v => parseFloat(v.low));
  const closes = ohlcv.map(v => parseFloat(v.close));
  const volumes = data.volume.slice(0, 20);
  
  // Calculate support and resistance levels
  const recentHighs = highs.slice(0, 10);
  const recentLows = lows.slice(0, 10);
  const resistance = Math.max(...recentHighs);
  const support = Math.min(...recentLows);
  const pivot = (resistance + support + currentPrice) / 3;
  
  // Pattern detection logic
  let pattern = 'Consolidation';
  let direction = 'NEUTRAL';
  let strength = 'MODERATE';
  let probability = 60;
  
  // Detect ascending triangle
  if (recentHighs.filter(h => h > currentPrice * 1.01).length >= 2 && 
      recentLows.slice(0, 5).every((low, i, arr) => i === 0 || low >= arr[i-1] * 0.999)) {
    pattern = 'Ascending Triangle';
    direction = 'BULLISH';
    strength = 'STRONG';
    probability = 75;
  }
  // Detect descending triangle
  else if (recentLows.filter(l => l < currentPrice * 0.99).length >= 2 && 
           recentHighs.slice(0, 5).every((high, i, arr) => i === 0 || high <= arr[i-1] * 1.001)) {
    pattern = 'Descending Triangle';
    direction = 'BEARISH';
    strength = 'STRONG';
    probability = 75;
  }
  // Detect double top
  else if (recentHighs.length >= 2 && Math.abs(recentHighs[0] - recentHighs[1]) < currentPrice * 0.005) {
    pattern = 'Double Top';
    direction = 'BEARISH';
    strength = 'MODERATE';
    probability = 65;
  }
  // Detect double bottom
  else if (recentLows.length >= 2 && Math.abs(recentLows[0] - recentLows[1]) < currentPrice * 0.005) {
    pattern = 'Double Bottom';
    direction = 'BULLISH';
    strength = 'MODERATE';
    probability = 65;
  }
  // Detect flag pattern
  else if (Math.abs(resistance - support) < currentPrice * 0.02) {
    pattern = 'Flag Pattern';
    direction = closes[0] > closes[4] ? 'BULLISH' : 'BEARISH';
    strength = 'WEAK';
    probability = 55;
  }
  
  // Calculate breakout level and target
  const atr = data.atr[0] || currentPrice * 0.02;
  const breakoutLevel = direction === 'BULLISH' ? resistance : support;
  const target = direction === 'BULLISH' ? 
    breakoutLevel + (atr * 2) : 
    breakoutLevel - (atr * 2);
  
  // Volume confirmation
  const avgVolume = volumes.reduce((a, b) => a + b, 0) / volumes.length;
  const volumeConfirmation = volumes[0] > avgVolume * 1.2;
  
  if (volumeConfirmation && strength === 'MODERATE') {
    strength = 'STRONG';
    probability += 10;
  }
  
  return {
    pattern,
    direction,
    strength,
    probability: Math.min(probability, 85),
    support: support.toFixed(2),
    resistance: resistance.toFixed(2),
    pivot: pivot.toFixed(2),
    breakoutLevel: breakoutLevel.toFixed(2),
    target: target.toFixed(2),
    description: `${pattern} detected with ${direction.toLowerCase()} bias`,
    analysis: `Pattern shows ${strength.toLowerCase()} ${direction.toLowerCase()} potential. Key level at $${breakoutLevel.toFixed(2)} with target around $${target.toFixed(2)}. ${volumeConfirmation ? 'Volume confirms the pattern.' : 'Volume needs confirmation.'}`,
    signals: {
      volumeConfirmation: volumeConfirmation ? 'CONFIRMED' : 'PENDING',
      priceAction: direction,
      keyLevel: `$${breakoutLevel.toFixed(2)}`,
      riskLevel: strength === 'STRONG' ? 'LOW' : strength === 'MODERATE' ? 'MEDIUM' : 'HIGH'
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
