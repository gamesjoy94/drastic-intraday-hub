
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
  
  try {
    return JSON.parse(aiResponse.choices[0].message.content);
  } catch (parseError) {
    console.error('Failed to parse AI response as JSON:', parseError);
    return null;
  }
}
