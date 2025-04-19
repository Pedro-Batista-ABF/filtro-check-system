
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "@/pages/LoginPage";
import { useAuth } from "@/contexts/AuthContext";
import PrivateRoute from "@/components/auth/PrivateRoute";
import Dashboard from "@/pages/Dashboard";
import Peritagem from "@/pages/Peritagem";
import PeritagemForm from "@/pages/PeritagemForm";
import Execucao from "@/pages/Execucao";
import ExecucaoForm from "@/pages/ExecucaoForm";
import Checagem from "@/pages/Checagem";
import CheckagemFinal from "@/pages/CheckagemFinal";
import Concluido from "@/pages/Concluido";
import Relatorios from "@/pages/Relatorios";
import RelatorioPreview from "@/pages/RelatorioPreview";
import RelatorioDetalhado from "@/pages/RelatorioDetalhado";
import Sucateamento from "@/pages/Sucateamento";
import ScrapValidationForm from "@/pages/ScrapValidationForm";

function App() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      
      <Route path="/" element={<PrivateRoute />}>
        <Route index element={<Dashboard />} />
        
        {/* Fluxo de Peritagem */}
        <Route path="peritagem" element={<Peritagem />} />
        <Route path="peritagem/novo" element={<PeritagemForm />} />
        <Route path="peritagem/editar/:id" element={<PeritagemForm />} />
        
        {/* Fluxo de Execução */}
        <Route path="execucao" element={<Execucao />} />
        <Route path="execucao/:id" element={<ExecucaoForm />} />
        
        {/* Fluxo de Checagem */}
        <Route path="checagem" element={<Checagem />} />
        <Route path="checagem/final/:id" element={<CheckagemFinal />} />
        
        {/* Fluxo de Concluídos */}
        <Route path="concluidos" element={<Concluido />} />
        
        {/* Fluxo de Relatórios */}
        <Route path="relatorios" element={<Relatorios />} />
        <Route path="relatorios/detalhado/:id" element={<RelatorioDetalhado />} />
        <Route path="relatorios/preview" element={<RelatorioPreview />} />
        
        {/* Fluxo de Sucateamento */}
        <Route path="sucateamento" element={<Sucateamento />} />
        <Route path="sucateamento/validar/:id" element={<ScrapValidationForm />} />

        {/* Handle all other routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
