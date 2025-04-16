import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { Home } from './pages/Home';
import { Index } from './pages/Index';
import { Peritagem } from './pages/peritagem/Peritagem';
import { PeritagemForm } from './pages/peritagem/PeritagemForm';
import { PeritagemPendente } from './pages/peritagem/PeritagemPendente';
import { Execucao } from './pages/execucao/Execucao';
import { ExecucaoDetails } from './pages/execucao/ExecucaoDetails';
import { Checagem } from './pages/checagem/Checagem';
import { CheckagemForm } from './pages/checagem/CheckagemForm';
import { CheckagemFinal } from './pages/checagem/CheckagemFinal';
import { Sucateamento } from './pages/sucateamento/Sucateamento';
import { ScrapValidationForm } from './pages/sucateamento/ScrapValidationForm';
import { Concluidos } from './pages/concluidos/Concluidos';
import { SectorReport } from './pages/relatorios/SectorReport';
import { ConsolidatedReport } from './pages/relatorios/ConsolidatedReport';
import { ReportPreview } from './pages/relatorios/ReportPreview';
import { NotFound } from './pages/NotFound';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import FallbackRoot from './components/FallbackRoot';

const queryClient = new QueryClient();

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
          {/* Rotas públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Rotas protegidas */}
          <Route element={<ProtectedRoute />}>
            {/* Home */}
            <Route path="/" element={<Home />} />
            <Route index element={<Index />} />
            
            {/* Peritagem */}
            <Route path="/peritagem" element={<Peritagem />} />
            <Route path="/peritagem/novo" element={<PeritagemForm />} />
            <Route path="/peritagem/:id" element={<PeritagemForm />} />
            <Route path="/peritagem/pendente" element={<PeritagemPendente />} />
            
            {/* Execução */}
            <Route path="/execucao" element={<Execucao />} />
            <Route path="/execucao/:id" element={<ExecucaoDetails />} />
            
            {/* Checagem */}
            <Route path="/checagem" element={<Checagem />} />
            <Route path="/checagem/:id" element={<CheckagemForm />} />
            <Route path="/checagem-final" element={<CheckagemFinal />} />
            
            {/* Sucateamento */}
            <Route path="/sucateamento" element={<Sucateamento />} />
            <Route path="/sucateamento/:id" element={<ScrapValidationForm />} />
            
            {/* Concluídos */}
            <Route path="/concluidos" element={<Concluidos />} />
            
            {/* Relatórios */}
            <Route path="/relatorio/:id" element={<SectorReport />} />
            <Route path="/relatorio-consolidado" element={<ConsolidatedReport />} />
            <Route path="/relatorio-preview" element={<ReportPreview />} />
          </Route>
          
          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </FallbackRoot>
    </QueryClientProvider>
  );
}

export default App;
