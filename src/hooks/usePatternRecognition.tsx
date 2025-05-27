
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
  signals: {
    volumeConfirmation: string;
    priceAction: string;
    keyLevel: string;
    riskLevel: string;
  };
}

export const usePatternRecognition = () => {
  const [patternData, setPatternData] = useState<PatternData | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const analyzePatterns = async (currentPrice: number) => {
    if (isAnalyzing) return;
    
    setIsAnalyzing(true);
    
    try {
      // Generate mock pattern data based on current price
      const mockPatternData = generateMockPatternData(currentPrice);
      setPatternData(mockPatternData);
      setLastUpdateTime(Date.now());
      
      console.log('Pattern recognition updated:', mockPatternData.pattern);
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
      analysis: `${pattern} shows ${strength.toLowerCase()} ${direction.toLowerCase()} potential. ${breakoutPrediction}. Key level at $${breakoutLevel} with target around $${target}. Pattern reliability: ${probability}%.`,
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
