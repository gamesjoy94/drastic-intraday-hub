
import { Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import Sidebar from './Sidebar';

interface MobileSidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  selectedSymbol: string;
  setSelectedSymbol: (symbol: string) => void;
  selectedTimeframe: string;
  setSelectedTimeframe: (timeframe: string) => void;
}

const MobileSidebar = ({ 
  sidebarOpen, 
  setSidebarOpen, 
  selectedSymbol, 
  setSelectedSymbol, 
  selectedTimeframe, 
  setSelectedTimeframe 
}: MobileSidebarProps) => {
  return (
    <>
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetTrigger asChild>
          <button className="fixed top-4 left-4 z-50 p-2 bg-slate-800 rounded-md border border-slate-700 md:hidden">
            <Menu className="w-5 h-5" />
          </button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80 p-0 bg-slate-800 border-slate-700">
          <Sidebar 
            selectedSymbol={selectedSymbol}
            setSelectedSymbol={setSelectedSymbol}
            selectedTimeframe={selectedTimeframe}
            setSelectedTimeframe={setSelectedTimeframe}
            onClose={() => setSidebarOpen(false)}
          />
        </SheetContent>
      </Sheet>
    </>
  );
};

export default MobileSidebar;
