
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const TWELVE_DATA_KEY = Deno.env.get('TWELVE_DATA_KEY');
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { symbol, timeframe } = await req.json();
    console.log(`Analyzing ${symbol} on ${timeframe} timeframe`);

    // Fetch real market data from Twelve Data
    const marketDataResponse = await fetch(
      `https://api.twelvedata.com/time_series?symbol=${symbol}&interval=${timeframe}&apikey=${TWELVE_DATA_KEY}&outputsize=50`
    );
    
    if (!marketDataResponse.ok) {
      throw new Error(`Market data API error: ${marketDataResponse.status}`);
    }
    
    const marketData = await marketDataResponse.json();
    
    if (marketData.status === 'error') {
      throw new Error(`Twelve Data API error: ${marketData.message}`);
    }

    // Get current price and calculate change
    const latestData = marketData.values[0];
    const previousData = marketData.values[1];
    const currentPrice = parseFloat(latestData.close);
    const previousPrice = parseFloat(previousData.close);
    const priceChange = ((currentPrice - previousPrice) / previousPrice) * 100;

    // Fetch technical indicators
    const [rsiResponse, macdResponse, emaResponse] = await Promise.all([
      fetch(`https://api.twelvedata.com/rsi?symbol=${symbol}&interval=${timeframe}&time_period=14&apikey=${TWELVE_DATA_KEY}`),
      fetch(`https://api.twelvedata.com/macd?symbol=${symbol}&interval=${timeframe}&apikey=${TWELVE_DATA_KEY}`),
      fetch(`https://api.twelvedata.com/ema?symbol=${symbol}&interval=${timeframe}&time_period=21&apikey=${TWELVE_DATA_KEY}`)
    ]);

    const [rsiData, macdData, emaData] = await Promise.all([
      rsiResponse.json(),
      macdResponse.json(),
      emaResponse.json()
    ]);

    // Extract indicator values
    const rsi = rsiData.values?.[0]?.rsi ? parseFloat(rsiData.values[0].rsi) : 50;
    const macd = macdData.values?.[0]?.macd ? parseFloat(macdData.values[0].macd) : 0;
    const ema21 = emaData.values?.[0]?.ema ? parseFloat(emaData.values[0].ema) : currentPrice;

    // Calculate support and resistance levels
    const highs = marketData.values.slice(0, 20).map((v: any) => parseFloat(v.high));
    const lows = marketData.values.slice(0, 20).map((v: any) => parseFloat(v.low));
    const resistance = Math.max(...highs);
    const support = Math.min(...lows);

    // Create market analysis prompt for OpenAI
    const analysisPrompt = `
Analyze the following market data for ${symbol} and provide a professional trading recommendation:

Current Price: $${currentPrice}
Price Change: ${priceChange.toFixed(2)}%
RSI: ${rsi.toFixed(1)}
MACD: ${macd.toFixed(3)}
EMA21: $${ema21.toFixed(2)}
Resistance: $${resistance.toFixed(2)}
Support: $${support.toFixed(2)}
Timeframe: ${timeframe}

Recent price data (last 10 periods):
${marketData.values.slice(0, 10).map((v: any, i: number) => 
  `${i + 1}. Open: $${v.open}, High: $${v.high}, Low: $${v.low}, Close: $${v.close}, Volume: ${v.volume}`
).join('\n')}

Please provide:
1. Entry price recommendation
2. Stop loss level
3. Take profit target
4. Risk-reward ratio
5. Trading strategy explanation (max 200 words)
6. Confidence level (0-100%)
7. Key technical indicators summary

Format your response as a JSON object with these exact keys: entry, stopLoss, takeProfit, riskReward, strategy, confidence, indicators
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
            content: 'You are a professional trading analyst. Provide technical analysis and trading recommendations based on market data. Always respond with valid JSON format.'
          },
          {
            role: 'user',
            content: analysisPrompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1000,
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
      // Fallback trade plan
      tradePlan = {
        entry: currentPrice,
        stopLoss: currentPrice * 0.98,
        takeProfit: currentPrice * 1.04,
        riskReward: "2.0",
        strategy: "Based on current market conditions, this appears to be a moderate risk trade setup.",
        confidence: 75,
        indicators: {
          rsi: rsi < 30 ? 'Oversold' : rsi > 70 ? 'Overbought' : 'Neutral',
          macd: macd > 0 ? 'Bullish' : 'Bearish',
          trend: currentPrice > ema21 ? 'Bullish' : 'Bearish',
          volume: 'Normal'
        }
      };
    }

    // Return comprehensive analysis
    const result = {
      currentPrice,
      priceChange,
      tradePlan: {
        entry: parseFloat(tradePlan.entry) || currentPrice,
        stopLoss: parseFloat(tradePlan.stopLoss) || currentPrice * 0.98,
        takeProfit: parseFloat(tradePlan.takeProfit) || currentPrice * 1.04,
        riskReward: tradePlan.riskReward || "2.0",
        strategy: tradePlan.strategy || "Analysis based on current market conditions.",
        confidence: parseInt(tradePlan.confidence) || 75,
        indicators: tradePlan.indicators || {
          rsi: rsi < 30 ? 'Oversold' : rsi > 70 ? 'Overbought' : 'Neutral',
          macd: macd > 0 ? 'Bullish' : 'Bearish',
          trend: currentPrice > ema21 ? 'Bullish' : 'Bearish',
          volume: 'Normal'
        }
      },
      technicalData: {
        rsi: rsi.toFixed(1),
        macd: macd.toFixed(3),
        ema21: ema21.toFixed(2),
        support: support.toFixed(2),
        resistance: resistance.toFixed(2)
      }
    };

    console.log('Analysis completed successfully:', result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-market function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        currentPrice: 0,
        priceChange: 0,
        tradePlan: null 
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
