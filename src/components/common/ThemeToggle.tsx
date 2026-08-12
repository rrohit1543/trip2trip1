'use client';

import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, Monitor } from 'lucide-react';

export default function ThemeToggle() {
  const { theme, preference, setPreference, toggleTheme } = useTheme();

  return (
    <div className="flex items-center gap-1 bg-neutral-900/10 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 p-1 rounded-2xl">
      <button
        onClick={() => setPreference('light')}
        title="Light Mode"
        className={`p-1.5 rounded-xl transition ${
          preference === 'light'
            ? 'bg-white text-red-600 shadow-sm border border-neutral-200 font-bold'
            : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
        }`}
      >
        <Sun className="w-4 h-4" />
      </button>

      <button
        onClick={() => setPreference('dark')}
        title="Dark Mode"
        className={`p-1.5 rounded-xl transition ${
          preference === 'dark'
            ? 'bg-neutral-900 text-red-500 shadow-sm border border-neutral-800 font-bold'
            : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
        }`}
      >
        <Moon className="w-4 h-4" />
      </button>

      <button
        onClick={() => setPreference('system')}
        title="System Auto Preference"
        className={`p-1.5 rounded-xl transition ${
          preference === 'system'
            ? 'bg-red-600/20 text-red-500 border border-red-600/40 font-bold'
            : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
        }`}
      >
        <Monitor className="w-4 h-4" />
      </button>
    </div>
  );
}
