
import { SmartMomentumAnalysis, PatternData } from './types.ts';

export function generateEurUsdFallbackTradePlan(
  analysis: SmartMomentumAnalysis, 
  currentPrice: number, 
  atr: number,
  patternData?: PatternData
) {
  console.log('Generating REAL EUR/USD AI-Enhanced Trend Reversal trade plan from live market data');
  
  if (!atr || atr <= 0) {
    throw new Error('Real ATR data is required for proper trade plan generation');
  }
  
  const atrValue = atr; // Use real ATR value, no fallback
  
  let direction = 'NO TRADE';
  let confidence = analysis.confidenceScore;
  
  // REAL AI-Enhanced Trend Reversal decision logic using live data
  if (analysis.longScore >= 4.5) {
    direction = 'LONG';
  } else if (analysis.shortScore >= 4.5) {
    direction = 'SHORT';
  } else if (analysis.longScore >= 3.5 && analysis.marketBias === 'BULLISH') {
    direction = 'LONG';
    confidence = Math.max(confidence - 15, 45);
  } else if (analysis.shortScore >= 3.5 && analysis.marketBias === 'BEARISH') {
    direction = 'SHORT';
    confidence = Math.max(confidence - 15, 45);
  }
  
  // Real pattern confirmation for trend reversal
  if (patternData && patternData.probability >= 75) {
    if (direction === 'NO TRADE') {
      direction = patternData.direction === 'BULLISH' ? 'LONG' : patternData.direction === 'BEARISH' ? 'SHORT' : 'NO TRADE';
      confidence = Math.min(patternData.probability - 5, 70);
    } else if (
      (direction === 'LONG' && patternData.direction === 'BULLISH') ||
      (direction === 'SHORT' && patternData.direction === 'BEARISH')
    ) {
      confidence = Math.min(confidence + 15, 90);
    }
  }
  
  // Calculate EUR/USD specific levels using REAL ATR
  let entry = currentPrice;
  let stopLoss: number;
  let takeProfit: number;
  let riskReward = "1:2.0";
  
  if (direction === 'LONG') {
    stopLoss = currentPrice - (atrValue * 2.0);
    takeProfit = currentPrice + (atrValue * 4.0);
    riskReward = "1:2.0";
    
    // Use real support levels if available
    if (patternData) {
      const supportPrice = parseFloat(patternData.support);
      if (supportPrice > 0 && supportPrice < currentPrice) {
        stopLoss = Math.max(stopLoss, supportPrice - (atrValue * 0.5));
      }
    }
    
  } else if (direction === 'SHORT') {
    stopLoss = currentPrice + (atrValue * 2.0);
    takeProfit = currentPrice - (atrValue * 4.0);
    riskReward = "1:2.0";
    
    // Use real resistance levels if available
    if (patternData) {
      const resistancePrice = parseFloat(patternData.resistance);
      if (resistancePrice > 0 && resistancePrice > currentPrice) {
        stopLoss = Math.min(stopLoss, resistancePrice + (atrValue * 0.5));
      }
    }
    
  } else {
    stopLoss = currentPrice - (atrValue * 1.0);
    takeProfit = currentPrice + (atrValue * 1.0);
    riskReward = "1:1.0";
  }
  
  // Conservative position sizing for real forex trading
  let positionSize = "0%";
  if (direction !== 'NO TRADE') {
    if (confidence >= 80) positionSize = "1-2%";
    else if (confidence >= 65) positionSize = "0.5-1%";
    else positionSize = "0.25-0.5%";
  }
  
  // Generate strategy explanation based on real analysis
  const strategyComponents = [];
  
  if (analysis.emaCrossover !== 'NONE') {
    strategyComponents.push(`${analysis.emaCrossover.replace('_', ' ')} from real EMA data`);
  }
  
  if (analysis.macdSignal !== 'NEUTRAL') {
    strategyComponents.push(`${analysis.macdSignal.toLowerCase()} MACD from live data`);
  }
  
  if (analysis.rsiDirection !== 'NEUTRAL') {
    strategyComponents.push(`RSI ${analysis.rsiDirection.toLowerCase()} momentum from real-time data`);
  }
  
  if (analysis.vwapPosition !== 'NEUTRAL') {
    strategyComponents.push(`price ${analysis.vwapPosition.toLowerCase()} real VWAP`);
  }
  
  if (analysis.volumeSpike) {
    strategyComponents.push('live volume confirmation');
  }
  
  const strategy = strategyComponents.length > 0 
    ? `REAL AI-Enhanced Trend Reversal analysis from live market data shows ${strategyComponents.join(', ')}. Multiple real indicator convergence suggests ${analysis.marketBias.toLowerCase()} bias with ${confidence}% confidence.`
    : `${analysis.summary} Based on real-time market data analysis.`;
  
  // Real EUR/USD specific risks
  const risks = [];
  if (analysis.confidenceScore < 65) risks.push('low signal confidence from real data');
  if (!analysis.volumeSpike) risks.push('volume not confirmed in live data');
  risks.push('ECB/Fed policy divergence', 'real-time USD strength/weakness', 'live European economic data releases');
  
  return {
    direction,
    entry: entry.toFixed(5),
    stopLoss: stopLoss.toFixed(5),
    takeProfit: takeProfit.toFixed(5),
    riskReward,
    positionSize,
    timing: direction === 'NO TRADE' ? "Wait for real trend reversal signals" : "Real multi-indicator convergence detected",
    risks: risks.join(', '),
    strategy,
    confidence,
    indicators: {
      EMA20_50: { EMA_20: analysis.indicators.ema.split(' / ')[0], EMA_50: analysis.indicators.ema.split(' / ')[1] },
      RSI: parseFloat(analysis.indicators.rsi.split(' ')[0]),
      MACD: analysis.macdSignal,
      VWAP: analysis.vwapPosition,
      Volume_Confirmation: analysis.volumeSpike,
      AI_Signal: direction === 'LONG' ? 'BUY' : direction === 'SHORT' ? 'SELL' : 'NEUTRAL'
    }
  };
}
