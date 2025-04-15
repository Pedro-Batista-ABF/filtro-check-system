
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Peritagem from './pages/Peritagem';
import PeritagemForm from './pages/PeritagemForm';
import Execucao from './pages/Execucao';
import ExecucaoDetails from './pages/ExecucaoDetails';
import Sucateamento from './pages/Sucateamento';
import ScrapValidationForm from './pages/ScrapValidationForm';
import Checagem from './pages/Checagem';
import ChecagemForm from './pages/ChecagemForm';
import SectorReport from './pages/SectorReport';
import ReportView from './pages/ReportView';
import Setores from './pages/Setores';

function App() {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Carregando...</div>;
  }
  
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
      
      <Route path="/" element={!user ? <Navigate to="/login" /> : <Home />} />
      
      <Route path="/peritagem" element={!user ? <Navigate to="/login" /> : <Peritagem />} />
      <Route path="/peritagem/novo" element={!user ? <Navigate to="/login" /> : <PeritagemForm />} />
      <Route path="/peritagem/:id" element={!user ? <Navigate to="/login" /> : <PeritagemForm />} />
      
      <Route path="/execucao" element={!user ? <Navigate to="/login" /> : <Execucao />} />
      <Route path="/execucao/:id" element={!user ? <Navigate to="/login" /> : <ExecucaoDetails />} />
      
      <Route path="/checagem" element={!user ? <Navigate to="/login" /> : <Checagem />} />
      <Route path="/checagem/:id" element={!user ? <Navigate to="/login" /> : <ChecagemForm />} />
      
      <Route path="/sucateamento" element={!user ? <Navigate to="/login" /> : <Sucateamento />} />
      <Route path="/sucateamento/:id" element={!user ? <Navigate to="/login" /> : <ScrapValidationForm />} />
      
      <Route path="/setores" element={!user ? <Navigate to="/login" /> : <Setores />} />
      <Route path="/setores/relatorio/:id" element={!user ? <Navigate to="/login" /> : <SectorReport />} />
      <Route path="/relatorio/:id" element={!user ? <Navigate to="/login" /> : <ReportView />} />
    </Routes>
  );
}

export default App;
