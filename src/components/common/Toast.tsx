// src/components/common/Toast.tsx
import React, { useEffect, useState } from 'react';
import { useTheme } from '../../hooks/useTheme';
import { CheckCircle, XCircle, AlertCircle, X, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  id: string;
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({
  id,
  message,
  type = 'info',
  duration = 3000,
  onClose,
}) => {
  const { theme } = useTheme();
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    // Start progress bar
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) {
          clearInterval(interval);
          return 0;
        }
        return prev - (100 / (duration / 50));
      });
    }, 50);

    // Auto-dismiss
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose(id), 300);
    }, duration);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [id, duration, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose(id), 300);
  };

  const typeConfig = {
    success: {
      icon: <CheckCircle className="w-5 h-5" />,
      bgColor: theme.colors.success,
      textColor: '#ffffff',
      iconColor: '#ffffff',
    },
    error: {
      icon: <XCircle className="w-5 h-5" />,
      bgColor: theme.colors.error,
      textColor: '#ffffff',
      iconColor: '#ffffff',
    },
    warning: {
      icon: <AlertCircle className="w-5 h-5" />,
      bgColor: theme.colors.warning,
      textColor: '#000000',
      iconColor: '#000000',
    },
    info: {
      icon: <Info className="w-5 h-5" />,
      bgColor: theme.colors.primary,
      textColor: '#ffffff',
      iconColor: '#ffffff',
    },
  };

  const config = typeConfig[type];

  return (
    <div
      className={`
        fixed left-4 bottom-4 z-[9999] 
        flex items-start gap-3 p-4 rounded-lg shadow-lg min-w-[300px] max-w-[400px]
        transform transition-all duration-300 ease-out
        ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
      `}
      style={{
        backgroundColor: config.bgColor,
        color: config.textColor,
        boxShadow: `0 10px 25px -5px ${theme.colors.overlay}30`,
      }}
    >
      {/* Progress Bar */}
      <div 
        className="absolute top-0 left-0 right-0 h-1 rounded-t-lg overflow-hidden"
        style={{ backgroundColor: `${config.textColor}30` }}
      >
        <div 
          className="h-full transition-all duration-50 ease-linear"
          style={{ 
            width: `${progress}%`,
            backgroundColor: config.textColor 
          }}
        />
      </div>

      {/* Icon */}
      <div className="flex-shrink-0 pt-0.5" style={{ color: config.iconColor }}>
        {config.icon}
      </div>

      {/* Message */}
      <div className="flex-1">
        <p className="text-sm font-medium pr-6">{message}</p>
      </div>

      {/* Close Button */}
      <button
        onClick={handleClose}
        className="absolute top-2 right-2 p-1 rounded-full hover:bg-white/20 transition-colors duration-200"
        aria-label="Close toast"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};