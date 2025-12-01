// src/components/common/Button.tsx
import React from 'react';
import { Loader2 } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  isLoading?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  disabled,
  className = '',
  ...props
}) => {
  const { theme } = useTheme();
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const variantClasses = {
    primary: `bg-indigo-600 hover:bg-indigo-700 text-white border border-indigo-600`,
    secondary: `bg-transparent text-indigo-600 hover:bg-indigo-50 border border-indigo-600`,
    ghost: `bg-transparent text-gray-600 hover:bg-gray-100 border border-transparent`,
  };

  return (
    <button
      className={`
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${fullWidth ? 'w-full' : ''}
        rounded-lg font-medium transition-all duration-200
        flex items-center justify-center gap-2
        disabled:opacity-50 disabled:cursor-not-allowed
        active:scale-[0.98]
        ${className}
      `}
      disabled={disabled || isLoading}
      style={{
        backgroundColor: variant === 'primary' ? theme.colors.primary : 
                       variant === 'secondary' ? 'transparent' : 'transparent',
        borderColor: variant === 'primary' ? theme.colors.primary : 
                    variant === 'secondary' ? theme.colors.primary : 'transparent',
        color: variant === 'primary' ? 'white' : 
               variant === 'secondary' ? theme.colors.primary : theme.colors.textSecondary,
      }}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading...
        </>
      ) : (
        children
      )}
    </button>
  );
};