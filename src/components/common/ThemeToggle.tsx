// src/components/common/ThemeToggle.tsx
import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

interface ThemeToggleProps {
  variant?: 'default' | 'minimal' | 'segmented';
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  variant = 'default',
  className = '',
}) => {
  const { theme, themeName, setTheme } = useTheme();

  const variants = {
    default: (
      <div 
        className={`flex gap-1 p-1 rounded-xl backdrop-blur-sm border ${className}`}
        style={{
          backgroundColor: `${theme.colors.surface}80`,
          borderColor: theme.colors.border,
        }}
      >
        <button
          onClick={() => setTheme('light')}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-sm font-medium transition-all ${
            themeName === 'light'
              ? 'bg-indigo-500 text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
          style={{
            backgroundColor: themeName === 'light' ? theme.colors.primary : 'transparent',
            color: themeName === 'light' ? 'white' : theme.colors.textSecondary,
          }}
        >
          <Sun className="w-3.5 h-3.5" />
          Light
        </button>
        <button
          onClick={() => setTheme('dark')}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-sm font-medium transition-all ${
            themeName === 'dark'
              ? 'bg-indigo-500 text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
          style={{
            backgroundColor: themeName === 'dark' ? theme.colors.primary : 'transparent',
            color: themeName === 'dark' ? 'white' : theme.colors.textSecondary,
          }}
        >
          <Moon className="w-3.5 h-3.5" />
          Dark
        </button>
      </div>
    ),
    minimal: (
      <div 
        className={`flex items-center gap-1 p-1 rounded-full backdrop-blur-sm border ${className}`}
        style={{
          backgroundColor: `${theme.colors.surface}80`,
          borderColor: theme.colors.border,
        }}
      >
        <button
          onClick={() => setTheme('light')}
          className={`p-1.5 rounded-full transition-all ${
            themeName === 'light'
              ? 'bg-indigo-500 text-white'
              : 'text-gray-400 hover:text-gray-600'
          }`}
          style={{
            backgroundColor: themeName === 'light' ? theme.colors.primary : 'transparent',
          }}
        >
          <Sun className="w-4 h-4" />
        </button>
        <button
          onClick={() => setTheme('dark')}
          className={`p-1.5 rounded-full transition-all ${
            themeName === 'dark'
              ? 'bg-indigo-500 text-white'
              : 'text-gray-400 hover:text-gray-600'
          }`}
          style={{
            backgroundColor: themeName === 'dark' ? theme.colors.primary : 'transparent',
          }}
        >
          <Moon className="w-4 h-4" />
        </button>
      </div>
    ),
    segmented: (
      <div 
        className={`flex p-1 rounded-lg backdrop-blur-sm bg-gray-100 border ${className}`}
        style={{
          borderColor: theme.colors.border,
        }}
      >
        <button
          onClick={() => setTheme('light')}
          className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 text-sm font-medium transition-all ${
            themeName === 'light'
              ? 'bg-white shadow-sm'
              : 'text-gray-600'
          }`}
          style={{
            backgroundColor: themeName === 'light' ? theme.colors.background : 'transparent',
            color: themeName === 'light' ? theme.colors.text : theme.colors.textSecondary,
          }}
        >
          <Sun className="w-3.5 h-3.5" />
          Light
        </button>
        <button
          onClick={() => setTheme('dark')}
          className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 text-sm font-medium transition-all ${
            themeName === 'dark'
              ? 'bg-white shadow-sm'
              : 'text-gray-600'
          }`}
          style={{
            backgroundColor: themeName === 'dark' ? theme.colors.background : 'transparent',
            color: themeName === 'dark' ? theme.colors.text : theme.colors.textSecondary,
          }}
        >
          <Moon className="w-3.5 h-3.5" />
          Dark
        </button>
      </div>
    ),
  };

  return (
    <div className="fixed top-6 right-6 z-50">
      {variants[variant]}
    </div>
  );
};