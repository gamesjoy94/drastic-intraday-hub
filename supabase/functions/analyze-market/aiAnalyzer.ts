
import { SmartMomentumAnalysis, PatternData } from './types.ts';

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

export async function getAITradePlan(
  symbol: string, 
  timeframe: string, 
  currentPrice: number, 
  priceChange: number, 
  technicalData: any, 
  analysis: SmartMomentumAnalysis, 
  patternData: PatternData
) {
  const strategyPrompt = `
SMART MOMENTUM SCALPING + PATTERN RECOGNITION ANALYSIS FOR ${symbol}

Current Market State:
- Price: $${currentPrice.toFixed(2)}
- Price Change: ${priceChange.toFixed(2)}%
- Timeframe: ${timeframe}

MOMENTUM ANALYSIS:
- EMA 8: $${technicalData.ema8?.[0]?.toFixed(2) || 'N/A'}
- EMA 21: $${technicalData.ema21?.[0]?.toFixed(2) || 'N/A'}
- EMA Crossover Signal: ${analysis.emaCrossover}
- RSI: ${technicalData.rsi?.[0]?.toFixed(1) || 'N/A'}
- MACD: ${technicalData.macd?.[0]?.toFixed(4) || 'N/A'}
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

  try {
    console.log('Making OpenAI API request...');
    
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
            content: 'You are a professional trading analyst specializing in Smart Momentum Scalping and Pattern Recognition. Provide precise, actionable trade recommendations. Always respond with valid JSON format only, no additional text.'
          },
          {
            role: 'user',
            content: strategyPrompt
          }
        ],
        temperature: 0.2,
        max_tokens: 800,
      }),
    });

    console.log('OpenAI response status:', openAIResponse.status);

    if (!openAIResponse.ok) {
      const errorText = await openAIResponse.text();
      console.error('OpenAI API error response:', errorText);
      
      if (openAIResponse.status === 429) {
        throw new Error(`API rate limit exceeded. Please wait before trying again.`);
      } else if (openAIResponse.status === 401) {
        throw new Error(`Invalid OpenAI API key. Please check your API key configuration.`);
      } else {
        throw new Error(`OpenAI API error: ${openAIResponse.status} - ${errorText}`);
      }
    }

    const aiResponse = await openAIResponse.json();
    console.log('OpenAI response received');
    
    if (!aiResponse.choices || !aiResponse.choices[0] || !aiResponse.choices[0].message) {
      console.error('Invalid OpenAI response structure:', aiResponse);
      throw new Error('Invalid response from OpenAI API');
    }

    const content = aiResponse.choices[0].message.content.trim();
    console.log('AI response content:', content);
    
    try {
      return JSON.parse(content);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      console.error('AI response content:', content);
      
      // Try to extract JSON from the response if it's wrapped in text
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[0]);
        } catch (secondParseError) {
          console.error('Failed to parse extracted JSON:', secondParseError);
        }
      }
      
      return null;
    }
  } catch (error) {
    console.error('Error in getAITradePlan:', error);
    throw error;
  }
}
