import React from 'react';
import ThemeProvider from './contexts/ThemeContext';
import Login from './views/Login';
import { useToast } from './hooks/useToast';
import { ToastContainer } from './components/common/ToastContainer';
import { QueryClientProvider,QueryClient } from "@tanstack/react-query"
import { BrowserRouter as Router, Route, Routes } from 'react-router'
import ROUTE_PATHS from './constants/route_paths';
import InsertNewSubstance from './views/InsertNewSubstance';
import { AppLayout } from './layout/AppLayout';

function App() {
  
  return (
    <AppProviders>
      <Router>
        <Routes>
          <Route path={ROUTE_PATHS.LOGIN} element={<Login/>}/>
          <Route path={ROUTE_PATHS.HOME} element={<InsertNewSubstance/>}/>
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
        <AppLayout>
          {children}
        </AppLayout>
        <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
      </QueryClientProvider>
    </ThemeProvider>
  )
}

export default App;