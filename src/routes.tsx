
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
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Home />} />
        
        {/* Peritagem routes */}
        <Route path="/peritagem" element={<Peritagem />} />
        <Route path="/peritagem/novo" element={<PeritagemForm />} />
        <Route path="/peritagem/editar/:id" element={<PeritagemForm />} />
        <Route path="/peritagem/pendente" element={<PeritagemPendente />} />
        
        {/* Execução routes */}
        <Route path="/execucao" element={<Execucao />} />
        <Route path="/execucao/:id" element={<ExecucaoDetails />} />
        
        {/* Checagem routes */}
        <Route path="/checagem" element={<Checagem />} />
        <Route path="/checagem/:id" element={<CheckagemForm />} />
        <Route path="/checagem/final" element={<CheckagemFinal />} />
        
        {/* Completed sectors routes */}
        <Route path="/concluidos" element={<Concluidos />} />
        
        {/* Reports routes */}
        <Route path="/relatorios" element={<Relatorios />} />
        <Route path="/relatorios/preview/:id" element={<ReportPreview />} />
        <Route path="/relatorios/setor/:id" element={<SectorReport />} />
        <Route path="/relatorios/consolidado" element={<ConsolidatedReport />} />
        
        {/* Scrap routes */}
        <Route path="/sucateamento" element={<Sucateamento />} />
        <Route path="/sucateamento/validacao" element={<ScrapValidation />} />
        <Route path="/sucateamento/validacao/:id" element={<ScrapValidationForm />} />
      </Route>
      
      {/* Fallback route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
