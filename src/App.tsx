
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
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
import CheckagemForm from "./pages/CheckagemForm";
import SectorReport from "./pages/SectorReport";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ApiProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/peritagem" element={<Peritagem />} />
            <Route path="/peritagem/novo" element={<PeritagemForm />} />
            <Route path="/peritagem/:id" element={<PeritagemForm />} />
            <Route path="/execucao" element={<Execucao />} />
            <Route path="/execucao/:id" element={<ExecucaoDetails />} />
            <Route path="/checagem" element={<Checagem />} />
            <Route path="/checagem/:id" element={<CheckagemForm />} />
            <Route path="/setor/:id" element={<SectorReport />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ApiProvider>
  </QueryClientProvider>
);

export default App;

