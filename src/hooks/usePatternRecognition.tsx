
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
      'Ascending Triangle',
      'Descending Triangle', 
      'Double Top',
      'Double Bottom',
      'Flag Pattern',
      'Consolidation',
      'Bullish Flag',
      'Bearish Flag'
    ];
    
    const directions = ['BULLISH', 'BEARISH', 'NEUTRAL'];
    const strengths = ['STRONG', 'MODERATE', 'WEAK'];
    
    const pattern = patterns[Math.floor(Math.random() * patterns.length)];
    const direction = pattern.includes('Bullish') || pattern.includes('Ascending') || pattern.includes('Double Bottom') 
      ? 'BULLISH' 
      : pattern.includes('Bearish') || pattern.includes('Descending') || pattern.includes('Double Top')
      ? 'BEARISH'
      : directions[Math.floor(Math.random() * directions.length)];
    
    const strength = strengths[Math.floor(Math.random() * strengths.length)];
    const probability = Math.floor(Math.random() * 30) + 55; // 55-85%
    
    const support = (currentPrice * (0.995 - Math.random() * 0.01)).toFixed(2);
    const resistance = (currentPrice * (1.005 + Math.random() * 0.01)).toFixed(2);
    const pivot = ((parseFloat(support) + parseFloat(resistance) + currentPrice) / 3).toFixed(2);
    
    const breakoutLevel = direction === 'BULLISH' ? resistance : support;
    const target = direction === 'BULLISH' 
      ? (parseFloat(breakoutLevel) * 1.015).toFixed(2)
      : (parseFloat(breakoutLevel) * 0.985).toFixed(2);
    
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
      analysis: `Pattern shows ${strength.toLowerCase()} ${direction.toLowerCase()} potential. Key level at $${breakoutLevel} with target around $${target}.`,
      signals: {
        volumeConfirmation: Math.random() > 0.5 ? 'CONFIRMED' : 'PENDING',
        priceAction: direction,
        keyLevel: `$${breakoutLevel}`,
        riskLevel: strength === 'STRONG' ? 'LOW' : strength === 'MODERATE' ? 'MEDIUM' : 'HIGH'
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
