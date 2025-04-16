
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'
import { AuthProvider } from './contexts/AuthContext'
import { ApiProvider } from './contexts/ApiContext'
import { ApiContextExtendedProvider } from './contexts/ApiContextExtended'
import { Toaster } from "sonner";

const root = createRoot(document.getElementById("root")!);

// Configuração global para fazer fetch timeouts
const originalFetch = window.fetch;
window.fetch = function timeoutFetch(url, options = {}) {
  const timeout = 15000; // 15 segundos timeout global
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  const fetchOptions = {
    ...options,
    signal: controller.signal,
  };
  
  return originalFetch(url, fetchOptions)
    .then(response => {
      clearTimeout(timeoutId);
      return response;
    })
    .catch(error => {
      clearTimeout(timeoutId);
      console.error(`Fetch error for ${url}:`, error);
      throw error;
    });
};

// Interceptar erros não capturados na aplicação
window.addEventListener('error', (event) => {
  console.error('Uncaught error:', event.error);
  // Poderia adicionar uma métrica ou enviar para um serviço de monitoramento
});

// Interceptar promessas rejeitadas não capturadas
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  // Poderia adicionar uma métrica ou enviar para um serviço de monitoramento
});

root.render(
  <BrowserRouter>
    <AuthProvider>
      <ApiProvider>
        <ApiContextExtendedProvider>
          <App />
          <Toaster 
            richColors 
            position="top-right" 
            closeButton
            expand={false}
            toastOptions={{
              duration: 5000,
              className: "my-toast-class"
            }}
          />
        </ApiContextExtendedProvider>
      </ApiProvider>
    </AuthProvider>
  </BrowserRouter>
);
