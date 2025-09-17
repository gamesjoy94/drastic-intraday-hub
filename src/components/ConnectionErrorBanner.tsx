
import { RefreshCw } from 'lucide-react';

interface ConnectionErrorBannerProps {
  onRetry: () => void;
}

const ConnectionErrorBanner = ({ onRetry }: ConnectionErrorBannerProps) => {
  return (
    <div className="fixed top-0 left-0 right-0 bg-destructive/90 backdrop-blur-sm text-destructive-foreground px-4 py-2 text-center text-sm z-50 border-b border-destructive">
      <div className="flex items-center justify-center gap-2">
        <span>Connection issue detected</span>
        <button 
          onClick={onRetry}
          className="underline hover:no-underline flex items-center gap-1 ml-2 px-2 py-1 bg-destructive rounded hover:bg-destructive/80 transition-colors"
        >
          <RefreshCw className="w-3 h-3" />
          Retry
        </button>
      </div>
    </div>
  );
};

export default ConnectionErrorBanner;
