
import { useEffect, useState } from 'react';
import { Play, Pause, RefreshCw } from 'lucide-react';
import { usePatternRecognition } from '@/hooks/usePatternRecognition';
import PatternRecognition from './PatternRecognition';

interface LivePatternRecognitionProps {
  currentPrice: number;
}

const LivePatternRecognition = ({ currentPrice }: LivePatternRecognitionProps) => {
  const [isLive, setIsLive] = useState(false);
  const {
    patternData,
    isAnalyzing,
    lastUpdateTime,
    analyzePatterns,
    startContinuousAnalysis,
    stopContinuousAnalysis
  } = usePatternRecognition();

  const handleToggleLive = () => {
    if (isLive) {
      stopContinuousAnalysis();
      setIsLive(false);
    } else {
      startContinuousAnalysis(currentPrice);
      setIsLive(true);
    }
  };

  const handleManualAnalysis = () => {
    analyzePatterns(currentPrice);
  };

  useEffect(() => {
    if (isLive && currentPrice > 0) {
      startContinuousAnalysis(currentPrice);
    }
  }, [currentPrice, isLive]);

  const formatLastUpdate = () => {
    if (!lastUpdateTime) return 'Never';
    const now = Date.now();
    const diff = Math.floor((now - lastUpdateTime) / 1000);
    if (diff < 60) return `${diff}s ago`;
    return `${Math.floor(diff / 60)}m ago`;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Pattern Controls */}
      <div className="p-4 border-b border-slate-700 bg-slate-800">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-slate-200">Live Pattern Recognition</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={handleManualAnalysis}
              disabled={isAnalyzing}
              className="p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg transition-colors"
              title="Manual Analysis"
            >
              <RefreshCw className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={handleToggleLive}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                isLive 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {isLive ? (
                <>
                  <Pause className="w-4 h-4" />
                  <span className="text-sm">Stop</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span className="text-sm">Start</span>
                </>
              )}
            </button>
          </div>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-400' : 'bg-gray-400'}`}></div>
            <span className="text-slate-400">
              {isLive ? 'Live Analysis' : 'Stopped'}
            </span>
          </div>
          <span className="text-slate-500">
            Last update: {formatLastUpdate()}
          </span>
        </div>
      </div>

      {/* Pattern Display */}
      <div className="flex-1 overflow-hidden">
        <PatternRecognition patternData={patternData} />
      </div>
    </div>
  );
};

export default LivePatternRecognition;
