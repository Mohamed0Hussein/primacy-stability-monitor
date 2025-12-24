import React from 'react';
import { LogOut, User, ArrowLeft, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../contexts/auth-context';
import { useTheme } from '../../hooks/useTheme';
import { Button } from './Button';
import { ThemeToggle } from './ThemeToggle';
import { useNavigate, useLocation } from 'react-router';
import ROUTE_PATHS from '../../constants/route_paths';

export const StatusBar: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
      navigate(ROUTE_PATHS.LOGIN);
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  return (
    <div 
      className="w-full h-16 px-6 flex items-center justify-between z-40 transition-colors duration-300 shadow-sm"
      style={{ 
        backgroundColor: theme.colors.surface,
        borderBottom: `1px solid ${theme.colors.border}`
      }}
    >
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          disabled={location.pathname === ROUTE_PATHS.LOGIN}
          aria-label="Go back"
        >
          <ArrowLeft size={16} style={{ color: theme.colors.text }} />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(ROUTE_PATHS.DASHBOARD)}
          aria-label="Go to Dashboard"
        >
          <LayoutDashboard size={16} style={{ color: theme.colors.text }} />
          <span style={{ color: theme.colors.text }}>Prime</span>
        </Button>

        <h1 
          className="text-lg font-bold ml-2"
          style={{ color: theme.colors.text }}
        >
          Primacy Stability Monitor
        </h1>
      </div>

      <div className="flex items-center gap-4">
        {user && (
          <div className="flex items-center gap-2 mr-2">
             <div 
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: theme.colors.primary + '20' }}
            >
              <User size={16} style={{ color: theme.colors.primary }} />
            </div>
            <div className="flex flex-col">
              <span 
                className="text-sm font-medium"
                style={{ color: theme.colors.text }}
              >
                {(user as any).email || 'User'}
              </span>
            </div>
          </div>
        )}

        <ThemeToggle />

        {user && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="flex items-center gap-2 ml-2 cursor-pointer"
          >
            <LogOut size={16} />
            Logout
          </Button>
        )}
      </div>
    </div>
  );
};
