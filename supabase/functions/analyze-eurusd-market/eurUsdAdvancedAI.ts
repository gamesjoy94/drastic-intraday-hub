
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

export async function getAdvancedEurUsdAIAnalysis(
  symbol: string,
  timeframe: string,
  currentPrice: number,
  priceChange: number,
  technicalData: any,
  analysis: any,
  patternData: any,
  marketContext: any
) {
  if (!OPENAI_API_KEY) {
    console.log('OpenAI API key not found, falling back to basic analysis');
    return null;
  }

  try {
    console.log('Making advanced AI request for EUR/USD multi-model analysis...');
    
    const prompt = `You are an elite EUR/USD forex analyst with access to advanced AI models. Perform a comprehensive multi-dimensional analysis using the following REAL market data:

CURRENT MARKET STATE:
- Symbol: ${symbol}
- Timeframe: ${timeframe}
- Price: $${currentPrice.toFixed(5)}
- Change: ${priceChange.toFixed(3)}%
- ATR: $${technicalData.atr[0]?.toFixed(5) || 'N/A'}

TECHNICAL INDICATORS (REAL DATA):
- EMA8: $${technicalData.ema8[0]?.toFixed(5)} | EMA21: $${technicalData.ema21[0]?.toFixed(5)}
- RSI: ${technicalData.rsi[0]?.toFixed(1)} (Previous: ${technicalData.rsi[1]?.toFixed(1)})
- MACD: ${technicalData.macd[0]?.toFixed(6)} | Signal: ${technicalData.macdSignal[0]?.toFixed(6)} | Histogram: ${technicalData.macdHistogram[0]?.toFixed(6)}
- VWAP: $${technicalData.vwap[0]?.toFixed(5)}
- Volume: ${technicalData.volume[0]?.toLocaleString()}

PATTERN ANALYSIS:
- Pattern: ${patternData.pattern}
- Direction: ${patternData.direction}
- Strength: ${patternData.strength}
- Probability: ${patternData.probability}%

AI ANALYSIS FRAMEWORK:
1. MULTI-TIMEFRAME CONFLUENCE: Analyze ${timeframe} in context of higher timeframes
2. MARKET REGIME DETECTION: Identify if market is trending/ranging/transitional
3. VOLATILITY FORECASTING: Predict next 4-hour volatility using current ATR patterns
4. SENTIMENT INTEGRATION: Factor in USD/EUR strength dynamics
5. RISK-ADJUSTED POSITIONING: Calculate optimal position size based on market uncertainty

ADVANCED AI REQUIREMENTS:
- Use ensemble thinking (combine trend-following + mean-reversion perspectives)
- Apply Bayesian inference for probability assessments
- Consider market microstructure and liquidity patterns
- Factor in central bank policy divergence
- Assess correlation breakdown risks

Provide response in JSON format:

{
  "aiConfidence": number (0-100),
  "marketRegime": "TRENDING_BULLISH/TRENDING_BEARISH/RANGING/BREAKOUT_PENDING",
  "volatilityForecast": "LOW/MEDIUM/HIGH",
  "sentimentScore": number (-100 to 100),
  "tradingSignal": {
    "direction": "STRONG_LONG/LONG/NEUTRAL/SHORT/STRONG_SHORT",
    "timeHorizon": "SCALP/INTRADAY/SWING",
    "confidence": number,
    "riskLevel": "LOW/MEDIUM/HIGH"
  },
  "aiInsights": {
    "keyDrivers": ["driver1", "driver2", "driver3"],
    "riskFactors": ["risk1", "risk2"],
    "opportunityFactors": ["opp1", "opp2"],
    "conflictingSignals": ["signal1", "signal2"]
  },
  "advancedMetrics": {
    "trendStrength": number (0-100),
    "momentumQuality": number (0-100),
    "volumeConfirmation": number (0-100),
    "structuralIntegrity": number (0-100)
  },
  "predictiveAnalysis": {
    "next4HourBias": "BULLISH/BEARISH/NEUTRAL",
    "volatilityExpansion": boolean,
    "breakoutProbability": number,
    "reversalRisk": number
  },
  "dynamicLevels": {
    "strongSupport": number,
    "weakSupport": number,
    "strongResistance": number,
    "weakResistance": number,
    "volatilityExpansionLevel": number
  },
  "positionManagement": {
    "optimalPositionSize": string,
    "dynamicStopLoss": number,
    "adaptiveTakeProfit": number,
    "scalingStrategy": "PYRAMID_UP/PYRAMID_DOWN/STATIC"
  }
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',  // Using more powerful model for advanced analysis
        messages: [
          {
            role: 'system',
            content: 'You are an elite EUR/USD forex analyst with advanced AI capabilities. Respond with valid JSON only. Use sophisticated multi-model thinking, Bayesian inference, and market microstructure analysis.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1500,
        temperature: 0.1,  // Lower temperature for more consistent analysis
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Advanced AI API error: ${response.status} - ${errorText}`);
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
      const aiAnalysis = JSON.parse(content);
      console.log('Advanced EUR/USD AI analysis generated successfully');
      return aiAnalysis;
    } catch (parseError) {
      console.error('Failed to parse advanced AI response:', parseError);
      return null;
    }

  } catch (error) {
    console.error('Error getting advanced EUR/USD AI analysis:', error);
    return null;
  }
}

