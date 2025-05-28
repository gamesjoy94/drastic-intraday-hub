
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

export async function getAITradePlan(
  symbol: string,
  timeframe: string,
  currentPrice: number,
  priceChange: number,
  technicalData: any,
  analysis: any,
  patternData: any
) {
  if (!OPENAI_API_KEY) {
    console.log('OpenAI API key not found, falling back to enhanced rule-based analysis');
    return null;
  }

  try {
    console.log('Making OpenAI API request...');
    
    const prompt = `You are a professional gold trading analyst. Based on the following REAL market data for ${symbol} on ${timeframe} timeframe, provide a detailed trade plan.

REAL MARKET DATA:
- Symbol: ${symbol}
- Timeframe: ${timeframe}
- Current Price: $${currentPrice.toFixed(2)}
- Price Change: ${priceChange.toFixed(2)}%

REAL TECHNICAL ANALYSIS:
- Market Bias: ${analysis.marketBias}
- Confidence: ${analysis.confidenceScore}%
- Long Score: ${analysis.longScore}/5
- Short Score: ${analysis.shortScore}/5
- EMA8: $${technicalData.ema8[0]?.toFixed(2) || 'N/A'}
- EMA21: $${technicalData.ema21[0]?.toFixed(2) || 'N/A'}
- RSI: ${technicalData.rsi[0]?.toFixed(1) || 'N/A'} (${analysis.rsiDirection})
- MACD: ${technicalData.macd[0]?.toFixed(4) || 'N/A'} (${analysis.macdSignal})
- VWAP: $${technicalData.vwap[0]?.toFixed(2) || 'N/A'} (Price ${analysis.vwapPosition})
- ATR: $${technicalData.atr[0]?.toFixed(2) || 'N/A'}
- Volume: ${analysis.volumeSpike ? 'HIGH' : 'NORMAL'}

PATTERN ANALYSIS:
- Pattern: ${patternData.pattern}
- Direction: ${patternData.direction}
- Strength: ${patternData.strength}
- Probability: ${patternData.probability}%
- Support: $${patternData.support}
- Resistance: $${patternData.resistance}
- Breakout Level: $${patternData.breakoutLevel}
- Target: $${patternData.target}

Provide a trade plan in JSON format ONLY (no markdown):

{
  "direction": "LONG/SHORT/NO TRADE",
  "entry": ${currentPrice},
  "stopLoss": number,
  "takeProfit": number,
  "riskReward": "1:X",
  "positionSize": "X%",
  "timing": "description",
  "risks": "risk description",
  "strategy": "detailed explanation based on REAL data",
  "confidence": number,
  "indicators": {
    "EMA": {"EMA_8": ${technicalData.ema8[0] || currentPrice}, "EMA_21": ${technicalData.ema21[0] || currentPrice}},
    "RSI": ${technicalData.rsi[0] || 50},
    "MACD": ${technicalData.macd[0] || 0},
    "VWAP": "${analysis.vwapPosition}",
    "Volume_Spike": ${analysis.volumeSpike},
    "Pattern": "${patternData.pattern}"
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
            content: 'You are a professional gold trading analyst. Respond with valid JSON only, no markdown formatting. Base your analysis strictly on the provided REAL market data.'
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

    console.log(`OpenAI response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OpenAI API error: ${response.status} - ${errorText}`);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('OpenAI response received');
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid OpenAI response structure');
    }

    let content = data.choices[0].message.content.trim();
    console.log('AI response content:', content);

    // Clean up the response - remove markdown code blocks if present
    if (content.startsWith('```json')) {
      content = content.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (content.startsWith('```')) {
      content = content.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    // Remove any leading/trailing whitespace
    content = content.trim();

    try {
      const tradePlan = JSON.parse(content);
      console.log('Successfully parsed AI trade plan:', tradePlan);
      return tradePlan;
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      console.log('Raw content after cleanup:', content);
      return null;
    }

  } catch (error) {
    console.error('Error getting AI trade plan:', error);
    return null;
  }
}
