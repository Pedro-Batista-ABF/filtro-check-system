
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { checkConnectionHealth, checkSupabaseConnection } from '@/utils/connectionUtils';
import { toast } from 'sonner';

export function useConnectionAuth() {
  const navigate = useNavigate();
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [authVerified, setAuthVerified] = useState(false);
  const [forceRefreshing, setForceRefreshing] = useState(false);
  const [lastConnectionAttempt, setLastConnectionAttempt] = useState(Date.now());
  const [retryAttempts, setRetryAttempts] = useState(0);
  const MAX_RETRY_ATTEMPTS = 3;

  const checkAuth = useCallback(async () => {
    try {
      console.log("useConnectionAuth: Verificando autenticação...");
      
      // Verificar a saúde da conexão
      const healthResult = await checkConnectionHealth();
      
      if (healthResult.status === 'offline') {
        console.warn(`useConnectionAuth: Conexão offline - Motivo: ${healthResult.reason}`);
        setConnectionStatus('offline');
        return false;
      }
      
      setConnectionStatus('online');
      
      // Verificar a sessão
      const { data } = await supabase.auth.getSession();
      const isAuth = !!data?.session?.user;
      
      if (!isAuth) {
        console.warn("useConnectionAuth: Usuário não autenticado");
        
        // Se estiver em uma rota protegida, redirecionar para login
        const currentPath = window.location.pathname;
        if (currentPath !== '/login' && currentPath !== '/register') {
          console.log("useConnectionAuth: Redirecionando para página de login");
          toast.info("Sessão expirada", {
            description: "Por favor, faça login novamente"
          });
          navigate('/login');
        }
      } else {
        console.log(`useConnectionAuth: Usuário autenticado: ${data.session.user.id.substring(0, 8)}...`);
      }
      
      setAuthVerified(true);
      setRetryAttempts(0);
      return true;
    } catch (error) {
      console.error("useConnectionAuth: Erro ao verificar autenticação:", error);
      setConnectionStatus('offline');
      setRetryAttempts(prev => Math.min(prev + 1, MAX_RETRY_ATTEMPTS));
      return false;
    }
  }, [navigate]);
  
  useEffect(() => {
    checkAuth();
    // Verificar periodicamente
    const interval = setInterval(checkAuth, 60000);
    return () => clearInterval(interval);
  }, [checkAuth]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    if (connectionStatus === 'offline') {
      // Implementação de backoff exponencial para novas tentativas
      const backoffTime = Math.min(5000 * Math.pow(2, retryAttempts), 30000);
      
      interval = setInterval(async () => {
        const now = Date.now();
        // Prevenir tentativas de reconexão muito frequentes
        if (now - lastConnectionAttempt < backoffTime) {
          return;
        }
        
        setLastConnectionAttempt(now);
        console.log(`useConnectionAuth: Tentando reconectar... Tentativa ${retryAttempts + 1} (Backoff: ${backoffTime}ms)`, new Date().toISOString());
        
        // Verificar se há conexão com a internet primeiro
        const isConnected = await checkSupabaseConnection();
        if (isConnected) {
          setConnectionStatus('online');
          toast.success("Conexão estabelecida", {
            description: "A conexão com o servidor foi restaurada"
          });
          clearInterval(interval);
          // Verificar autenticação após reconexão bem-sucedida
          await checkAuth();
        }
      }, backoffTime);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [connectionStatus, lastConnectionAttempt, retryAttempts, checkAuth]);

  const handleForceRefresh = () => {
    setForceRefreshing(true);
    window.location.reload();
  };
  
  const handleRetryConnection = async () => {
    setConnectionStatus('checking');
    setLastConnectionAttempt(Date.now());
    
    toast.info("Verificando conexão", {
      description: "Tentando reconectar ao servidor..."
    });
    
    try {
      // Verificar conexão e autenticação
      const result = await checkAuth();
      
      if (result) {
        setRetryAttempts(0);
        toast.success("Conexão estabelecida", {
          description: "A conexão com o servidor foi restaurada"
        });
      } else {
        setRetryAttempts(prev => Math.min(prev + 1, MAX_RETRY_ATTEMPTS));
        toast.error("Falha na conexão", {
          description: "Não foi possível estabelecer conexão com o servidor"
        });
      }
    } catch (error) {
      console.error("useConnectionAuth: Erro ao tentar reconectar:", error);
      setConnectionStatus('offline');
      setRetryAttempts(prev => Math.min(prev + 1, MAX_RETRY_ATTEMPTS));
      toast.error("Falha na conexão", {
        description: "Tempo limite excedido ao tentar conectar ao servidor"
      });
    }
  };

  return {
    connectionStatus,
    authVerified,
    forceRefreshing,
    retryAttempts,
    handleForceRefresh,
    handleRetryConnection
  };
}
