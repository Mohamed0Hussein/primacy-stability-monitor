// src/theme/ThemeContext.tsx
import { createContext, useContext } from 'react';
import type { Theme, ThemeName } from '../themes/themes';

interface ThemeContextType {
  theme: Theme;
  themeName: ThemeName;
  toggleTheme: () => void;
  setTheme: (themeName: ThemeName) => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Custom hook to use theme - must be in a separate file from the Provider
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}