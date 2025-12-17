import React from 'react';
import ThemeProvider from './contexts/ThemeContext';
import Login from './views/Login';
import { useToast } from './hooks/useToast';
import { ToastContainer } from './components/common/ToastContainer';
import { QueryClientProvider,QueryClient } from "@tanstack/react-query"
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router'
import ROUTE_PATHS from './constants/route_paths';
import InsertNewSubstance from './views/InsertNewSubstance';
import { AppLayout } from './layout/AppLayout';
import { AuthProvider } from './contexts/AuthProvider';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

function App() {
  
  return (
    <AppProviders>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to={ROUTE_PATHS.LOGIN} replace />} />
          <Route path={ROUTE_PATHS.LOGIN} element={<Login/>}/>
          <Route path={ROUTE_PATHS.INSERT_SUBSTANCE} element={
            <ProtectedRoute>
              <InsertNewSubstance/>
            </ProtectedRoute>
          }/>
        </Routes>
      </Router>
    </AppProviders>
      
  );
}


function AppProviders({children} : { children : React.ReactNode}){
  const { toasts, removeToast } = useToast();
  const queryClient = new QueryClient()

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <AppLayout>
            {children}
          </AppLayout>
          <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  )
}

export default App;