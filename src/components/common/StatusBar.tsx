import React from 'react';
import { LogOut, User, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/auth-context';
import { useTheme } from '../../hooks/useTheme';
import { Button } from './Button';
import { ThemeToggle } from './ThemeToggle';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import ROUTE_PATHS from '../../constants/route_paths';
import packageJson from '../../../package.json';

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

        <Link
          to={ROUTE_PATHS.DASHBOARD}
          className="text-lg font-bold ml-2 cursor-pointer hover:opacity-80 transition-opacity"
          style={{ color: theme.colors.text, textDecoration: 'none' }}
        >
          Primacy Stability Monitor
        </Link>
        <span
          className="text-xs font-mono px-1.5 py-0.5 rounded-md"
          style={{ color: theme.colors.textSecondary, backgroundColor: theme.colors.surfaceVariant }}
        >
          v{packageJson.version}
        </span>
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
