import { useTheme } from '../../hooks/useTheme';

interface LoadingSpinnerProps {
  fullScreen?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  loadingLabel?: string;
  variant?: 'orbital' | 'pulse' | 'dots';
}

const sizeMap = {
  sm: 32,
  md: 48,
  lg: 64,
  xl: 96,
};

export default function LoadingSpinner({ 
  fullScreen = true, 
  size = 'lg',
  className = "",
  loadingLabel = "Loading...",
  variant = 'orbital'
}: LoadingSpinnerProps) {
  const { theme } = useTheme();
  const pixelSize = sizeMap[size];

  const containerClasses = fullScreen 
    ? "fixed inset-0 min-h-screen z-50 flex flex-col items-center justify-center transition-colors duration-300" 
    : "flex flex-col items-center justify-center p-4";

  return (
    <div 
      className={`${containerClasses} ${className}`}
      style={{ backgroundColor: fullScreen ? theme.colors.background : 'transparent' }}
    >
      <div 
        className="relative flex items-center justify-center"
        style={{ width: pixelSize * 1.5, height: pixelSize * 1.5 }}
      >
        {variant === 'orbital' && (
          <OrbitalSpinner size={pixelSize} theme={theme} />
        )}
        {variant === 'pulse' && (
          <PulseSpinner size={pixelSize} theme={theme} />
        )}
        {variant === 'dots' && (
          <DotsSpinner size={pixelSize} theme={theme} />
        )}
      </div>
      
      {loadingLabel && (
        <p 
          className="mt-6 text-sm font-medium tracking-wide"
          style={{ 
            color: theme.colors.textSecondary,
            animation: 'fadeInOut 2s ease-in-out infinite'
          }}
        >
          {loadingLabel}
        </p>
      )}

      <style>{`
        @keyframes orbit {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes orbitReverse {
          0% { transform: rotate(360deg); }
          100% { transform: rotate(0deg); }
        }
        
        @keyframes pulseRing {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.15); opacity: 0.7; }
        }
        
        @keyframes pulseRingDelay {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.25); opacity: 0.5; }
        }
        
        @keyframes pulseCore {
          0%, 100% { transform: scale(1); box-shadow: 0 0 20px currentColor; }
          50% { transform: scale(1.1); box-shadow: 0 0 40px currentColor, 0 0 60px currentColor; }
        }
        
        @keyframes dotBounce1 {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.5; }
          40% { transform: scale(1); opacity: 1; }
        }
        
        @keyframes dotBounce2 {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.5; }
          40% { transform: scale(1); opacity: 1; }
        }
        
        @keyframes dotBounce3 {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.5; }
          40% { transform: scale(1); opacity: 1; }
        }
        
        @keyframes fadeInOut {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
}

interface SpinnerVariantProps {
  size: number;
  theme: ReturnType<typeof useTheme>['theme'];
}

function OrbitalSpinner({ size, theme }: SpinnerVariantProps) {
  const dotSize = size * 0.15;
  const orbitRadius = size * 0.5;

  return (
    <>
      {/* Outer glow effect */}
      <div 
        className="absolute rounded-full blur-2xl"
        style={{ 
          width: size * 1.2,
          height: size * 1.2,
          backgroundColor: theme.colors.primary,
          opacity: 0.15,
          animation: 'pulseRing 3s ease-in-out infinite'
        }}
      />

      {/* Outer orbit ring */}
      <div 
        className="absolute rounded-full"
        style={{ 
          width: size,
          height: size,
          border: `2px solid ${theme.colors.primary}`,
          opacity: 0.2
        }}
      />

      {/* Middle orbit ring */}
      <div 
        className="absolute rounded-full"
        style={{ 
          width: size * 0.7,
          height: size * 0.7,
          border: `1.5px solid ${theme.colors.primaryLight}`,
          opacity: 0.3,
          animation: 'pulseRingDelay 2.5s ease-in-out infinite'
        }}
      />

      {/* Inner orbit ring */}
      <div 
        className="absolute rounded-full"
        style={{ 
          width: size * 0.4,
          height: size * 0.4,
          border: `1px solid ${theme.colors.secondary}`,
          opacity: 0.3
        }}
      />

      {/* Orbiting dots - outer ring */}
      <div
        className="absolute"
        style={{
          width: size,
          height: size,
          animation: 'orbit 2s linear infinite'
        }}
      >
        {[0, 120, 240].map((deg, i) => (
          <div
            key={`outer-${i}`}
            className="absolute rounded-full"
            style={{
              width: dotSize,
              height: dotSize,
              backgroundColor: theme.colors.primary,
              boxShadow: `0 0 ${dotSize}px ${theme.colors.primary}`,
              top: '50%',
              left: '50%',
              transform: `rotate(${deg}deg) translateX(${orbitRadius}px) translateY(-50%)`
            }}
          />
        ))}
      </div>

      {/* Orbiting dots - middle ring (reverse) */}
      <div
        className="absolute"
        style={{
          width: size * 0.7,
          height: size * 0.7,
          animation: 'orbitReverse 1.5s linear infinite'
        }}
      >
        {[0, 180].map((deg, i) => (
          <div
            key={`middle-${i}`}
            className="absolute rounded-full"
            style={{
              width: dotSize * 0.8,
              height: dotSize * 0.8,
              backgroundColor: theme.colors.primaryLight,
              boxShadow: `0 0 ${dotSize * 0.8}px ${theme.colors.primaryLight}`,
              top: '50%',
              left: '50%',
              transform: `rotate(${deg}deg) translateX(${orbitRadius * 0.7}px) translateY(-50%)`
            }}
          />
        ))}
      </div>

      {/* Center core */}
      <div 
        className="absolute rounded-full"
        style={{ 
          width: size * 0.2,
          height: size * 0.2,
          background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
          boxShadow: `0 0 20px ${theme.colors.primary}, 0 0 40px ${theme.colors.primary}40`,
          animation: 'pulseCore 2s ease-in-out infinite'
        }}
      />
    </>
  );
}

function PulseSpinner({ size, theme }: SpinnerVariantProps) {
  return (
    <>
      {/* Outer ring */}
      <div 
        className="absolute rounded-full"
        style={{ 
          width: size,
          height: size,
          border: `3px solid ${theme.colors.primary}`,
          opacity: 0.3,
          animation: 'pulseRing 1.5s ease-in-out infinite'
        }}
      />

      {/* Middle ring */}
      <div 
        className="absolute rounded-full"
        style={{ 
          width: size * 0.7,
          height: size * 0.7,
          border: `3px solid ${theme.colors.primaryLight}`,
          opacity: 0.5,
          animation: 'pulseRingDelay 1.5s ease-in-out infinite 0.2s'
        }}
      />

      {/* Inner ring */}
      <div 
        className="absolute rounded-full"
        style={{ 
          width: size * 0.4,
          height: size * 0.4,
          border: `3px solid ${theme.colors.secondary}`,
          opacity: 0.7,
          animation: 'pulseRing 1.5s ease-in-out infinite 0.4s'
        }}
      />

      {/* Center core with gradient */}
      <div 
        className="absolute rounded-full"
        style={{ 
          width: size * 0.2,
          height: size * 0.2,
          background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
          boxShadow: `0 0 15px ${theme.colors.primary}`,
          animation: 'pulseCore 1.5s ease-in-out infinite'
        }}
      />
    </>
  );
}

function DotsSpinner({ size, theme }: SpinnerVariantProps) {
  const dotSize = size * 0.25;
  const gap = size * 0.15;

  return (
    <div 
      className="flex items-center justify-center"
      style={{ gap }}
    >
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="rounded-full"
          style={{
            width: dotSize,
            height: dotSize,
            background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.primaryLight})`,
            boxShadow: `0 0 ${dotSize / 2}px ${theme.colors.primary}`,
            animation: `dotBounce${i + 1} 1.4s ease-in-out infinite`,
            animationDelay: `${i * 0.16}s`
          }}
        />
      ))}
    </div>
  );
}
