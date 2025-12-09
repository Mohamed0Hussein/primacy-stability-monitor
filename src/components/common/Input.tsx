// src/components/common/Input.tsx
import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User, Phone } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: 'mail' | 'lock' | 'user' | 'phone';
  fullWidth?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  type,
  icon,
  fullWidth = true,
  className = '',
  ...props
}) => {
  const { theme } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';

  const IconComponent = {
    mail: Mail,
    lock: Lock,
    user: User,
    phone: Phone
  }[icon || 'mail'];

  return (
    <div className={`space-y-1.5 ${fullWidth ? 'w-full' : ''}`}>
      {label && (
        <label 
          className="block text-sm font-medium"
          style={{ color: theme.colors.text }}
        >
          {label}
        </label>
      )}
      
      <div className="relative">
        <input
          type={isPassword && showPassword ? 'text' : type}
          className={`
            w-full px-3 py-2.5 rounded-lg border text-sm
            placeholder-gray-400 focus:outline-none focus:ring-2
            transition-all duration-200
            ${error ? 'border-red-500 focus:ring-red-500/20' : 'border-gray-300 focus:ring-indigo-500/20'}
            ${className}
          `}
          style={{
            backgroundColor: theme.colors.surface,
            borderColor: error ? theme.colors.error : theme.colors.border,
            color: theme.colors.text,
          }}
          {...props}
        />
        
        {(icon || isPassword) && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {isPassword ? (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                style={{ color: theme.colors.textSecondary }}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            ) : (
              IconComponent && (
                <IconComponent 
                  className="w-4 h-4"
                  style={{ color: theme.colors.textSecondary }}
                />
              )
            )}
          </div>
        )}
      </div>
      
      {error && (
        <span 
          className="block text-xs"
          style={{ color: theme.colors.error }}
        >
          {error}
        </span>
      )}
    </div>
  );
};