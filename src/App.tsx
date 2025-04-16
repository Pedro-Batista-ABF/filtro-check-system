
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
