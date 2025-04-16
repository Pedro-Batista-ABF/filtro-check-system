
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { checkSupabaseConnection } from '@/utils/connectionUtils';
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
      
      // Adicionado um timeout para a verificação de autenticação
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Timeout ao verificar autenticação")), 8000);
      });
      
      const authPromise = supabase.auth.getSession();
      
      // Race entre o timeout e a chamada de autenticação
      const { data } = await Promise.race([authPromise, timeoutPromise]) as any;
      const isAuth = !!data?.session?.user;
      
      if (!isAuth) {
        console.error("useConnectionAuth: Usuário não autenticado na verificação direta");
        // Comentado temporariamente para evitar redirecionamentos constantes
        // toast.error("Sessão expirada", {
        //   description: "Faça login novamente para continuar"
        // });
        // navigate('/login');
        // return false;
      }
      
      console.log("useConnectionAuth: Autenticação verificada:", data?.session?.user?.id || "não encontrada");
      setAuthVerified(true);
      
      const isConnected = await checkSupabaseStatus();
      setConnectionStatus(isConnected ? 'online' : 'offline');
      
      if (isConnected) {
        // Reset retry attempts on successful connection
        setRetryAttempts(0);
      } else {
        console.warn("useConnectionAuth: Não foi possível estabelecer conexão com o servidor");
        // Increment retry attempts on failure
        setRetryAttempts(prev => Math.min(prev + 1, MAX_RETRY_ATTEMPTS));
        return false;
      }
      
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
        
        const isConnected = await checkSupabaseStatus();
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
      // Adicionar um timeout para a tentativa de reconexão
      const timeoutPromise = new Promise<boolean>((_, reject) => {
        setTimeout(() => reject(new Error("Timeout ao verificar conexão")), 8000);
      });
      
      const connectionPromise = checkSupabaseStatus();
      
      // Race entre o timeout e a verificação de conexão
      const isConnected = await Promise.race([connectionPromise, timeoutPromise]);
      
      setConnectionStatus(isConnected ? 'online' : 'offline');
      
      if (isConnected) {
        setRetryAttempts(0);
        toast.success("Conexão estabelecida", {
          description: "A conexão com o servidor foi restaurada"
        });
        // Revalidar autenticação
        await checkAuth();
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

  async function checkSupabaseStatus() {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL || "https://yjcyebiahnwfwrcgqlcm.supabase.co"}/rest/v1/`,
        {
          method: 'HEAD',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: AbortSignal.timeout(8000),
        }
      );
      return response.ok;
    } catch (error) {
      console.error("Erro ao verificar status do Supabase:", error);
      return false;
    }
  }

  return {
    connectionStatus,
    authVerified,
    forceRefreshing,
    retryAttempts,
    handleForceRefresh,
    handleRetryConnection
  };
}
