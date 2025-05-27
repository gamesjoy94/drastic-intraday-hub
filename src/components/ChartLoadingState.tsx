
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ChartLoadingStateProps {
  isLoading: boolean;
  chartError: boolean;
  onRetryChart: () => void;
}

const ChartLoadingState = ({ isLoading, chartError, onRetryChart }: ChartLoadingStateProps) => {
  if (isLoading && !chartError) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
        <div className="text-center p-4">
          <div className="w-8 h-8 lg:w-12 lg:h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-slate-400 text-sm lg:text-base">Loading XAUUSD Chart...</div>
          <div className="text-xs text-slate-500 mt-2">Gold/USD Live Trading Chart</div>
        </div>
      </div>
    );
  }

  if (chartError) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
        <div className="text-center p-4">
          <AlertCircle className="w-8 h-8 lg:w-12 lg:h-12 text-red-400 mx-auto mb-4" />
          <div className="text-slate-400 mb-2 text-sm lg:text-base">Failed to load XAUUSD chart</div>
          <div className="text-xs text-slate-500 mb-4">Chart connection interrupted</div>
          <button
            onClick={onRetryChart}
            className="flex items-center gap-2 mx-auto px-3 py-2 lg:px-4 lg:py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg transition-colors text-sm lg:text-base"
          >
            <RefreshCw className="w-4 h-4" />
            Retry Chart
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default ChartLoadingState;
