
import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import AuthProvider from "@/contexts/AuthContext";
import ApiContextProvider from "@/contexts/ApiContextExtended";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { createConsole, ConsoleProvider } from "@/contexts/ConsoleProvider";

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

// Permitir que o console seja acessado pela janela
window.createConsole = createConsole;

// Inicializar console do sistema
const systemConsole = createConsole();

// Função principal do App
export default function App() {
  const [status, setStatus] = useState<
    "loading" | "authenticated" | "not-authenticated"
  >("loading");

  return (
    <ConsoleProvider console={systemConsole}>
      <TooltipProvider>
        <Router>
          <AuthProvider setStatus={setStatus}>
            <ApiContextProvider>
              <Toaster position="top-right" />
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Rotas protegidas */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute status={status}>
                      <HomePage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute status={status}>
                      <SettingsPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/peritagem"
                  element={
                    <ProtectedRoute status={status}>
                      <PeritagemPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/peritagem/novo"
                  element={
                    <ProtectedRoute status={status}>
                      <PeritagemForm />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/peritagem/:id"
                  element={
                    <ProtectedRoute status={status}>
                      <PeritagemForm />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/execucao"
                  element={
                    <ProtectedRoute status={status}>
                      <ExecucaoPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/execucao/:id"
                  element={
                    <ProtectedRoute status={status}>
                      <ExecucaoForm />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/checagem"
                  element={
                    <ProtectedRoute status={status}>
                      <CheckagemPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/checagem-final"
                  element={
                    <ProtectedRoute status={status}>
                      <CheckagemFinal />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/checagem/:id"
                  element={
                    <ProtectedRoute status={status}>
                      <CheckagemForm />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/sucateamento"
                  element={
                    <ProtectedRoute status={status}>
                      <SucateamentoPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/sucateamento/:id"
                  element={
                    <ProtectedRoute status={status}>
                      <ScrapValidationForm />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/relatorio"
                  element={
                    <ProtectedRoute status={status}>
                      <ConsolidatedReport />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/relatorio-preview"
                  element={
                    <ProtectedRoute status={status}>
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
            </ApiContextProvider>
          </AuthProvider>
        </Router>
      </TooltipProvider>
    </ConsoleProvider>
  );
}
