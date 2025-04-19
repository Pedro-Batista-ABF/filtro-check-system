
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

// Import pages
import Login from './pages/Login';
import Home from './pages/Home';
import Register from './pages/Register';
import NotFound from './pages/NotFound';
import Peritagem from './pages/Peritagem';
import PeritagemForm from './pages/PeritagemForm';
import PeritagemPendente from './pages/PeritagemPendente';
import Execucao from './pages/Execucao';
import ExecucaoDetails from './pages/ExecucaoDetails';
import Checagem from './pages/Checagem';
import CheckagemForm from './pages/CheckagemForm';
import CheckagemFinal from './pages/CheckagemFinal';
import Concluidos from './pages/Concluidos';
import Relatorios from './pages/Relatorios';
import ReportPreview from './pages/ReportPreview';
import SectorReport from './pages/SectorReport';
import ConsolidatedReport from './pages/ConsolidatedReport';
import Sucateamento from './pages/Sucateamento';
import ScrapValidation from './pages/ScrapValidation';
import ScrapValidationForm from './pages/ScrapValidationForm';

// Import components
import ProtectedRoute from './components/auth/ProtectedRoute';

const AppRoutes = () => {
  const { user } = useAuth();
  
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
      <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
      
      {/* Protected routes */}
      <Route path="/" element={<ProtectedRoute>{<Home />}</ProtectedRoute>} />
      
      {/* Peritagem routes */}
      <Route path="/peritagem" element={<ProtectedRoute>{<Peritagem />}</ProtectedRoute>} />
      <Route path="/peritagem/novo" element={<ProtectedRoute>{<PeritagemForm />}</ProtectedRoute>} />
      <Route path="/peritagem/editar/:id" element={<ProtectedRoute>{<PeritagemForm />}</ProtectedRoute>} />
      <Route path="/peritagem/pendente" element={<ProtectedRoute>{<PeritagemPendente />}</ProtectedRoute>} />
      
      {/* Execução routes */}
      <Route path="/execucao" element={<ProtectedRoute>{<Execucao />}</ProtectedRoute>} />
      <Route path="/execucao/:id" element={<ProtectedRoute>{<ExecucaoDetails />}</ProtectedRoute>} />
      
      {/* Checagem routes - Corrigido a ordem para garantir que /checagem/final seja reconhecida antes de /checagem/:id */}
      <Route path="/checagem" element={<ProtectedRoute>{<Checagem />}</ProtectedRoute>} />
      <Route path="/checagem/final" element={<ProtectedRoute>{<CheckagemFinal />}</ProtectedRoute>} />
      <Route path="/checagem/:id" element={<ProtectedRoute>{<CheckagemForm />}</ProtectedRoute>} />
      
      {/* Completed sectors routes */}
      <Route path="/concluidos" element={<ProtectedRoute>{<Concluidos />}</ProtectedRoute>} />
      
      {/* Reports routes */}
      <Route path="/relatorios" element={<ProtectedRoute>{<Relatorios />}</ProtectedRoute>} />
      <Route path="/relatorios/preview/:id" element={<ProtectedRoute>{<ReportPreview />}</ProtectedRoute>} />
      <Route path="/relatorios/setor/:id" element={<ProtectedRoute>{<SectorReport />}</ProtectedRoute>} />
      <Route path="/relatorios/consolidado" element={<ProtectedRoute>{<ConsolidatedReport />}</ProtectedRoute>} />
      
      {/* Scrap routes */}
      <Route path="/sucateamento" element={<ProtectedRoute>{<Sucateamento />}</ProtectedRoute>} />
      <Route path="/sucateamento/validacao" element={<ProtectedRoute>{<ScrapValidation />}</ProtectedRoute>} />
      <Route path="/sucateamento/validacao/:id" element={<ProtectedRoute>{<ScrapValidationForm />}</ProtectedRoute>} />
      
      {/* Fallback route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
