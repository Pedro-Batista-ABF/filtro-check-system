
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ApiProvider } from "./contexts/ApiContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Peritagem from "./pages/Peritagem";
import PeritagemForm from "./pages/PeritagemForm";
import Execucao from "./pages/Execucao";
import ExecucaoDetails from "./pages/ExecucaoDetails";
import Checagem from "./pages/Checagem";
import CheckagemFinal from "./pages/CheckagemFinal";
import CheckagemForm from "./pages/CheckagemForm";
import SectorReport from "./pages/SectorReport";
import ConsolidatedReport from "./pages/ConsolidatedReport";
import ReportPreview from "./pages/ReportPreview";
import ScrapValidation from "./pages/ScrapValidation";
import ScrapValidationForm from "./pages/ScrapValidationForm";
import Concluidos from "./pages/Concluidos";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ApiProvider>
      <TooltipProvider>
        <Toaster />
        <SonnerToaster />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/peritagem" element={<Peritagem />} />
            <Route path="/peritagem/novo" element={<PeritagemForm />} />
            <Route path="/peritagem/:id" element={<PeritagemForm />} />
            <Route path="/execucao" element={<Execucao />} />
            <Route path="/execucao/:id" element={<ExecucaoDetails />} />
            <Route path="/checagem" element={<Checagem />} />
            <Route path="/checagem-final" element={<CheckagemFinal />} />
            <Route path="/checagem/:id" element={<CheckagemForm />} />
            <Route path="/sucateamento" element={<ScrapValidation />} />
            <Route path="/sucateamento/:id" element={<ScrapValidationForm />} />
            <Route path="/concluidos" element={<Concluidos />} />
            <Route path="/setor/:id" element={<SectorReport />} />
            <Route path="/relatorios" element={<ConsolidatedReport />} />
            <Route path="/relatorio-preview" element={<ReportPreview />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ApiProvider>
  </QueryClientProvider>
);

export default App;
