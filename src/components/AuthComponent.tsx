// src/components/auth/AuthContainer.tsx
import React, { useState } from 'react';
import { useTheme } from '../hooks/useTheme';
import { Card } from './common/Card';
import { Button } from './common/Button';
import { Input } from './common/Input';
import { ThemeToggle } from './common/ThemeToggle';
import { LogIn, UserPlus, Github } from 'lucide-react';

export const AuthComponent: React.FC = () => {
  const { theme } = useTheme();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log(isLogin ? 'Logging in' : 'Signing up', formData);
    setIsLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSocialLogin = (provider: string) => {
    console.log(`Logging in with ${provider}`);
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-6 transition-colors duration-300"
      style={{ backgroundColor: theme.colors.background }}
    >
      <ThemeToggle variant="default" />

      <div className="w-full max-w-md animate-fade-in">
        <Card className="relative overflow-hidden">
          <div 
            className="absolute -top-24 -right-24 w-48 h-48 rounded-full opacity-20 blur-3xl"
            style={{ backgroundColor: theme.colors.primary }}
          />
          
          <div className="relative z-10">
            <h1 
              className="text-2xl font-bold text-center mb-2"
              style={{ color: theme.colors.text }}
            >
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h1>
            
            <p 
              className="text-center mb-6 text-sm"
              style={{ color: theme.colors.textSecondary }}
            >
              {isLogin 
                ? 'Enter your credentials to access your account' 
                : 'Sign up to get started with our service'}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <Input
                  label="Username"
                  name="username"
                  type="text"
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={handleChange}
                  icon="user"
                  required
                />
              )}

              <Input
                label="Email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                icon="mail"
                required
              />

              <Input
                label="Password"
                name="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                icon="lock"
                required
              />

              {!isLogin && (
                <Input
                  label="Confirm Password"
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              )}

              {isLogin && (
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded"
                      style={{ 
                        borderColor: theme.colors.border,
                        backgroundColor: theme.colors.surface,
                        color: theme.colors.primary,
                      }}
                    />
                    <span 
                      className="text-sm"
                      style={{ color: theme.colors.textSecondary }}
                    >
                      Remember me
                    </span>
                  </label>
                  
                  <Button variant="ghost" type="button" size="sm">
                    Forgot Password?
                  </Button>
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                fullWidth
                className="mt-2"
              >
                {isLogin ? 'Sign In' : 'Sign Up'}
                {isLogin ? (
                  <LogIn className="w-4 h-4" />
                ) : (
                  <UserPlus className="w-4 h-4" />
                )}
              </Button>

              <div className="flex items-center gap-3 my-4">
                <div 
                  className="flex-1 h-px"
                  style={{ backgroundColor: theme.colors.border }}
                />
                <span 
                  className="text-xs"
                  style={{ color: theme.colors.textSecondary }}
                >
                  Or continue with
                </span>
                <div 
                  className="flex-1 h-px"
                  style={{ backgroundColor: theme.colors.border }}
                />
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  fullWidth
                  onClick={() => handleSocialLogin('google')}
                  style={{
                    borderColor: theme.colors.border,
                    color: theme.colors.text,
                  }}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Google
                </Button>
                
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  fullWidth
                  onClick={() => handleSocialLogin('github')}
                  style={{
                    borderColor: theme.colors.border,
                    color: theme.colors.text,
                  }}
                >
                  <Github className="w-4 h-4" />
                  GitHub
                </Button>
              </div>
            </form>

            <p 
              className="text-center mt-6 text-sm"
              style={{ color: theme.colors.textSecondary }}
            >
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              {' '}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="font-semibold hover:underline"
                style={{ color: theme.colors.primary }}
              >
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>
        </Card>

        <p className="text-center mt-4 text-xs" style={{ color: theme.colors.textSecondary }}>
          By continuing, you agree to our{' '}
          <a href="#" style={{ color: theme.colors.primary }} className="hover:underline">
            Terms
          </a>{' '}
          and{' '}
          <a href="#" style={{ color: theme.colors.primary }} className="hover:underline">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
};