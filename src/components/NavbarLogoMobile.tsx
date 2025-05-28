
import { Zap } from 'lucide-react';

const NavbarLogoMobile = () => {
  return (
    <div className="flex items-center gap-2 min-w-0 flex-shrink-0">
      <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg p-1.5 shadow-lg">
        <div className="text-slate-900 font-bold text-xs leading-none">
          ED
        </div>
      </div>
      <div className="flex flex-col min-w-0">
        <h1 className="text-sm font-bold text-yellow-400 truncate">
          E.DRASTIC pro
        </h1>
        <span className="text-xs text-slate-400 truncate">
          by E.drastic
        </span>
      </div>
    </div>
  );
};

export default NavbarLogoMobile;
