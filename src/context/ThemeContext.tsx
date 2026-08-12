'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemePreference } from '../types';

interface ThemeContextType {
  theme: 'light' | 'dark';
  preference: ThemePreference;
  setPreference: (pref: ThemePreference) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>('light');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // Read stored preference or default to light mode (White & Red theme)
    const stored = localStorage.getItem('trip2trip_theme_pref') as ThemePreference | null;
    if (stored) {
      setPreferenceState(stored);
    } else {
      setPreferenceState('light');
    }
  }, []);

  useEffect(() => {
    // Resolve preference
    let activeTheme: 'light' | 'dark' = 'light';
    if (preference === 'system') {
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      activeTheme = prefersDark ? 'dark' : 'light';
    } else {
      activeTheme = preference;
    }

    setResolvedTheme(activeTheme);

    const root = document.documentElement;
    if (activeTheme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  }, [preference]);

  const setPreference = (pref: ThemePreference) => {
    setPreferenceState(pref);
    localStorage.setItem('trip2trip_theme_pref', pref);
  };

  const toggleTheme = () => {
    const nextTheme = resolvedTheme === 'dark' ? 'light' : 'dark';
    setPreference(nextTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme: resolvedTheme, preference, setPreference, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
