
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { checkSupabaseConnection } from '@/utils/serviceUtils';
import { toast } from 'sonner';

export function useConnectionAuth() {
  const navigate = useNavigate();
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [authVerified, setAuthVerified] = useState(false);
  const [forceRefreshing, setForceRefreshing] = useState(false);
  const [lastConnectionAttempt, setLastConnectionAttempt] = useState(Date.now());

  const checkAuth = useCallback(async () => {
    try {
      console.log("useConnectionAuth: Verificando autenticação...");
      const { data } = await supabase.auth.getSession();
      const isAuth = !!data.session?.user;
      
      if (!isAuth) {
        console.error("useConnectionAuth: Usuário não autenticado na verificação direta");
        toast.error("Sessão expirada", {
          description: "Faça login novamente para continuar"
        });
        navigate('/login');
        return false;
      }
      
      console.log("useConnectionAuth: Autenticação verificada:", data.session.user.id);
      setAuthVerified(true);
      
      const isConnected = await checkSupabaseConnection();
      setConnectionStatus(isConnected ? 'online' : 'offline');
      
      if (!isConnected) {
        console.warn("useConnectionAuth: Não foi possível estabelecer conexão com o servidor");
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("useConnectionAuth: Erro ao verificar autenticação:", error);
      setConnectionStatus('offline');
      return false;
    }
  }, [navigate]);
  
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    if (connectionStatus === 'offline') {
      interval = setInterval(async () => {
        const now = Date.now();
        // Prevenir tentativas de reconexão muito frequentes
        if (now - lastConnectionAttempt < 5000) {
          return;
        }
        
        setLastConnectionAttempt(now);
        console.log("useConnectionAuth: Tentando reconectar...", new Date().toISOString());
        
        const isConnected = await checkSupabaseConnection();
        if (isConnected) {
          setConnectionStatus('online');
          toast.success("Conexão estabelecida", {
            description: "A conexão com o servidor foi restaurada"
          });
          clearInterval(interval);
        }
      }, 10000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [connectionStatus, lastConnectionAttempt]);

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
    
    const isConnected = await checkSupabaseConnection();
    setConnectionStatus(isConnected ? 'online' : 'offline');
    
    if (isConnected) {
      toast.success("Conexão estabelecida", {
        description: "A conexão com o servidor foi restaurada"
      });
      // Revalidar autenticação
      await checkAuth();
    } else {
      toast.error("Falha na conexão", {
        description: "Não foi possível estabelecer conexão com o servidor"
      });
    }
  };

  return {
    connectionStatus,
    authVerified,
    forceRefreshing,
    handleForceRefresh,
    handleRetryConnection
  };
}
