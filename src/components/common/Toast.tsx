// src/components/common/Toast.tsx
import React, { useEffect, useState } from 'react';
import { useTheme } from '../../hooks/useTheme';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

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
      color: theme.colors.success,
    },
    error: {
      icon: <XCircle className="w-5 h-5" />,
      color: theme.colors.error,
    },
    warning: {
      icon: <AlertCircle className="w-5 h-5" />,
      color: theme.colors.warning,
    },
    info: {
      icon: <Info className="w-5 h-5" />,
      color: theme.colors.primary,
    },
  };

  const config = typeConfig[type];

  return (
    <div
      className={`
        relative overflow-hidden
        flex items-start gap-3 p-4 rounded-lg shadow-lg min-w-[300px] max-w-[400px]
        transform transition-all duration-300 ease-out border-l-4
        ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'}
      `}
      style={{
        backgroundColor: theme.colors.surface,
        color: theme.colors.text,
        borderLeftColor: config.color,
        borderTop: `1px solid ${theme.colors.border}`,
        borderRight: `1px solid ${theme.colors.border}`,
        borderBottom: `1px solid ${theme.colors.border}`,
        boxShadow: `0 4px 12px ${theme.colors.overlay}20`,
      }}
    >
      {/* Progress Bar */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-1"
        style={{ 
          backgroundColor: `${config.color}20` 
        }}
      >
        <div 
          className="h-full transition-all duration-50 ease-linear"
          style={{ 
            width: `${progress}%`,
            backgroundColor: config.color 
          }}
        />
      </div>

      {/* Icon */}
      <div className="shrink-0 pt-0.5" style={{ color: config.color }}>
        {config.icon}
      </div>

      {/* Message */}
      <div className="flex-1">
        <p className="text-sm font-medium pr-6">{message}</p>
      </div>

      {/* Close Button */}
      <button
        onClick={handleClose}
        className="absolute top-2 right-2 p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors duration-200"
        aria-label="Close toast"
        style={{ color: theme.colors.textSecondary }}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
