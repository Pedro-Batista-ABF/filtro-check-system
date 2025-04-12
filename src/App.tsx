import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ApiProvider } from "./contexts/ApiContextExtended";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
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
    <AuthProvider>
      <ApiProvider>
        <TooltipProvider>
          <SonnerToaster />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              
              {/* Protected routes */}
              <Route path="/" element={
                <ProtectedRoute>
                  <Index />
                </ProtectedRoute>
              } />
              <Route path="/peritagem" element={
                <ProtectedRoute>
                  <Peritagem />
                </ProtectedRoute>
              } />
              <Route path="/peritagem/novo" element={
                <ProtectedRoute>
                  <PeritagemForm />
                </ProtectedRoute>
              } />
              <Route path="/peritagem/:id" element={
                <ProtectedRoute>
                  <PeritagemForm />
                </ProtectedRoute>
              } />
              <Route path="/execucao" element={
                <ProtectedRoute>
                  <Execucao />
                </ProtectedRoute>
              } />
              <Route path="/execucao/:id" element={
                <ProtectedRoute>
                  <ExecucaoDetails />
                </ProtectedRoute>
              } />
              <Route path="/checagem" element={
                <ProtectedRoute>
                  <Checagem />
                </ProtectedRoute>
              } />
              <Route path="/checagem-final" element={
                <ProtectedRoute>
                  <CheckagemFinal />
                </ProtectedRoute>
              } />
              <Route path="/checagem/:id" element={
                <ProtectedRoute>
                  <CheckagemForm />
                </ProtectedRoute>
              } />
              <Route path="/sucateamento" element={
                <ProtectedRoute>
                  <ScrapValidation />
                </ProtectedRoute>
              } />
              <Route path="/sucateamento/:id" element={
                <ProtectedRoute>
                  <ScrapValidationForm />
                </ProtectedRoute>
              } />
              <Route path="/concluidos" element={
                <ProtectedRoute>
                  <Concluidos />
                </ProtectedRoute>
              } />
              <Route path="/setor/:id" element={
                <ProtectedRoute>
                  <SectorReport />
                </ProtectedRoute>
              } />
              <Route path="/relatorios" element={
                <ProtectedRoute>
                  <ConsolidatedReport />
                </ProtectedRoute>
              } />
              <Route path="/relatorio-preview" element={
                <ProtectedRoute>
                  <ReportPreview />
                </ProtectedRoute>
              } />
              
              {/* Fallback route - redirect to login */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
          <Toaster />
        </TooltipProvider>
      </ApiProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
