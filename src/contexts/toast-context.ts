// src/contexts/toast-context.ts
import { createContext } from 'react';
import { ToastMessage } from '../components/common/ToastContainer';
import { ToastType } from '../components/common/Toast';

export interface ToastContextType {
  toasts: ToastMessage[];
  showToast: (message: string, type?: ToastType, duration?: number) => string;
  removeToast: (id: string) => void;
  success: (message: string, duration?: number) => string;
  error: (message: string, duration?: number) => string;
  warning: (message: string, duration?: number) => string;
  info: (message: string, duration?: number) => string;
}

export const ToastContext = createContext<ToastContextType | undefined>(undefined);
