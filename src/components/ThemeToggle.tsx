
import { Moon, Sun } from 'lucide-react';
import { useState } from 'react';

const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(true);

  const toggleTheme = () => {
    setIsDark(!isDark);
    // Apply theme to document
    if (isDark) {
      document.documentElement.classList.remove('dark');
      document.body.className = 'bg-white text-slate-900';
    } else {
      document.documentElement.classList.add('dark');
      document.body.className = 'bg-slate-900 text-white';
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-600 hover:bg-slate-700/50 transition-colors"
      title={`Switch to ${isDark ? 'light' : 'dark'} theme`}
    >
      {isDark ? (
        <>
          <Sun className="w-4 h-4 text-yellow-400" />
          <span className="text-xs lg:text-sm text-slate-300 hidden sm:inline">Light</span>
        </>
      ) : (
        <>
          <Moon className="w-4 h-4 text-slate-600" />
          <span className="text-xs lg:text-sm text-slate-700 hidden sm:inline">Dark</span>
        </>
      )}
    </button>
  );
};

export default ThemeToggle;
