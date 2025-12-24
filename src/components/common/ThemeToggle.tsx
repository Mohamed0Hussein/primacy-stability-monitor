// src/components/common/ThemeToggle.tsx
import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

interface ThemeToggleProps {
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className = '',
}) => {
  const { theme, themeName, setTheme } = useTheme();

  const toggle = () => {
    setTheme(themeName === 'light' ? 'dark' : 'light');
  };

  return (
    <button
      onClick={toggle}
      className={`p-2 rounded-full transition-all duration-300 cursor-pointer ${className}`}
      style={{
        color: themeName === 'light' ? theme.colors.text : theme.colors.primary,
        backgroundColor: `${theme.colors.surface}80`,
        border: `1px solid ${theme.colors.border}`,
      }}
      title={`Switch to ${themeName === 'light' ? 'dark' : 'light'} mode`}
    >
      {themeName === 'dark' ? (
        <Moon className="w-5 h-5" />
      ) : (
        <Sun className="w-5 h-5" />
      )}
    </button>
  );
};
