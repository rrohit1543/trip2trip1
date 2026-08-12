'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemePreference } from '../types';

interface ThemeContextType {
  theme: 'light';
  preference: ThemePreference;
  setPreference: (pref: ThemePreference) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>('light');

  useEffect(() => {
    // Force clean light mode (Pure White & Red theme)
    localStorage.setItem('TripMandi_theme_pref', 'light');
    const root = document.documentElement;
    root.classList.remove('dark');
    root.classList.add('light');
  }, []);

  const setPreference = (pref: ThemePreference) => {
    setPreferenceState('light');
    localStorage.setItem('TripMandi_theme_pref', 'light');
    const root = document.documentElement;
    root.classList.remove('dark');
    root.classList.add('light');
  };

  const toggleTheme = () => {
    setPreference('light');
  };

  return (
    <ThemeContext.Provider value={{ theme: 'light', preference: 'light', setPreference, toggleTheme }}>
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
