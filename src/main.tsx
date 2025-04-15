
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'
import { ApiProvider as ApiProviderOriginal } from './contexts/ApiContext'
import { ApiProvider } from './contexts/ApiContextExtended'
import { AuthProvider } from './contexts/AuthContext'
import { Toaster } from "sonner";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <AuthProvider>
      <ApiProviderOriginal>
        <ApiProvider>
          <App />
          <Toaster richColors position="top-right" />
        </ApiProvider>
      </ApiProviderOriginal>
    </AuthProvider>
  </BrowserRouter>
);
