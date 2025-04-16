
import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Peritagem } from './pages/Peritagem';
import { PeritagemForm } from './pages/PeritagemForm';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/auth/ProtectedRoute';
import FallbackRoot from './components/FallbackRoot';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutos
      refetchOnWindowFocus: false,
    },
  },
});

/**
 * Componente principal da aplicação
 */
function App() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  return (
    <QueryClientProvider client={queryClient}>
      <FallbackRoot>
        <Routes>
          {/* Rota raiz - redirecionando para peritagem */}
          <Route path="/" element={<Peritagem />} />
          
          {/* Rotas de peritagem */}
          <Route path="/peritagem" element={<Peritagem />} />
          <Route path="/peritagem/novo" element={<PeritagemForm />} />
          <Route path="/peritagem/:id" element={<PeritagemForm />} />
          
          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </FallbackRoot>
    </QueryClientProvider>
  );
}

export default App;
