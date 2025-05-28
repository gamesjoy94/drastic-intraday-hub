
import { SmartMomentumAnalysis, PatternData } from './types.ts';

export function generateFallbackTradePlan(
  analysis: SmartMomentumAnalysis, 
  currentPrice: number, 
  atr: number,
  patternData?: PatternData
) {
  console.log('Generating enhanced fallback trade plan based on real technical analysis');
  
  const atrValue = atr || currentPrice * 0.015; // More realistic ATR fallback
  
  // Enhanced decision logic based on multiple factors
  let direction = 'NO TRADE';
  let confidence = analysis.confidenceScore;
  
  // Primary decision based on Smart Momentum Analysis
  if (analysis.longScore >= 4) {
    direction = 'LONG';
  } else if (analysis.shortScore >= 4) {
    direction = 'SHORT';
  } else if (analysis.longScore >= 3 && analysis.marketBias === 'BULLISH') {
    direction = 'LONG';
    confidence = Math.max(confidence - 10, 50);
  } else if (analysis.shortScore >= 3 && analysis.marketBias === 'BEARISH') {
    direction = 'SHORT';
    confidence = Math.max(confidence - 10, 50);
  }
  
  // Pattern confirmation
  if (patternData && patternData.probability >= 70) {
    if (direction === 'NO TRADE') {
      direction = patternData.direction === 'BULLISH' ? 'LONG' : patternData.direction === 'BEARISH' ? 'SHORT' : 'NO TRADE';
      confidence = Math.min(patternData.probability, 65);
    } else if (
      (direction === 'LONG' && patternData.direction === 'BULLISH') ||
      (direction === 'SHORT' && patternData.direction === 'BEARISH')
    ) {
      confidence = Math.min(confidence + 10, 85);
    }
  }
  
  // Calculate realistic entry, stop loss, and take profit based on real data
  let entry = currentPrice;
  let stopLoss: number;
  let takeProfit: number;
  let riskReward = "1:1.5";
  
  if (direction === 'LONG') {
    stopLoss = currentPrice - (atrValue * 1.5);
    takeProfit = currentPrice + (atrValue * 2.5);
    riskReward = "1:1.7";
    
    // Use pattern support/resistance if available
    if (patternData) {
      const supportPrice = parseFloat(patternData.support);
      const resistancePrice = parseFloat(patternData.resistance);
      if (supportPrice > 0 && supportPrice < currentPrice) {
        stopLoss = Math.max(stopLoss, supportPrice - (atrValue * 0.5));
      }
      if (resistancePrice > currentPrice) {
        takeProfit = Math.min(takeProfit, resistancePrice);
      }
    }
    
  } else if (direction === 'SHORT') {
    stopLoss = currentPrice + (atrValue * 1.5);
    takeProfit = currentPrice - (atrValue * 2.5);
    riskReward = "1:1.7";
    
    // Use pattern support/resistance if available
    if (patternData) {
      const supportPrice = parseFloat(patternData.support);
      const resistancePrice = parseFloat(patternData.resistance);
      if (resistancePrice > 0 && resistancePrice > currentPrice) {
        stopLoss = Math.min(stopLoss, resistancePrice + (atrValue * 0.5));
      }
      if (supportPrice < currentPrice) {
        takeProfit = Math.max(takeProfit, supportPrice);
      }
    }
    
  } else {
    stopLoss = currentPrice - (atrValue * 1.0);
    takeProfit = currentPrice + (atrValue * 1.0);
    riskReward = "1:1.0";
  }
  
  // Position sizing based on confidence and risk
  let positionSize = "0%";
  if (direction !== 'NO TRADE') {
    if (confidence >= 75) positionSize = "2-3%";
    else if (confidence >= 60) positionSize = "1-2%";
    else positionSize = "0.5-1%";
  }
  
  // Generate realistic strategy explanation
  const strategyComponents = [];
  
  if (analysis.emaCrossover !== 'NONE') {
    strategyComponents.push(`${analysis.emaCrossover} EMA crossover signal`);
  }
  
  if (analysis.rsiDirection !== 'NEUTRAL') {
    strategyComponents.push(`RSI ${analysis.rsiDirection.toLowerCase()} momentum`);
  }
  
  if (analysis.macdSignal !== 'NEUTRAL') {
    strategyComponents.push(`${analysis.macdSignal.toLowerCase()} MACD signal`);
  }
  
  if (analysis.vwapPosition !== 'NEUTRAL') {
    strategyComponents.push(`price ${analysis.vwapPosition.toLowerCase()} VWAP`);
  }
  
  if (analysis.volumeSpike) {
    strategyComponents.push('volume confirmation');
  }
  
  if (patternData) {
    strategyComponents.push(`${patternData.pattern} pattern (${patternData.probability}% probability)`);
  }
  
  const strategy = strategyComponents.length > 0 
    ? `Real-time analysis shows ${strategyComponents.join(', ')}. ${analysis.marketBias.toLowerCase()} bias with ${confidence}% confidence.`
    : analysis.summary;
  
  // Risk assessment
  const risks = [];
  if (analysis.confidenceScore < 60) risks.push('low confidence signals');
  if (!analysis.volumeSpike) risks.push('volume not confirmed');
  if (analysis.longScore === analysis.shortScore) risks.push('conflicting signals');
  risks.push('market volatility', 'news events');
  
  return {
    direction,
    entry: entry.toFixed(2),
    stopLoss: stopLoss.toFixed(2),
    takeProfit: takeProfit.toFixed(2),
    riskReward,
    positionSize,
    timing: direction === 'NO TRADE' ? "Wait for clearer signals" : "Entry conditions met",
    risks: risks.join(', '),
    strategy,
    confidence,
    indicators: {
      EMA: { EMA_8: analysis.indicators.ema.split(' / ')[0], EMA_21: analysis.indicators.ema.split(' / ')[1] },
      RSI: parseFloat(analysis.indicators.rsi.split(' ')[0]),
      MACD: analysis.macdSignal,
      VWAP: analysis.vwapPosition,
      Volume_Spike: analysis.volumeSpike,
      Pattern: patternData?.pattern || 'None detected'
    }
  };
}
