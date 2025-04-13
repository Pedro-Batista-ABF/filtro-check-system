
import { Route, Routes, Outlet } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";

import Header from "@/components/layout/Header";
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
import ConsolidatedReport from "@/pages/ConsolidatedReport";
import Checagem from "@/pages/Checagem";

const App = () => {
  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={
          <div className="min-h-screen flex flex-col bg-gray-50">
            <Header HeaderExtra={null} />
            <main className="flex-1 container mx-auto px-4 py-8">
              <Outlet />
            </main>
            <footer className="bg-gray-100 py-4 text-center text-gray-600 text-sm">
              <p>© {new Date().getFullYear()} Controle de Recuperação de Setores</p>
            </footer>
          </div>
        }>
          <Route index element={<Index />} />
          <Route path="peritagem" element={<Peritagem />} />
          <Route path="peritagem/novo" element={<PeritagemForm />} />
          <Route path="peritagem/editar/:id" element={<PeritagemForm />} />
          <Route path="execucao" element={<Execucao />} />
          <Route path="execucao/:id" element={<ExecucaoDetails />} />
          <Route path="checagem" element={<Checagem />} />
          <Route path="checagem-final" element={<CheckagemFinal />} />
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
