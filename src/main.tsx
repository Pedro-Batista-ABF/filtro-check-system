
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'
import { AuthProvider } from './contexts/AuthContext'
import { ApiProvider } from './contexts/ApiContext'
import { ApiContextExtendedProvider } from './contexts/ApiContextExtended'
import { Toaster } from "sonner";

const root = createRoot(document.getElementById("root")!);

root.render(
  <BrowserRouter>
    <AuthProvider>
      <ApiProvider>
        <ApiContextExtendedProvider>
          <App />
          <Toaster richColors position="top-right" />
        </ApiContextExtendedProvider>
      </ApiProvider>
    </AuthProvider>
  </BrowserRouter>
);
