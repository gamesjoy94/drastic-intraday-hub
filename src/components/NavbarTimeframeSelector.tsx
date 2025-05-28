
interface NavbarTimeframeSelectorProps {
  selectedTimeframe: string;
  onTimeframeChange: (newTimeframe: string) => void;
  isMobile?: boolean;
}

const NavbarTimeframeSelector = ({ selectedTimeframe, onTimeframeChange, isMobile = false }: NavbarTimeframeSelectorProps) => {
  const timeframes = [
    { value: '1min', label: '1m' },
    { value: '5min', label: '5m' },
    { value: '15min', label: '15m' },
    { value: '30min', label: '30m' },
    { value: '1h', label: '1h' },
    { value: '4h', label: '4h' },
    { value: '1D', label: '1D' }
  ];

  if (isMobile) {
    return (
      <div className="bg-slate-800 rounded-lg border border-yellow-400/30 p-0.5 shadow-lg flex-1 min-w-0">
        <div className="flex items-center gap-0.5 overflow-x-auto">
          {timeframes.map((tf) => (
            <button
              key={tf.value}
              onClick={() => onTimeframeChange(tf.value)}
              className={`px-1.5 py-1 text-xs font-semibold rounded-md transition-all duration-200 min-w-[28px] flex-shrink-0 ${
                selectedTimeframe === tf.value
                  ? 'bg-yellow-400 text-slate-900 shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/70'
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-lg border border-yellow-400/30 p-1 shadow-lg">
      <div className="flex items-center gap-0.5">
        {timeframes.map((tf) => (
          <button
            key={tf.value}
            onClick={() => onTimeframeChange(tf.value)}
            className={`px-2 py-1.5 text-xs font-semibold rounded-md transition-all duration-200 min-w-[32px] ${
              selectedTimeframe === tf.value
                ? 'bg-yellow-400 text-slate-900 shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/70'
            }`}
          >
            {tf.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default NavbarTimeframeSelector;
