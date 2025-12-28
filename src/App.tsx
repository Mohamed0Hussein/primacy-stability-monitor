import React from 'react';
import ThemeProvider from './contexts/ThemeContext';
import Login from './views/Login';
import { ToastProvider } from './contexts/ToastProvider';
import { QueryClientProvider,QueryClient } from "@tanstack/react-query"
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router'
import ROUTE_PATHS from './constants/route_paths';
import InsertNewProduct from './views/InsertNewProduct';
import Dashboard from './views/Dashboard';
import { AppLayout } from './layout/AppLayout';
import { AuthProvider } from './contexts/AuthProvider';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

function App() {
  
  return (
    <AppProviders>
      <Router>
        <AppLayout>
          <Routes>
            <Route path={ROUTE_PATHS.HOME} element={<Navigate to={ROUTE_PATHS.LOGIN} replace />} />
            <Route path={ROUTE_PATHS.LOGIN} element={<Login/>}/>
            <Route path={ROUTE_PATHS.DASHBOARD} element={
              <ProtectedRoute>
                <Dashboard/>
              </ProtectedRoute>
            }/>
            <Route path={ROUTE_PATHS.INSERT_PRODUCT} element={
              <ProtectedRoute>
                <InsertNewProduct/>
              </ProtectedRoute>
            }/>
          </Routes>
        </AppLayout>
      </Router>
    </AppProviders>
      
  );
}


function AppProviders({children} : { children : React.ReactNode}){
  const queryClient = new QueryClient()

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