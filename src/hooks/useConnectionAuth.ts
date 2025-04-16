
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { checkConnectionHealth, checkSupabaseConnection, checkSupabaseAuth, ensureValidAuthentication } from '@/utils/connectionUtils';
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
      
      // Verificar a autenticação
      const isAuth = await ensureValidAuthentication();
      
      if (!isAuth) {
        console.warn("useConnectionAuth: Usuário não autenticado ou token expirado");
        
        // Se estiver em uma rota protegida, redirecionar para login
        const currentPath = window.location.pathname;
        if (currentPath !== '/login' && currentPath !== '/register') {
          console.log("useConnectionAuth: Redirecionando para página de login");
          toast.info("Sessão expirada", {
            description: "Por favor, faça login novamente"
          });
          navigate('/login');
        }
        return false;
      }
      
      console.log("useConnectionAuth: Usuário autenticado com sucesso");
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
          // Se conectou com Supabase, verificar autenticação
          const isAuth = await checkSupabaseAuth();
          
          if (isAuth) {
            setConnectionStatus('online');
            toast.success("Conexão estabelecida", {
              description: "A conexão com o servidor foi restaurada."
            });
            clearInterval(interval);
            setAuthVerified(true);
          } else {
            console.log("Conexão restaurada, mas autenticação falhou");
            setConnectionStatus('online'); // Pelo menos a conexão foi restaurada
            // Verificar se está em uma página protegida
            const currentPath = window.location.pathname;
            if (currentPath !== '/login' && currentPath !== '/register') {
              toast.warning("Sessão expirada", {
                description: "Por favor, faça login novamente."
              });
              navigate('/login'); // Redirecionar para login
            }
            clearInterval(interval);
          }
        }
      }, backoffTime);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [connectionStatus, lastConnectionAttempt, retryAttempts, navigate]);

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
        
        // Verificar se a conexão está ok, mas a autenticação falhou
        const isConnected = await checkSupabaseConnection();
        if (isConnected) {
          toast.warning("Sessão expirada", {
            description: "Por favor, faça login novamente"
          });
          navigate('/login');
        } else {
          toast.error("Falha na conexão", {
            description: "Não foi possível estabelecer conexão com o servidor"
          });
        }
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
