
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './contexts/AuthContext';
import { ApiProvider } from './contexts/ApiContext';
import { ApiContextExtendedProvider } from './contexts/ApiContextExtended';
import { Toaster } from 'sonner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Suspense } from 'react';

const root = createRoot(document.getElementById("root")!);

// Configuração do cliente de consulta com retry mais tolerante e cache mais longo
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 5,  // Aumentado para 5 tentativas
      retryDelay: attemptIndex => Math.min(1000 * Math.pow(2, attemptIndex), 30000),  // Backoff exponencial
      staleTime: 5 * 60 * 1000, // 5 minutos (reduzido para obter dados mais frescos)
      cacheTime: 30 * 60 * 1000, // 30 minutos
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,  // Buscar novamente ao reconectar
    },
  },
});

// Configuração global para fazer fetch timeouts
const originalFetch = window.fetch;
window.fetch = function timeoutFetch(url, options = {}) {
  const timeout = 15000; // 15 segundos timeout global (aumentado para redes mais lentas)
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  // Se já existe um signal, precisamos combiná-lo com nosso controller
  let signal = controller.signal;
  if (options.signal) {
    signal = options.signal;
    // Adicionar um listener ao original signal para abortar nosso controller
    options.signal.addEventListener('abort', () => controller.abort());
  }
  
  const fetchOptions = {
    ...options,
    signal
  };
  
  return originalFetch(url, fetchOptions)
    .then(response => {
      clearTimeout(timeoutId);
      return response;
    })
    .catch(error => {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        console.error(`Fetch timeout for ${url}: Limite de tempo excedido (${timeout}ms)`);
        // Facilitar o debug adicionando informação de timeout
        const timeoutError = new Error(`Timeout de ${timeout}ms excedido para ${url}`);
        timeoutError.name = 'FetchTimeoutError';
        throw timeoutError;
      }
      
      console.error(`Fetch error for ${url}:`, error);
      throw error;
    });
};

// Implementando detector de status de conexão
function setupConnectionMonitoring() {
  const updateOnlineStatus = () => {
    const isOnline = navigator.onLine;
    document.body.classList.toggle('app-offline', !isOnline);
    
    if (isOnline) {
      console.log('🟢 Conexão restabelecida');
    } else {
      console.log('🔴 Conexão perdida');
    }
  };
  
  // Monitoramento de status de conexão
  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
  
  // Verificar status inicial
  updateOnlineStatus();
  
  // Verificar mudanças de latência
  let lastPingTime = 0;
  setInterval(() => {
    if (!navigator.onLine) return;
    
    const startTime = Date.now();
    // Só fazer o ping se a última verificação foi há mais de 30s
    if (startTime - lastPingTime > 30000) {
      lastPingTime = startTime;
      
      // Fazer um ping leve para verificar latência
      fetch('https://yjcyebiahnwfwrcgqlcm.supabase.co/rest/v1/', {
        method: 'HEAD',
        cache: 'no-store',
        signal: AbortSignal.timeout(5000)
      })
      .then(() => {
        const latency = Date.now() - startTime;
        if (latency > 2000) {
          console.warn(`⚠️ Alta latência detectada: ${latency}ms`);
        }
      })
      .catch(() => {
        // Ignorar erros de ping
      });
    }
  }, 60000); // Verificar a cada minuto
}

// Interceptar erros não capturados na aplicação
window.addEventListener('error', (event) => {
  console.error('Uncaught error:', event.error);
});

// Interceptar promessas rejeitadas não capturadas
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

// Iniciar monitoramento de conexão
setupConnectionMonitoring();

// Botão de diagnóstico para testes de conexão (apenas em desenvolvimento)
if (import.meta.env.DEV) {
  const createDebugButton = () => {
    const button = document.createElement('button');
    button.innerText = 'Testar Conexão';
    button.style.position = 'fixed';
    button.style.bottom = '10px';
    button.style.right = '10px';
    button.style.zIndex = '9999';
    button.style.padding = '8px 12px';
    button.style.background = '#4f46e5';
    button.style.color = 'white';
    button.style.border = 'none';
    button.style.borderRadius = '4px';
    button.style.cursor = 'pointer';
    button.onclick = async () => {
      try {
        const startTime = Date.now();
        const response = await fetch('https://yjcyebiahnwfwrcgqlcm.supabase.co/rest/v1/', {
          method: 'HEAD',
          cache: 'no-cache',
        });
        const endTime = Date.now();
        const elapsed = endTime - startTime;
        
        if (response.ok) {
          console.log(`✅ Conexão OK (${elapsed}ms)`);
          alert(`Conexão OK! Tempo: ${elapsed}ms`);
        } else {
          console.error(`❌ Erro de conexão: ${response.status} (${elapsed}ms)`);
          alert(`Erro de conexão: ${response.status} - Tempo: ${elapsed}ms`);
        }
      } catch (error) {
        console.error('❌ Erro ao testar conexão:', error);
        alert(`Falha no teste: ${error.message}`);
      }
    };
    document.body.appendChild(button);
  };
  
  // Adicionar botão após o carregamento do DOM
  window.addEventListener('DOMContentLoaded', createDebugButton);
}

root.render(
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ApiProvider>
          <ApiContextExtendedProvider>
            <Suspense fallback={<div>Carregando...</div>}>
              <App />
            </Suspense>
            <Toaster 
              position="top-right"
              richColors 
              closeButton
              expand={false}
              toastOptions={{
                duration: 5000,
              }}
            />
          </ApiContextExtendedProvider>
        </ApiProvider>
      </AuthProvider>
    </QueryClientProvider>
  </BrowserRouter>
);
