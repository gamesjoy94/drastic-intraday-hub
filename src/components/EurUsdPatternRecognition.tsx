
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface EurUsdPatternRecognitionProps {
  currentPrice: number;
}

const EurUsdPatternRecognition = ({ currentPrice }: EurUsdPatternRecognitionProps) => {
  return (
    <Card className="bg-slate-800 border-slate-700 m-4">
      <CardHeader>
        <CardTitle className="text-white text-sm flex items-center gap-2">
          📈 EUR/USD Pattern Analysis
          <Badge variant="outline" className="text-xs">AI Enhanced</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">Current Price:</span>
            <span className="text-white font-mono">${currentPrice.toFixed(5)}</span>
          </div>
          
          <div className="space-y-1">
            <h4 className="text-slate-300 text-xs font-medium">Key Levels:</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="text-center">
                <div className="text-red-400 font-mono">1.0850</div>
                <div className="text-slate-500">Resistance</div>
              </div>
              <div className="text-center">
                <div className="text-green-400 font-mono">1.0780</div>
                <div className="text-slate-500">Support</div>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <h4 className="text-slate-300 text-xs font-medium">Strategy Signals:</h4>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">EMA20/50 Cross:</span>
                <Badge variant="secondary" className="text-xs">Monitoring</Badge>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">MACD Divergence:</span>
                <Badge variant="secondary" className="text-xs">Neutral</Badge>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">ADX Strength:</span>
                <Badge variant="secondary" className="text-xs">Weak</Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-700">
          <p className="text-slate-400 text-xs">
            AI-Enhanced Trend Reversal strategy monitoring EMA crossovers, MACD signals, and ADX strength for optimal entry points.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default EurUsdPatternRecognition;
