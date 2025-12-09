// src/theme/ThemeProvider.tsx
import React, { useState, useEffect } from 'react';
import { ThemeContext } from '../hooks/useTheme';
import { themes } from '../themes/themes';
import type { ThemeName } from '../themes/themes';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export default function ThemeProvider({ children }: ThemeProviderProps) {
  const [themeName, setThemeName] = useState<ThemeName>(() => {
    if (typeof window === 'undefined') return 'light';
    
    const saved = localStorage.getItem('theme') as ThemeName;
    if (saved && (saved === 'light' || saved === 'dark')) {
      return saved;
    }
    
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  });

  useEffect(() => {
    localStorage.setItem('theme', themeName);
    document.documentElement.className = themeName;
  }, [themeName]);

  const toggleTheme = () => {
    setThemeName(prev => prev === 'light' ? 'dark' : 'light');
  };

  const setTheme = (name : ThemeName) => {
    setThemeName(name)
  }
  
  return (
    <ThemeContext.Provider value={{ 
      theme: themes[themeName], 
      themeName, 
      toggleTheme, 
      setTheme,
    }}>
      {children}
    </ThemeContext.Provider>
  );
}