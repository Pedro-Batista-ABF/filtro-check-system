
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import App from "./App";
import { Toaster } from "sonner";
import "./index.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ApiContextExtendedProvider } from "@/contexts/ApiContextExtended";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider attribute="class" defaultTheme="light">
        <AuthProvider>
          <ApiContextExtendedProvider>
            <Toaster richColors closeButton position="top-right" />
            <App />
          </ApiContextExtendedProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
