// src/components/ui/Toggle.tsx
import React from 'react';
import { useTheme } from '../../hooks/useTheme';

interface ToggleProps {
  isActive: boolean;
  onToggle: () => void;
  labels?: { active: string; inactive: string };
}

export const Toggle: React.FC<ToggleProps> = ({
  isActive,
  onToggle,
  labels = { active: 'On', inactive: 'Off' }
}) => {
  const { theme } = useTheme();

  return (
    <div className="flex items-center gap-3">
      <span 
        className={`text-sm font-medium transition-colors duration-300 ${
          !isActive ? 'text-primary' : 'text-text-secondary'
        }`}
        style={{
          color: !isActive ? theme.colors.primary : theme.colors.textSecondary,
        }}
      >
        {labels.inactive}
      </span>
      
      <button
        type="button"
        onClick={onToggle}
        className="relative w-14 h-7 rounded-full transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary/30"
        style={{
          backgroundColor: isActive ? theme.colors.primary : theme.colors.border,
        }}
      >
        <div
          className="absolute w-6 h-6 bg-white rounded-full transition-all duration-300 shadow-md"
          style={{
            left: isActive ? 'calc(100% - 26px)' : '4px',
            top: '50%',
            transform: 'translateY(-50%)',
          }}
        />
      </button>
      
      <span 
        className={`text-sm font-medium transition-colors duration-300 ${
          isActive ? 'text-primary' : 'text-text-secondary'
        }`}
        style={{
          color: isActive ? theme.colors.primary : theme.colors.textSecondary,
        }}
      >
        {labels.active}
      </span>
    </div>
  );
};