// src/components/auth/AuthContainer.tsx
import React, { useState, useEffect } from 'react';
import { LogIn, UserPlus } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { useTheme } from '../hooks/useTheme';
import { useToast } from '../hooks/useToast';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { loginUser, registerUser, resetPassword } from '../utils/auth';
import { useAuth } from '../contexts/auth-context';
import ROUTE_PATHS from '../constants/route_paths';

const FIREBASE_ERRORS: Record<string, string> = {
  'auth/user-not-found': 'No account with that email.',
  'auth/wrong-password': 'Wrong password.',
  'auth/invalid-credential': 'Wrong password.',
  'auth/email-already-in-use': 'Email already registered.',
  'auth/too-many-requests': 'Too many attempts. Try again later.',
  'auth/invalid-email': 'Invalid email address.',
  'auth/weak-password': 'Password too weak (min 6 characters).',
  'auth/network-request-failed': 'Network error. Check your connection.',
};

function getAuthError(error: unknown): string {
  const code = (error as { code?: string })?.code ?? '';
  return FIREBASE_ERRORS[code] ?? 'Authentication failed. Please try again.';
}

export default function Login() {
  const { theme } = useTheme();
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate(ROUTE_PATHS.DASHBOARD);
    }
  }, [user, loading, navigate]);

  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    confirmPassword: '',
    phone:'',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { mutateAsync: login } = useMutation({ mutationFn: () => loginUser(formData.email, formData.password, rememberMe) });
  const { mutateAsync: signup } = useMutation({ mutationFn: () => registerUser(formData.fullName, formData.email, formData.password, formData.phone) });
  const { error: displayError, success: displaySuccess } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        await login();
      } else {
        if (formData.password !== formData.confirmPassword) {
          displayError('Passwords do not match.');
          setIsLoading(false);
          return;
        }
        await signup();
      }
    } catch (error) {
      displayError(getAuthError(error));
    }

    setIsLoading(false);
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      displayError('Enter your email first.');
      return;
    }
    try {
      await resetPassword(formData.email);
      displaySuccess('Password reset email sent.');
    } catch (error) {
      displayError(getAuthError(error));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div 
      className="min-h-full mx-auto items-center justify-center p-16 transition-colors duration-300"
      style={{ backgroundColor: theme.colors.background }}
    >

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
                  label="Full name"
                  name="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={handleChange}
                  icon="user"
                  required
                />
              )}
              {!isLogin && (
                <Input
                  label="Phone"
                  name="phone"
                  type="number"
                  placeholder="Enter your phone"
                  value={formData.phone}
                  onChange={handleChange}
                  icon="phone"
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
                  
                  <Button variant="ghost" type="button" size="sm" onClick={handleForgotPassword}>
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

            </form>

            <p 
              className="text-center mt-6 text-sm"
              style={{ color: theme.colors.textSecondary }}
            >
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              {' '}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(prev => !prev)
                  setFormData({
                    email: '',
                    password: '',
                    fullName: '',
                    confirmPassword: '',
                    phone: '',
                  })
                }}
                className="font-semibold hover:underline cursor-pointer"
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
}