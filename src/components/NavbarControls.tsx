
import { Clock, Zap } from 'lucide-react';

interface NavbarControlsProps {
  isMobile?: boolean;
}

const NavbarControls = ({ isMobile = false }: NavbarControlsProps) => {
  const currentTime = new Date().toLocaleTimeString();

  if (isMobile) {
    return (
      <div className="flex items-center gap-1 flex-shrink-0">
        <div className="flex items-center gap-1 text-xs text-yellow-300 bg-yellow-400/10 px-2 py-1 rounded-full border border-yellow-400/20">
          <Zap className="w-3 h-3" />
          <span className="font-medium">P³</span>
        </div>
        
        <div className="flex items-center gap-1 bg-green-500/10 px-2 py-1 rounded-lg border border-green-500/20">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-green-400 font-medium">Live</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 lg:gap-3 flex-shrink-0">
      {/* Tablet motto - Compact */}
      <div className="lg:hidden flex items-center gap-1 text-xs text-yellow-300 bg-yellow-400/10 px-2 py-1 rounded-full border border-yellow-400/20">
        <Zap className="w-3 h-3" />
        <span className="font-medium">P³</span>
      </div>
      
      {/* Time Display */}
      <div className="hidden md:flex items-center gap-2 text-slate-400 bg-slate-800/50 px-2 lg:px-3 py-2 rounded-lg border border-slate-600">
        <Clock className="w-4 h-4" />
        <span className="text-xs lg:text-sm font-medium">{currentTime}</span>
      </div>
      
      {/* Live Market Indicator */}
      <div className="flex items-center gap-1 lg:gap-2 bg-green-500/10 px-2 lg:px-3 py-2 rounded-lg border border-green-500/20">
        <div className="w-2 h-2 lg:w-3 lg:h-3 bg-green-500 rounded-full animate-pulse"></div>
        <span className="text-xs lg:text-sm text-green-400 font-medium hidden md:inline">
          Live
        </span>
      </div>
    </div>
  );
};

export default NavbarControls;
