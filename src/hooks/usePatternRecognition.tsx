import { useState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

interface PatternData {
  pattern: string;
  direction: string;
  strength: string;
  probability: number;
  support: string;
  resistance: string;
  pivot: string;
  breakoutLevel: string;
  target: string;
  description: string;
  analysis: string;
  volatility: {
    current: number;
    average: number;
    percentile: string;
    trend: string;
  };
  riskMetrics: {
    riskRewardRatio: string;
    positionSize: string;
    maxRisk: string;
    stopLossDistance: string;
    takeProfitDistance: string;
  };
  correlation: {
    goldSilverCorr: number;
    goldDxyCorr: number;
    goldSpyCorr: number;
    goldBondCorr: number;
    correlationSignal: string;
  };
  signals: {
    volumeConfirmation: string;
    priceAction: string;
    keyLevel: string;
    riskLevel: string;
    breakoutPrediction?: string;
    keyLevels?: string[];
  };
}

export const usePatternRecognition = () => {
  const [patternData, setPatternData] = useState<PatternData | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const priceHistoryRef = useRef<number[]>([]);
  const { toast } = useToast();

  const calculateVolatility = (prices: number[]) => {
    if (prices.length < 20) return { current: 0, average: 0, percentile: 'LOW', trend: 'STABLE' };
    
    // Calculate 20-period returns
    const returns = [];
    for (let i = 1; i < Math.min(prices.length, 20); i++) {
      returns.push((prices[i] - prices[i-1]) / prices[i-1]);
    }
    
    // Calculate standard deviation (volatility)
    const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / returns.length;
    const volatility = Math.sqrt(variance) * Math.sqrt(252) * 100; // Annualized volatility %
    
    // Calculate average volatility (simulated historical)
    const avgVolatility = 15 + Math.random() * 10; // Gold typically 15-25%
    
    let percentile = 'MEDIUM';
    if (volatility < avgVolatility * 0.8) percentile = 'LOW';
    else if (volatility > avgVolatility * 1.2) percentile = 'HIGH';
    
    // Volatility trend
    const recentVol = returns.slice(-5).reduce((a, b) => a + Math.abs(b), 0) / 5;
    const earlierVol = returns.slice(-10, -5).reduce((a, b) => a + Math.abs(b), 0) / 5;
    const trend = recentVol > earlierVol * 1.1 ? 'RISING' : recentVol < earlierVol * 0.9 ? 'FALLING' : 'STABLE';
    
    return {
      current: volatility,
      average: avgVolatility,
      percentile,
      trend
    };
  };

  const calculateRiskMetrics = (currentPrice: number, support: number, resistance: number, direction: string) => {
    const accountBalance = 10000; // Simulated account balance
    const riskPercentage = 2; // 2% risk per trade
    const maxRiskAmount = accountBalance * (riskPercentage / 100);
    
    const stopLoss = direction === 'BULLISH' ? support : resistance;
    const takeProfit = direction === 'BULLISH' ? resistance : support;
    
    const stopLossDistance = Math.abs(currentPrice - stopLoss);
    const takeProfitDistance = Math.abs(takeProfit - currentPrice);
    
    const riskRewardRatio = takeProfitDistance / stopLossDistance;
    const positionSize = maxRiskAmount / stopLossDistance;
    
    return {
      riskRewardRatio: riskRewardRatio.toFixed(2),
      positionSize: `${(positionSize / currentPrice).toFixed(2)} oz`,
      maxRisk: `$${maxRiskAmount.toFixed(0)}`,
      stopLossDistance: `$${stopLossDistance.toFixed(2)}`,
      takeProfitDistance: `$${takeProfitDistance.toFixed(2)}`
    };
  };

  const calculateCorrelations = () => {
    // Simulated correlations with other assets (in real implementation, these would be calculated from actual price data)
    const correlations = {
      goldSilverCorr: 0.65 + (Math.random() - 0.5) * 0.3, // Gold-Silver typically 0.5-0.8
      goldDxyCorr: -0.45 + (Math.random() - 0.5) * 0.3, // Gold-Dollar typically negative
      goldSpyCorr: 0.15 + (Math.random() - 0.5) * 0.4, // Gold-Stocks variable
      goldBondCorr: 0.25 + (Math.random() - 0.5) * 0.3, // Gold-Bonds typically positive
    };
    
    // Determine correlation signal
    let correlationSignal = 'NEUTRAL';
    if (correlations.goldDxyCorr < -0.6) {
      correlationSignal = 'BULLISH'; // Strong negative correlation with USD
    } else if (correlations.goldDxyCorr > -0.2) {
      correlationSignal = 'BEARISH'; // Weak negative correlation with USD
    }
    
    return {
      ...correlations,
      correlationSignal
    };
  };

  const analyzePatterns = async (currentPrice: number) => {
    if (isAnalyzing) return;
    
    setIsAnalyzing(true);
    
    try {
      // Update price history
      priceHistoryRef.current = [currentPrice, ...priceHistoryRef.current.slice(0, 99)];
      
      // Generate enhanced pattern data
      const mockPatternData = generateMockPatternData(currentPrice);
      setPatternData(mockPatternData);
      setLastUpdateTime(Date.now());
      
      console.log('Enhanced pattern recognition updated:', mockPatternData.pattern);
    } catch (error) {
      console.error('Pattern analysis failed:', error);
      toast({
        title: "Pattern Analysis Error",
        description: "Failed to analyze chart patterns",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateMockPatternData = (currentPrice: number): PatternData => {
    const patterns = [
      'Head & Shoulders',
      'Inverse Head & Shoulders',
      'Ascending Triangle',
      'Descending Triangle', 
      'Symmetrical Triangle',
      'Double Top',
      'Double Bottom',
      'Bull Flag',
      'Bear Flag',
      'Pennant',
      'Wedge Pattern',
      'Rectangle Pattern'
    ];
    
    const pattern = patterns[Math.floor(Math.random() * patterns.length)];
    
    // Determine direction based on pattern type
    let direction = 'NEUTRAL';
    if (pattern.includes('Bull') || pattern.includes('Ascending') || pattern.includes('Inverse') || pattern.includes('Double Bottom')) {
      direction = 'BULLISH';
    } else if (pattern.includes('Bear') || pattern.includes('Descending') || pattern.includes('Head & Shoulders') || pattern.includes('Double Top')) {
      direction = 'BEARISH';
    } else {
      direction = ['BULLISH', 'BEARISH', 'NEUTRAL'][Math.floor(Math.random() * 3)];
    }
    
    const strengths = ['STRONG', 'MODERATE', 'WEAK'];
    const strength = strengths[Math.floor(Math.random() * strengths.length)];
    
    // Adjust probability based on pattern type and strength
    let baseProbability = 60;
    if (pattern.includes('Head & Shoulders') || pattern.includes('Triangle')) baseProbability = 75;
    if (pattern.includes('Double')) baseProbability = 70;
    if (pattern.includes('Flag')) baseProbability = 65;
    
    const strengthModifier = strength === 'STRONG' ? 10 : strength === 'WEAK' ? -10 : 0;
    const probability = Math.min(Math.max(baseProbability + strengthModifier + Math.floor(Math.random() * 15) - 7, 45), 90);
    
    const support = (currentPrice * (0.992 - Math.random() * 0.015)).toFixed(2);
    const resistance = (currentPrice * (1.008 + Math.random() * 0.015)).toFixed(2);
    const pivot = ((parseFloat(support) + parseFloat(resistance) + currentPrice) / 3).toFixed(2);
    
    const breakoutLevel = direction === 'BULLISH' ? resistance : support;
    const targetMultiplier = pattern.includes('Head & Shoulders') ? 0.025 : 0.015;
    const target = direction === 'BULLISH' 
      ? (parseFloat(breakoutLevel) * (1 + targetMultiplier)).toFixed(2)
      : (parseFloat(breakoutLevel) * (1 - targetMultiplier)).toFixed(2);
    
    // Calculate enhanced metrics
    const volatility = calculateVolatility(priceHistoryRef.current);
    const riskMetrics = calculateRiskMetrics(currentPrice, parseFloat(support), parseFloat(resistance), direction);
    const correlation = calculateCorrelations();
    
    // Generate key levels
    const keyLevels = [];
    for (let i = 0; i < 3; i++) {
      const level = currentPrice * (0.995 + Math.random() * 0.01);
      keyLevels.push(`$${level.toFixed(2)}`);
    }
    
    // Generate breakout prediction
    const breakoutPredictions = {
      'Head & Shoulders': 'Bearish breakdown below neckline expected',
      'Inverse Head & Shoulders': 'Bullish breakout above neckline expected',
      'Ascending Triangle': 'Bullish breakout above resistance expected',
      'Descending Triangle': 'Bearish breakdown below support expected',
      'Double Top': 'Bearish breakdown below support expected',
      'Double Bottom': 'Bullish breakout above resistance expected',
      'Bull Flag': 'Continuation of uptrend expected',
      'Bear Flag': 'Continuation of downtrend expected'
    };
    
    const breakoutPrediction = breakoutPredictions[pattern as keyof typeof breakoutPredictions] || 
      `${direction.toLowerCase()} breakout expected`;
    
    return {
      pattern,
      direction,
      strength,
      probability,
      support,
      resistance,
      pivot,
      breakoutLevel,
      target,
      description: `${pattern} detected with ${direction.toLowerCase()} bias`,
      analysis: `${pattern} shows ${strength.toLowerCase()} ${direction.toLowerCase()} potential. ${breakoutPrediction}. Risk/Reward: ${riskMetrics.riskRewardRatio}. Current volatility: ${volatility.current.toFixed(1)}% (${volatility.percentile}). Position size recommended: ${riskMetrics.positionSize}.`,
      volatility,
      riskMetrics,
      correlation,
      signals: {
        volumeConfirmation: Math.random() > 0.4 ? 'CONFIRMED' : 'PENDING',
        priceAction: direction,
        keyLevel: `$${breakoutLevel}`,
        riskLevel: strength === 'STRONG' ? 'LOW' : strength === 'MODERATE' ? 'MEDIUM' : 'HIGH',
        breakoutPrediction,
        keyLevels
      }
    };
  };

  const startContinuousAnalysis = (currentPrice: number) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    // Initial analysis
    analyzePatterns(currentPrice);
    
    // Update every 30 seconds
    intervalRef.current = setInterval(() => {
      analyzePatterns(currentPrice);
    }, 30000);
  };

  const stopContinuousAnalysis = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      stopContinuousAnalysis();
    };
  }, []);

  return {
    patternData,
    isAnalyzing,
    lastUpdateTime,
    analyzePatterns,
    startContinuousAnalysis,
    stopContinuousAnalysis
  };
};
