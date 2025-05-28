
import { Zap } from 'lucide-react';

const NavbarLogo = () => {
  return (
    <div className="flex items-center gap-2 lg:gap-3 min-w-0 flex-shrink-0">
      <div className="flex items-center gap-2 lg:gap-3">
        <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg p-2 lg:p-3 shadow-lg flex-shrink-0">
          <div className="text-slate-900 font-bold text-sm lg:text-lg leading-none">
            ED
          </div>
        </div>
        <div className="flex flex-col min-w-0">
          <h1 className="text-base lg:text-2xl font-bold text-yellow-400 truncate">
            E.DRASTIC pro
          </h1>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">
              by E.drastic
            </span>
            <div className="hidden lg:flex items-center gap-1 text-xs text-yellow-300 bg-yellow-400/10 px-2 py-1 rounded-full border border-yellow-400/20">
              <Zap className="w-3 h-3" />
              <span className="font-medium">Precision. Profit. Performance.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavbarLogo;
