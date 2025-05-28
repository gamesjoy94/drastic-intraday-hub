
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
    console.log('OpenAI API key not found, falling back to rule-based analysis');
    return null;
  }

  try {
    console.log('Making OpenAI API request...');
    
    const prompt = `You are a professional trading analyst. Based on the following data for ${symbol} on ${timeframe} timeframe, provide a detailed trade plan.

Current Market Data:
- Symbol: ${symbol}
- Timeframe: ${timeframe}
- Current Price: $${currentPrice}
- Price Change: ${priceChange.toFixed(2)}%

Technical Analysis:
- Smart Momentum Analysis: ${analysis.summary}
- Market Bias: ${analysis.marketBias}
- Confidence: ${analysis.confidenceScore}%
- EMA8: ${technicalData.ema8[0]?.toFixed(2) || 'N/A'}
- EMA21: ${technicalData.ema21[0]?.toFixed(2) || 'N/A'}
- RSI: ${technicalData.rsi[0]?.toFixed(1) || 'N/A'}
- MACD: ${technicalData.macd[0]?.toFixed(4) || 'N/A'}
- VWAP: ${technicalData.vwap[0]?.toFixed(2) || 'N/A'}
- ATR: ${technicalData.atr[0]?.toFixed(2) || 'N/A'}

Pattern Recognition:
- Pattern: ${patternData.pattern}
- Direction: ${patternData.direction}
- Strength: ${patternData.strength}
- Probability: ${patternData.probability}%
- Support: ${patternData.support}
- Resistance: ${patternData.resistance}

Please provide a trade plan in the following JSON format (respond with ONLY the JSON, no markdown formatting):

{
  "direction": "BUY/SELL/NO TRADE",
  "entry": number,
  "stopLoss": number,
  "takeProfit": number,
  "riskReward": number,
  "positionSize": "string",
  "timing": "${timeframe}",
  "risks": ["risk1", "risk2"],
  "strategy": "detailed strategy explanation",
  "confidence": "High/Medium/Low",
  "indicators": {
    "EMA": {"EMA_8": number, "EMA_21": number},
    "RSI": number,
    "MACD": number,
    "VWAP": "Above/Below",
    "Volume_Spike": boolean,
    "Pattern": "string"
  }
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a professional trading analyst. Respond with valid JSON only, no markdown formatting.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.1,
      }),
    });

    console.log(`OpenAI response status: ${response.status}`);

    if (!response.ok) {
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
