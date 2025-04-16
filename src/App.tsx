
import React, { useState, useEffect, Suspense } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Peritagem } from './pages/Peritagem';
import { PeritagemForm } from './pages/PeritagemForm';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/auth/ProtectedRoute';
import FallbackRoot from './components/FallbackRoot';
import { Toaster } from 'sonner';
import { runConnectionDiagnostics } from './utils/connectionUtils';
import Checagem from './pages/Checagem';
import Execucao from './pages/Execucao';
import CheckagemForm from './pages/CheckagemForm';
import ScrapValidation from './pages/ScrapValidation';
import ScrapValidationForm from './pages/ScrapValidationForm';
import Sucateamento from './pages/Sucateamento';
import Concluidos from './pages/Concluidos';
import ExecucaoDetails from './pages/ExecucaoDetails';
import SectorReport from './pages/SectorReport';
import ConsolidatedReport from './pages/ConsolidatedReport';
import ReportPreview from './pages/ReportPreview';
import Home from './pages/Home';
import { supabase } from './integrations/supabase/client';

// Configuração do cliente de consulta com retry mais tolerante e cache mais longo
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 5,  // Aumentado para 5 tentativas
      retryDelay: attemptIndex => Math.min(1000 * Math.pow(2, attemptIndex), 30000),  // Backoff exponencial
      staleTime: 5 * 60 * 1000, // 5 minutos (reduzido para obter dados mais frescos)
      cacheTime: 30 * 60 * 1000, // 30 minutos
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,  // Buscar novamente ao reconectar
    },
  },
});

/**
 * Componente principal da aplicação
 */
function App() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [diagnosticsRun, setDiagnosticsRun] = useState(false);
  const navigate = useNavigate();

  // Verificar status de autenticação ao iniciar
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        navigate('/login');
      } else if (event === 'SIGNED_IN') {
        // Redirecionar para home se estiver na página de login
        const currentPath = window.location.pathname;
        if (currentPath === '/login' || currentPath === '/register') {
          navigate('/');
        }
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Notificar o usuário que a conexão foi restaurada
      if (!isOnline) {
        queryClient.invalidateQueries();  // Invalidar todas as consultas ao reconectar
      }
    };
    
    const handleOffline = () => {
      setIsOnline(false);
    };

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
  }, [diagnosticsRun, isOnline, queryClient]);
  
  return (
    <QueryClientProvider client={queryClient}>
      <FallbackRoot>
        <Suspense fallback={<div className="p-8 flex justify-center">Carregando...</div>}>
          <Routes>
            {/* Rotas de autenticação */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Rota raiz - redirecionando para home */}
            <Route path="/" element={
              <ProtectedRoute>
                <Home />
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
            
            {/* Rotas de execução */}
            <Route path="/execucao" element={
              <ProtectedRoute>
                <Execucao />
              </ProtectedRoute>
            } />
            <Route path="/execucao/:id" element={
              <ProtectedRoute>
                <ExecucaoDetails />
              </ProtectedRoute>
            } />
            
            {/* Rotas de checagem */}
            <Route path="/checagem" element={
              <ProtectedRoute>
                <Checagem />
              </ProtectedRoute>
            } />
            <Route path="/checagem/:id" element={
              <ProtectedRoute>
                <CheckagemForm />
              </ProtectedRoute>
            } />
            
            {/* Rotas de sucateamento */}
            <Route path="/sucateamento" element={
              <ProtectedRoute>
                <Sucateamento />
              </ProtectedRoute>
            } />
            <Route path="/sucateamento/:id" element={
              <ProtectedRoute>
                <ScrapValidationForm />
              </ProtectedRoute>
            } />
            <Route path="/sucateamento/validacao" element={
              <ProtectedRoute>
                <ScrapValidation />
              </ProtectedRoute>
            } />
            
            {/* Rotas de relatórios */}
            <Route path="/concluidos" element={
              <ProtectedRoute>
                <Concluidos />
              </ProtectedRoute>
            } />
            <Route path="/relatorio/setor/:id" element={
              <ProtectedRoute>
                <SectorReport />
              </ProtectedRoute>
            } />
            <Route path="/relatorio/consolidado" element={
              <ProtectedRoute>
                <ConsolidatedReport />
              </ProtectedRoute>
            } />
            <Route path="/relatorio/preview" element={
              <ProtectedRoute>
                <ReportPreview />
              </ProtectedRoute>
            } />
            
            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        <Toaster 
          richColors 
          position="top-right" 
          closeButton
          expand={false}
          toastOptions={{
            duration: 5000,
          }}
        />
      </FallbackRoot>
    </QueryClientProvider>
  );
}

export default App;
