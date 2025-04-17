
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from "sonner";
import ProtectedRoute from './components/auth/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Peritagem from './pages/Peritagem';
import PeritagemNew from './pages/PeritagemNew';
import PeritagemEdit from './pages/PeritagemEdit';
import Sucateamento from './pages/Sucateamento';
import SucateamentoDetails from './pages/SucateamentoDetails';
import Execucao from './pages/Execucao';
import ExecucaoDetails from './pages/ExecucaoDetails';
import Checagem from './pages/Checagem';
import CheckagemDetails from './pages/CheckagemDetails';
import Relatorio from './pages/Relatorio';
import { AuthProvider } from './contexts/AuthContext';
import { ApiContextProvider } from './contexts/ApiContextExtended';
import { ThemeProvider } from './contexts/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ApiContextProvider>
          <Router>
            <Toaster />
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/peritagem" element={<ProtectedRoute><Peritagem /></ProtectedRoute>} />
              <Route path="/peritagem/new" element={<ProtectedRoute><PeritagemNew /></ProtectedRoute>} />
              <Route path="/peritagem/:id" element={<ProtectedRoute><PeritagemEdit /></ProtectedRoute>} />
              <Route path="/sucateamento" element={<ProtectedRoute><Sucateamento /></ProtectedRoute>} />
              <Route path="/sucateamento/:id" element={<ProtectedRoute><SucateamentoDetails /></ProtectedRoute>} />
              <Route path="/execucao" element={<ProtectedRoute><Execucao /></ProtectedRoute>} />
              <Route path="/execucao/:id" element={<ProtectedRoute><ExecucaoDetails /></ProtectedRoute>} />
              <Route path="/checagem" element={<ProtectedRoute><Checagem /></ProtectedRoute>} />
              <Route path="/checagem/:id" element={<ProtectedRoute><CheckagemDetails /></ProtectedRoute>} />
              <Route path="/relatorio" element={<ProtectedRoute><Relatorio /></ProtectedRoute>} />
            </Routes>
          </Router>
        </ApiContextProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