export function generateEnhancedTradePlan(
  basicTradePlan: any,
  aiAnalysis: any,
  currentPrice: number,
  technicalData: any
) {
  if (!aiAnalysis) return basicTradePlan;

  // Enhanced trade plan with AI insights
  return {
    ...basicTradePlan,
    aiEnhanced: true,
    marketRegime: aiAnalysis.marketRegime,
    volatilityForecast: aiAnalysis.volatilityForecast,
    aiConfidence: aiAnalysis.aiConfidence,
    tradingSignal: aiAnalysis.tradingSignal,
    
    // Dynamic position sizing based on AI analysis
    positionSize: aiAnalysis.positionManagement?.optimalPositionSize || basicTradePlan.positionSize,
    
    // AI-adjusted levels
    stopLoss: aiAnalysis.positionManagement?.dynamicStopLoss?.toFixed(5) || basicTradePlan.stopLoss,
    takeProfit: aiAnalysis.positionManagement?.adaptiveTakeProfit?.toFixed(5) || basicTradePlan.takeProfit,
    
    // Enhanced strategy description
    strategy: `AI-ENHANCED: ${aiAnalysis.marketRegime} regime detected with ${aiAnalysis.aiConfidence}% AI confidence. ${aiAnalysis.tradingSignal.direction} signal for ${aiAnalysis.tradingSignal.timeHorizon} timeframe. ${basicTradePlan.strategy}`,
    
    // AI insights
    aiInsights: aiAnalysis.aiInsights,
    predictiveAnalysis: aiAnalysis.predictiveAnalysis,
    advancedMetrics: aiAnalysis.advancedMetrics,
    dynamicLevels: aiAnalysis.dynamicLevels,
    
    // Enhanced risk assessment
    risks: `AI-DETECTED RISKS: ${aiAnalysis.aiInsights.riskFactors.join(', ')}. CONFLICTING SIGNALS: ${aiAnalysis.aiInsights.conflictingSignals.join(', ')}. ${basicTradePlan.risks}`,
    
    // AI timing recommendations
    timing: `AI OPTIMAL TIMING: ${aiAnalysis.predictiveAnalysis.next4HourBias} bias for next 4 hours. ${aiAnalysis.volatilityForecast} volatility expected. ${basicTradePlan.timing}`,
    
    // Enhanced confidence scoring
    confidence: Math.min(Math.max(
      (parseInt(basicTradePlan.confidence) + aiAnalysis.aiConfidence) / 2,
      0
    ), 95)
  };
}
