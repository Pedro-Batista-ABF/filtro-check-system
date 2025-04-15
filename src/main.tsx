
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'
import { AuthProvider } from './contexts/AuthContext'
import { ApiContextExtendedProvider } from './contexts/ApiContextExtended'
import { Toaster } from "sonner";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <AuthProvider>
      <ApiContextExtendedProvider>
        <App />
        <Toaster richColors position="top-right" />
      </ApiContextExtendedProvider>
    </AuthProvider>
  </BrowserRouter>
);
