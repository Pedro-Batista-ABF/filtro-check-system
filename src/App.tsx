
import { useState } from "react";
import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ApiProvider } from "@/contexts/ApiContext";
import { ApiContextExtendedProvider } from "@/contexts/ApiContextExtended";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

// Pages
import HomePage from "@/pages/Home";
import LoginPage from "@/pages/Login";
import RegisterPage from "@/pages/Register";
import SettingsPage from "@/pages/Settings";
import PeritagemPage from "@/pages/Peritagem";
import ExecucaoPage from "@/pages/Execucao";
import LandingPage from "@/pages/Landing";
import PeritagemForm from "@/pages/PeritagemForm";
import ExecucaoForm from "@/pages/ExecucaoForm";
import NotFound from "@/pages/NotFound";
import CheckagemPage from "@/pages/Checagem";
import CheckagemFinal from "@/pages/CheckagemFinal";
import CheckagemForm from "@/pages/CheckagemForm";
import SucateamentoPage from "@/pages/Sucateamento";
import ScrapValidationForm from "@/pages/ScrapValidationForm";
import ConsolidatedReport from "@/pages/ConsolidatedReport";
import ReportPreview from "@/pages/ReportPreview";

// Importar temas
import "./index.css";

// Função principal do App
export default function App() {
  const [status, setStatus] = useState<
    "loading" | "authenticated" | "not-authenticated"
  >("loading");

  return (
    <TooltipProvider>
      <AuthProvider>
        <ApiProvider>
          <ApiContextExtendedProvider>
            <Toaster position="top-right" />
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Rotas protegidas */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <HomePage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <SettingsPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/peritagem"
                element={
                  <ProtectedRoute>
                    <PeritagemPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/peritagem/novo"
                element={
                  <ProtectedRoute>
                    <PeritagemForm />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/peritagem/:id"
                element={
                  <ProtectedRoute>
                    <PeritagemForm />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/execucao"
                element={
                  <ProtectedRoute>
                    <ExecucaoPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/execucao/:id"
                element={
                  <ProtectedRoute>
                    <ExecucaoForm />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/checagem"
                element={
                  <ProtectedRoute>
                    <CheckagemPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/checagem-final"
                element={
                  <ProtectedRoute>
                    <CheckagemFinal />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/checagem/:id"
                element={
                  <ProtectedRoute>
                    <CheckagemForm />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/sucateamento"
                element={
                  <ProtectedRoute>
                    <SucateamentoPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/sucateamento/:id"
                element={
                  <ProtectedRoute>
                    <ScrapValidationForm />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/relatorio"
                element={
                  <ProtectedRoute>
                    <ConsolidatedReport />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/relatorio-preview"
                element={
                  <ProtectedRoute>
                    <ReportPreview />
                  </ProtectedRoute>
                }
              />

              {/* Redirecionamento e Rota 404 */}
              <Route
                path="*"
                element={<NotFound />}
              />
            </Routes>
          </ApiContextExtendedProvider>
        </ApiProvider>
      </AuthProvider>
    </TooltipProvider>
  );
}
