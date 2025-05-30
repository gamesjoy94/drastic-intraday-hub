
import { SmartMomentumAnalysis, PatternData } from '../analyze-market/types.ts';

export function generateEurUsdFallbackTradePlan(
  analysis: SmartMomentumAnalysis, 
  currentPrice: number, 
  atr: number,
  patternData?: PatternData
) {
  console.log('Generating EUR/USD AI-Enhanced Trend Reversal fallback trade plan');
  
  const atrValue = atr || currentPrice * 0.001; // Smaller ATR for forex
  
  let direction = 'NO TRADE';
  let confidence = analysis.confidenceScore;
  
  // AI-Enhanced Trend Reversal decision logic
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
  
  // Pattern confirmation for trend reversal
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
  
  // Calculate EUR/USD specific levels
  let entry = currentPrice;
  let stopLoss: number;
  let takeProfit: number;
  let riskReward = "1:2.0";
  
  if (direction === 'LONG') {
    stopLoss = currentPrice - (atrValue * 2.0);
    takeProfit = currentPrice + (atrValue * 4.0);
    riskReward = "1:2.0";
    
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
  
  // Conservative position sizing for forex
  let positionSize = "0%";
  if (direction !== 'NO TRADE') {
    if (confidence >= 80) positionSize = "1-2%";
    else if (confidence >= 65) positionSize = "0.5-1%";
    else positionSize = "0.25-0.5%";
  }
  
  // Generate strategy explanation
  const strategyComponents = [];
  
  if (analysis.emaCrossover !== 'NONE') {
    strategyComponents.push(`${analysis.emaCrossover.replace('_', ' ')} signal`);
  }
  
  if (analysis.macdSignal !== 'NEUTRAL') {
    strategyComponents.push(`${analysis.macdSignal.toLowerCase()} MACD convergence`);
  }
  
  if (analysis.rsiDirection !== 'NEUTRAL') {
    strategyComponents.push(`RSI ${analysis.rsiDirection.toLowerCase()} momentum`);
  }
  
  if (analysis.vwapPosition !== 'NEUTRAL') {
    strategyComponents.push(`price ${analysis.vwapPosition.toLowerCase()} VWAP`);
  }
  
  if (analysis.volumeSpike) {
    strategyComponents.push('volume confirmation');
  }
  
  const strategy = strategyComponents.length > 0 
    ? `AI-Enhanced Trend Reversal analysis shows ${strategyComponents.join(', ')}. Multiple indicator convergence suggests ${analysis.marketBias.toLowerCase()} bias with ${confidence}% confidence.`
    : `${analysis.summary} Monitoring for trend reversal signals.`;
  
  // EUR/USD specific risks
  const risks = [];
  if (analysis.confidenceScore < 65) risks.push('low signal confidence');
  if (!analysis.volumeSpike) risks.push('volume not confirmed');
  risks.push('ECB/Fed policy divergence', 'USD strength/weakness', 'European economic data');
  
  return {
    direction,
    entry: entry.toFixed(5),
    stopLoss: stopLoss.toFixed(5),
    takeProfit: takeProfit.toFixed(5),
    riskReward,
    positionSize,
    timing: direction === 'NO TRADE' ? "Wait for trend reversal signals" : "Multi-indicator convergence detected",
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
