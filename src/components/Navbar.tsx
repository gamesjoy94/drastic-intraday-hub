
import { Link } from 'react-router-dom';
import NavbarLogo from './NavbarLogo';
import NavbarLogoMobile from './NavbarLogoMobile';
import NavbarPriceInfo from './NavbarPriceInfo';
import NavbarTimeframeSelector from './NavbarTimeframeSelector';
import NavbarControls from './NavbarControls';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';

interface NavbarProps {
  selectedSymbol: string;
  currentPrice: number;
  priceChange: number;
  selectedTimeframe: string;
  onTimeframeChange: (newTimeframe: string) => void;
}

const Navbar = ({ 
  selectedSymbol, 
  currentPrice, 
  priceChange, 
  selectedTimeframe, 
  onTimeframeChange 
}: NavbarProps) => {
  return (
    <nav className="bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-700 px-2 sm:px-3 lg:px-6 py-2 sm:py-3 lg:py-4 shadow-lg">
      {/* Mobile Layout - Stacked */}
      <div className="flex flex-col gap-2 sm:hidden">
        {/* Top row - Logo, Home Button and Price Info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <NavbarLogoMobile />
            <Link to="/">
              <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                <Home className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          <NavbarPriceInfo 
            selectedSymbol={selectedSymbol}
            currentPrice={currentPrice}
            priceChange={priceChange}
            isMobile={true}
          />
        </div>

        {/* Bottom row - Timeframe and Controls */}
        <div className="flex items-center justify-between gap-2">
          <NavbarTimeframeSelector
            selectedTimeframe={selectedTimeframe}
            onTimeframeChange={onTimeframeChange}
            isMobile={true}
          />
          <NavbarControls isMobile={true} />
        </div>
      </div>

      {/* Desktop/Tablet Layout - Single Row */}
      <div className="hidden sm:flex items-center justify-between gap-2 lg:gap-4">
        <div className="flex items-center gap-4">
          <NavbarLogo />
          <Link to="/">
            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button>
          </Link>
        </div>
        <NavbarPriceInfo 
          selectedSymbol={selectedSymbol}
          currentPrice={currentPrice}
          priceChange={priceChange}
        />
        
        {/* Right Section - Controls */}
        <div className="flex items-center gap-2 lg:gap-3 flex-shrink-0">
          <NavbarTimeframeSelector
            selectedTimeframe={selectedTimeframe}
            onTimeframeChange={onTimeframeChange}
          />
          <NavbarControls />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
