// src/components/common/Card.tsx
import React from 'react';
import { useTheme } from '../../hooks/useTheme';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  padding = 'lg',
  ...props
}) => {
  const { theme } = useTheme();

  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      className={`
        ${paddingClasses[padding]}
        rounded-2xl border transition-all duration-200
        hover:shadow-lg
        ${className}
      `}
      style={{
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.border,
        boxShadow: `0 4px 20px ${theme.colors.overlay}10`,
      }}
      {...props}
    >
      {children}
    </div>
  );
};