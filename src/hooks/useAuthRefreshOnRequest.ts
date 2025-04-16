
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { checkConnectionHealth, refreshAuthSession, ensureValidAuthentication, runConnectionDiagnostics } from '@/utils/connectionUtils';

export function useAuthRefreshOnRequest() {
  const [refreshing, setRefreshing] = useState(false);
  const [connectionHealth, setConnectionHealth] = useState<{
    status: 'online' | 'offline' | 'checking';
    reason?: string;
  }>({ status: 'checking' });

  const executeWithAuthCheck = useCallback(async (
    callback: () => Promise<any>,
    options?: {
      showSuccessToast?: boolean;
      successMessage?: string;
      errorMessage?: string;
    }
  ) => {
    try {
      // Verificar saúde da conexão
      setConnectionHealth({ status: 'checking' });
      const health = await checkConnectionHealth();
      setConnectionHealth(health);
      
      if (health.status !== 'online') {
        if (health.reason === 'no-session' || health.reason === 'invalid-token') {
          setRefreshing(true);
          
          // Tentar renovar a sessão
          const refreshed = await refreshAuthSession();
          setRefreshing(false);
          
          if (!refreshed) {
            toast.error("Sessão expirada", {
              description: "Por favor, faça login novamente."
            });
            
            // Forçar redirecionamento para página de login se necessário
            window.location.href = '/login';
            return null;
          }
        } else {
          toast.error("Erro de conexão", {
            description: `Não foi possível estabelecer conexão com o servidor (${health.reason})`
          });
          return null;
        }
      }
      
      // Executar o callback
      const result = await callback();
      
      if (options?.showSuccessToast) {
        toast.success(options.successMessage || "Operação realizada com sucesso");
      }
      
      return result;
    } catch (error) {
      console.error("Erro ao executar operação:", error);
      
      toast.error(options?.errorMessage || "Erro ao executar operação", {
        description: error instanceof Error ? error.message : "Tente novamente ou faça login novamente."
      });
      
      return null;
    }
  }, []);
  
  const forceAuthCheck = useCallback(async (): Promise<boolean> => {
    try {
      setRefreshing(true);
      
      // Verificar saúde da conexão
      const health = await checkConnectionHealth();
      setConnectionHealth(health);
      
      if (health.status !== 'online') {
        if (health.reason === 'no-session' || health.reason === 'invalid-token') {
          // Tentar renovar a sessão
          const refreshed = await refreshAuthSession();
          
          if (!refreshed) {
            toast.error("Sessão expirada", {
              description: "Por favor, faça login novamente."
            });
            return false;
          }
          
          // Verificar novamente após refresh
          const newHealth = await checkConnectionHealth();
          setConnectionHealth(newHealth);
          
          return newHealth.status === 'online';
        } else {
          toast.error("Erro de conexão", {
            description: `Não foi possível estabelecer conexão com o servidor (${health.reason})`
          });
          return false;
        }
      }
      
      return true;
    } catch (error) {
      console.error("Erro ao verificar autenticação:", error);
      return false;
    } finally {
      setRefreshing(false);
    }
  }, []);
  
  return { 
    executeWithAuthCheck, 
    refreshing, 
    connectionHealth,
    forceAuthCheck
  };
}
