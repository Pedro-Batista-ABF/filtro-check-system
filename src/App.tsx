
import { Route, Routes, Outlet } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";

import PageLayoutWrapper from "@/components/layout/PageLayoutWrapper";
import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import Peritagem from "@/pages/Peritagem";
import PeritagemForm from "@/pages/PeritagemForm";
import Execucao from "@/pages/Execucao";
import CheckagemFinal from "@/pages/CheckagemFinal";
import Concluidos from "@/pages/Concluidos";
import ExecucaoDetails from "@/pages/ExecucaoDetails";
import CheckagemForm from "@/pages/CheckagemForm";
import SectorReport from "@/pages/SectorReport";
import ScrapValidation from "@/pages/ScrapValidation";
import ScrapValidationForm from "@/pages/ScrapValidationForm";
import Login from "@/pages/Login";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import ConsolidatedReport from "@/pages/ConsolidatedReport";
import { useApi } from "@/contexts/ApiContextExtended";

const App = () => {
  const { isAuthenticated } = useApi();

  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={
          <ProtectedRoute>
            <PageLayoutWrapper>
              <Outlet />
            </PageLayoutWrapper>
          </ProtectedRoute>
        }>
          <Route index element={<Index />} />
          <Route path="peritagem" element={<Peritagem />} />
          <Route path="peritagem/novo" element={<PeritagemForm />} />
          <Route path="peritagem/editar/:id" element={<PeritagemForm />} />
          <Route path="execucao" element={<Execucao />} />
          <Route path="execucao/:id" element={<ExecucaoDetails />} />
          <Route path="checagem" element={<CheckagemFinal />} />
          <Route path="checagem/:id" element={<CheckagemForm />} />
          <Route path="concluidos" element={<Concluidos />} />
          <Route path="sucateamento" element={<ScrapValidation />} />
          <Route path="sucateamento/:id" element={<ScrapValidationForm />} />
          <Route path="setor/:id" element={<SectorReport />} />
          <Route path="relatorio" element={<ConsolidatedReport />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
      <Toaster />
    </>
  );
};

export default App;
