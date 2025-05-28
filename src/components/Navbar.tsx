
import NavbarLogo from './NavbarLogo';
import NavbarLogoMobile from './NavbarLogoMobile';
import NavbarPriceInfo from './NavbarPriceInfo';
import NavbarTimeframeSelector from './NavbarTimeframeSelector';
import NavbarControls from './NavbarControls';

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
        {/* Top row - Logo and Price Info */}
        <div className="flex items-center justify-between">
          <NavbarLogoMobile />
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
        <NavbarLogo />
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
