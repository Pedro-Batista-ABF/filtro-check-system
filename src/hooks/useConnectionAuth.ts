
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { checkSupabaseConnection } from '@/utils/serviceUtils';
import { toast } from 'sonner';

export function useConnectionAuth() {
  const navigate = useNavigate();
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [authVerified, setAuthVerified] = useState(false);
  const [forceRefreshing, setForceRefreshing] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const isAuth = !!data.session?.user;
        
        if (!isAuth) {
          console.error("useConnectionAuth: Usuário não autenticado na verificação direta");
          toast.error("Sessão expirada", {
            description: "Faça login novamente para continuar"
          });
          navigate('/login');
          return;
        }
        
        console.log("useConnectionAuth: Autenticação verificada:", data.session.user.id);
        setAuthVerified(true);
        
        const isConnected = await checkSupabaseConnection();
        setConnectionStatus(isConnected ? 'online' : 'offline');
        
        if (!isConnected) {
          toast.error("Problemas de conexão", {
            description: "Não foi possível estabelecer uma conexão estável com o servidor"
          });
        }
      } catch (error) {
        console.error("useConnectionAuth: Erro ao verificar autenticação:", error);
        setConnectionStatus('offline');
      }
    };
    
    checkAuth();
  }, [navigate]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    if (connectionStatus === 'offline') {
      interval = setInterval(async () => {
        console.log("useConnectionAuth: Tentando reconectar...");
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
  }, [connectionStatus]);

  const handleForceRefresh = () => {
    setForceRefreshing(true);
    window.location.reload();
  };

  return {
    connectionStatus,
    authVerified,
    forceRefreshing,
    handleForceRefresh
  };
}
