
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

export async function getEurUsdAITradePlan(
  symbol: string,
  timeframe: string,
  currentPrice: number,
  priceChange: number,
  technicalData: any,
  analysis: any,
  patternData: any
) {
  if (!OPENAI_API_KEY) {
    console.log('OpenAI API key not found, falling back to EUR/USD rule-based analysis');
    return null;
  }

  try {
    console.log('Making OpenAI API request for EUR/USD AI-Enhanced Trend Reversal analysis...');
    
    const prompt = `You are a professional EUR/USD forex analyst specializing in AI-Enhanced Trend Reversal & Momentum Strategy. Based on the following REAL market data for ${symbol} on ${timeframe} timeframe, provide a detailed trade plan.

REAL EUR/USD MARKET DATA:
- Symbol: ${symbol}
- Timeframe: ${timeframe}
- Current Price: $${currentPrice.toFixed(5)}
- Price Change: ${priceChange.toFixed(3)}%

AI-ENHANCED TREND REVERSAL ANALYSIS:
- Market Bias: ${analysis.marketBias}
- AI Confidence: ${analysis.confidenceScore}%
- Long Score: ${analysis.longScore}/5
- Short Score: ${analysis.shortScore}/5
- EMA20/50 Signal: ${analysis.emaCrossover} (using EMA8/21 as proxy)
- RSI: ${technicalData.rsi[0]?.toFixed(1) || 'N/A'} (${analysis.rsiDirection})
- MACD: ${technicalData.macd[0]?.toFixed(6) || 'N/A'} vs Signal ${technicalData.macdSignal[0]?.toFixed(6) || 'N/A'} (${analysis.macdSignal})
- VWAP: $${technicalData.vwap[0]?.toFixed(5) || 'N/A'} (Price ${analysis.vwapPosition})
- ATR: $${technicalData.atr[0]?.toFixed(5) || 'N/A'}
- Volume: ${analysis.volumeSpike ? 'HIGH CONFIRMATION' : 'NORMAL'}

PATTERN ANALYSIS:
- Pattern: ${patternData.pattern}
- Direction: ${patternData.direction}
- Strength: ${patternData.strength}
- Probability: ${patternData.probability}%

STRATEGY REQUIREMENTS:
Long Entry: EMA20>EMA50 + MACD>Signal(both positive) + RSI rising<70 + Strong trend + Price>VWAP + AI Buy signal
Short Entry: EMA20<EMA50 + MACD<Signal(both negative) + RSI falling>30 + Strong trend + Price<VWAP + AI Sell signal

Provide a trade plan in JSON format ONLY:

{
  "direction": "LONG/SHORT/NO TRADE",
  "entry": ${currentPrice},
  "stopLoss": number,
  "takeProfit": number,
  "riskReward": "1:X",
  "positionSize": "X%",
  "timing": "description",
  "risks": "EUR/USD specific risks",
  "strategy": "AI-Enhanced Trend Reversal analysis with specific entry conditions",
  "confidence": number,
  "indicators": {
    "EMA20_50": {"EMA_20": ${technicalData.ema8[0] || currentPrice}, "EMA_50": ${technicalData.ema21[0] || currentPrice}},
    "RSI": ${technicalData.rsi[0] || 50},
    "MACD": ${technicalData.macd[0] || 0},
    "VWAP": "${analysis.vwapPosition}",
    "Volume_Confirmation": ${analysis.volumeSpike},
    "AI_Signal": "BUY/SELL/NEUTRAL"
  }
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a professional EUR/USD forex analyst specializing in AI-Enhanced Trend Reversal strategy. Respond with valid JSON only, no markdown formatting. Focus on multi-indicator convergence and trend reversal signals.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 800,
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OpenAI API error for EUR/USD: ${response.status} - ${errorText}`);
      return null;
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      return null;
    }

    let content = data.choices[0].message.content.trim();
    
    // Clean up response
    if (content.startsWith('```json')) {
      content = content.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (content.startsWith('```')) {
      content = content.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    try {
      const tradePlan = JSON.parse(content);
      console.log('EUR/USD AI trade plan generated successfully');
      return tradePlan;
    } catch (parseError) {
      console.error('Failed to parse EUR/USD AI response:', parseError);
      return null;
    }

  } catch (error) {
    console.error('Error getting EUR/USD AI trade plan:', error);
    return null;
  }
}
