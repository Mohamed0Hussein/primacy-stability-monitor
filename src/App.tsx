import React from 'react';
import ThemeProvider from './contexts/ThemeContext';
import Login from './views/Login';
import { ToastProvider } from './contexts/ToastProvider';
import { QueryClientProvider, QueryClient } from "@tanstack/react-query"
import { HashRouter as Router, Route, Routes, Navigate } from 'react-router-dom'
import ROUTE_PATHS from './constants/route_paths';
import InsertNewProduct from './views/InsertNewProduct';
import Dashboard from './views/Dashboard';
import ProductsUnderTesting from './views/ProductsUnderTesting';
import WithdrawalList from './views/WithdrawalList';
import TestDetails from './views/TestDetails';
import { AppLayout } from './layout/AppLayout';
import { AuthProvider } from './contexts/AuthProvider';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { ErrorBoundary } from './components/ErrorBoundary';

const queryClient = new QueryClient();

function App() {
  return (
    <ErrorBoundary>
      <AppProviders>
        <Router>
          <AppLayout>
            <Routes>
              <Route path={ROUTE_PATHS.HOME} element={<Navigate to={ROUTE_PATHS.LOGIN} replace />} />
              <Route path={ROUTE_PATHS.LOGIN} element={<Login />} />
              <Route path={ROUTE_PATHS.DASHBOARD} element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path={ROUTE_PATHS.INSERT_PRODUCT} element={
                <ProtectedRoute>
                  <InsertNewProduct />
                </ProtectedRoute>
              } />
              <Route path={ROUTE_PATHS.PRODUCTS_UNDER_TESTING} element={
                <ProtectedRoute>
                  <ProductsUnderTesting />
                </ProtectedRoute>
              } />
              <Route path={ROUTE_PATHS.WITHDRAWAL_LIST} element={
                <ProtectedRoute>
                  <WithdrawalList />
                </ProtectedRoute>
              } />
              <Route path={ROUTE_PATHS.TEST_DETAILS} element={
                <ProtectedRoute>
                  <TestDetails />
                </ProtectedRoute>
              } />
              <Route path="*" element={<Navigate to={ROUTE_PATHS.DASHBOARD} replace />} />
            </Routes>
          </AppLayout>
        </Router>
      </AppProviders>
    </ErrorBoundary>
  );
}


function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <AuthProvider>
              {children}
          </AuthProvider>
        </ToastProvider>
      </QueryClientProvider>
    </ThemeProvider>
  )
}

export default App;