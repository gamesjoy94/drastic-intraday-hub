
import { RefreshCw } from 'lucide-react';

interface ConnectionErrorBannerProps {
  onRetry: () => void;
}

const ConnectionErrorBanner = ({ onRetry }: ConnectionErrorBannerProps) => {
  return (
    <div className="fixed top-0 left-0 right-0 bg-red-600 text-white px-4 py-2 text-center text-sm z-50">
      <div className="flex items-center justify-center gap-2">
        <span>Connection issue detected</span>
        <button 
          onClick={onRetry}
          className="underline hover:no-underline flex items-center gap-1"
        >
          <RefreshCw className="w-3 h-3" />
          Retry
        </button>
      </div>
    </div>
  );
};

export default ConnectionErrorBanner;
