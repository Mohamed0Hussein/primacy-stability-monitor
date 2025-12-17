import { Loader2 } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

interface LoadingSpinnerProps {
  fullScreen?: boolean;
  size?: number;
  className?: string;
  loadingLabel?: string;
}

export default function LoadingSpinner({ 
  fullScreen = true, 
  size = 48,
  className = "",
  loadingLabel = "Loading..."
}: LoadingSpinnerProps) {
  const { theme } = useTheme();

  const containerClasses = fullScreen 
    ? "fixed inset-0 min-h-screen z-50 flex flex-col items-center justify-center transition-colors duration-300" 
    : "flex flex-col items-center justify-center p-4";

  return (
    <div 
      className={`${containerClasses} ${className}`}
      style={{ backgroundColor: fullScreen ? theme.colors.background : 'transparent' }}
    >
      <div className="relative">
        {/* Outer glow */}
        <div 
          className="absolute inset-0 blur-xl opacity-20 rounded-full animate-pulse"
          style={{ backgroundColor: theme.colors.primary }}
        />
        
        {/* Spinner */}
        <Loader2 
          size={size}
          className="animate-spin relative z-10"
          style={{ color: theme.colors.primary }}
        />
      </div>
      
      <p 
        className="mt-4 text-sm font-medium animate-pulse"
        style={{ color: theme.colors.textSecondary }}
      >
        {loadingLabel}
      </p>
    </div>
  );
};
