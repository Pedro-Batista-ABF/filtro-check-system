
import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Peritagem } from './pages/Peritagem';
import { PeritagemForm } from './pages/PeritagemForm';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/auth/ProtectedRoute';
import FallbackRoot from './components/FallbackRoot';
import { Toaster } from 'sonner';
import { AuthProvider } from './contexts/AuthContext';
import { runConnectionDiagnostics } from './utils/connectionUtils';

// Configuração do cliente de consulta com retry mais tolerante e cache mais longo
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 10 * 60 * 1000, // 10 minutos
      cacheTime: 30 * 60 * 1000, // 30 minutos
      refetchOnWindowFocus: false,
    },
  },
});

/**
 * Componente principal da aplicação
 */
function App() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [diagnosticsRun, setDiagnosticsRun] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Executar diagnóstico no carregamento inicial
    if (!diagnosticsRun) {
      runConnectionDiagnostics().then(() => {
        setDiagnosticsRun(true);
      });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [diagnosticsRun]);
  
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <FallbackRoot>
          <Routes>
            {/* Rotas de autenticação */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Rota raiz - redirecionando para peritagem */}
            <Route path="/" element={
              <ProtectedRoute>
                <Peritagem />
              </ProtectedRoute>
            } />
            
            {/* Rotas de peritagem */}
            <Route path="/peritagem" element={
              <ProtectedRoute>
                <Peritagem />
              </ProtectedRoute>
            } />
            <Route path="/peritagem/novo" element={
              <ProtectedRoute>
                <PeritagemForm />
              </ProtectedRoute>
            } />
            <Route path="/peritagem/:id" element={
              <ProtectedRoute>
                <PeritagemForm />
              </ProtectedRoute>
            } />
            
            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </FallbackRoot>
        <Toaster 
          richColors 
          position="top-right" 
          closeButton
          expand={false}
          toastOptions={{
            duration: 5000,
          }}
        />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
