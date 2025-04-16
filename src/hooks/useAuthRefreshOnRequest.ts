
import { useState, useEffect, useCallback } from 'react';
import { refreshAuthSession, supabase, performFullConnectivityTest } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

/**
 * Hook aprimorado para gerenciar o refresh automático do token em solicitações HTTP
 * e lidar com erros 401 de autenticação de forma mais robusta
 */
export const useAuthRefreshOnRequest = () => {
  const [lastTokenRefresh, setLastTokenRefresh] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sessionValid, setSessionValid] = useState<boolean | null>(null);
  const [connectionHealth, setConnectionHealth] = useState<'ok' | 'warning' | 'error' | 'unknown'>('unknown');
  const navigate = useNavigate();

  // Verificar sessão atual e estado da conexão
  useEffect(() => {
    const checkInitialState = async () => {
      try {
        setConnectionHealth('unknown');
        
        // Verificar sessão atual
        const { data } = await supabase.auth.getSession();
        const hasSession = !!data.session?.user?.id;
        setSessionValid(hasSession);
        
        if (hasSession) {
          // Verificar se o token está próximo de expirar
          const expiresAt = data.session.expires_at * 1000;
          const now = Date.now();
          const timeToExpire = expiresAt - now;
          
          // Se estiver perto de expirar, atualizar
          if (timeToExpire < 300000) { // menos de 5 minutos
            const refreshed = await refreshToken();
            
            if (!refreshed) {
              setConnectionHealth('warning');
              return;
            }
          }
          
          // Verificar a saúde da conexão
          try {
            const { error } = await supabase.from('profiles').select('id').limit(1);
            if (error) {
              console.warn("Conectado, mas com erro ao verificar perfis:", error);
              setConnectionHealth('warning');
            } else {
              setConnectionHealth('ok');
            }
          } catch (e) {
            console.error("Erro ao verificar saúde da conexão:", e);
            setConnectionHealth('warning');
          }
        } else {
          setConnectionHealth('error');
        }
      } catch (error) {
        console.error("Erro ao verificar sessão:", error);
        setSessionValid(false);
        setConnectionHealth('error');
      }
    };
    
    checkInitialState();
    
    // Verificar periodicamente
    const intervalId = setInterval(checkInitialState, 60000); // A cada minuto
    
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  // Fazer refresh do token com melhor tratamento de erros e lógica de retry
  const refreshToken = useCallback(async () => {
    if (isRefreshing) return false;
    
    const now = Date.now();
    // Evitar atualizações muito frequentes (máximo uma vez a cada 30 segundos)
    if (now - lastTokenRefresh < 30000) {
      console.log("Ignorando refresh (solicitação muito recente)");
      return true;
    }
    
    setIsRefreshing(true);
    
    try {
      // Implementar retry automático para o refresh
      let attempts = 0;
      const maxAttempts = 3;
      
      while (attempts < maxAttempts) {
        console.log(`Tentando refresh do token (tentativa ${attempts + 1}/${maxAttempts})...`);
        
        const refreshed = await refreshAuthSession();
        
        if (refreshed) {
          setLastTokenRefresh(now);
          setIsRefreshing(false);
          setSessionValid(true);
          setConnectionHealth('ok');
          console.log("Token atualizado com sucesso");
          return true;
        }
        
        attempts++;
        
        if (attempts < maxAttempts) {
          console.log(`Aguardando antes da próxima tentativa (${attempts}/${maxAttempts})...`);
          await new Promise(resolve => setTimeout(resolve, 1000 * attempts)); // Backoff exponencial
        }
      }
      
      // Se todas as tentativas falharam, verificar o estado da sessão
      const { data } = await supabase.auth.getSession();
      const hasValidSession = !!data.session?.user?.id;
      setSessionValid(hasValidSession);
      setConnectionHealth(hasValidSession ? 'warning' : 'error');
      
      if (!hasValidSession) {
        console.error("Todas as tentativas de refresh falharam. Sessão inválida.");
      }
      
      setIsRefreshing(false);
      return hasValidSession;
    } catch (error) {
      console.error("Erro crítico ao atualizar token:", error);
      setIsRefreshing(false);
      setSessionValid(false);
      setConnectionHealth('error');
      
      // Realizar diagnostico completo
      performFullConnectivityTest()
        .then(results => {
          console.log("Resultados do diagnóstico após falha no refresh:", results);
        })
        .catch(diagError => {
          console.error("Erro ao executar diagnóstico:", diagError);
        });
      
      return false;
    }
  }, [isRefreshing, lastTokenRefresh]);

  // Função aprimorada para executar operações com verificação de autenticação
  const executeWithAuthCheck = useCallback(async <T>(
    operation: () => Promise<T>,
    options: {
      redirectOnFailure?: boolean;
      showToastOnFailure?: boolean;
      maxRetries?: number;
    } = {}
  ): Promise<T | null> => {
    const { 
      redirectOnFailure = true, 
      showToastOnFailure = true,
      maxRetries = 2
    } = options;
    
    let attempts = 0;
    
    const executeAttempt = async (): Promise<T | null> => {
      attempts++;
      
      try {
        // Tenta a operação normalmente
        return await operation();
      } catch (error: any) {
        console.error(`Erro durante a operação (tentativa ${attempts}/${maxRetries + 1}):`, error);
        
        // Verificar se é um erro de autenticação (401/403)
        const isAuthError = 
          error.message?.includes('401') || 
          error.message?.includes('403') || 
          error.code === 'PGRST301' ||
          error.code === '401' ||
          (error.message && (
            error.message.includes('JWT') || 
            error.message.includes('token') || 
            error.message.includes('auth')
          ));
        
        if (isAuthError) {
          console.log(`Erro de autenticação detectado, tentando refresh do token (tentativa ${attempts})...`);
          
          // Tenta atualizar o token
          const refreshed = await refreshToken();
          
          if (refreshed && attempts <= maxRetries) {
            // Se conseguiu atualizar, tenta a operação novamente
            console.log(`Token atualizado, tentando operação novamente (tentativa ${attempts})...`);
            return executeAttempt();
          } else {
            // Se excedeu o número de tentativas ou não conseguiu renovar o token
            if (showToastOnFailure) {
              const message = attempts > maxRetries 
                ? "Número máximo de tentativas excedido" 
                : "Erro de autenticação";
              
              toast.error(message, {
                description: "Por favor, faça login novamente."
              });
            }
            
            if (redirectOnFailure) {
              // Redirecionar para o login 
              navigate('/login');
            }
            
            return null;
          }
        }
        
        // Se não for erro de autenticação, propaga o erro
        throw error;
      }
    };
    
    return executeAttempt();
  }, [navigate, refreshToken]);

  // Função para forçar verificação e correção da autenticação
  const forceAuthCheck = useCallback(async () => {
    const testResults = await performFullConnectivityTest();
    
    if (!testResults.success) {
      setConnectionHealth('error');
      
      // Se não está autenticado, redirecionar para login
      if (!testResults.authenticated) {
        toast.error("Sessão inválida", {
          description: "Por favor, faça login novamente"
        });
        navigate('/login');
        return false;
      }
      
      // Se o token é inválido, tentar refresh
      if (testResults.authenticated && !testResults.tokenValid) {
        const refreshed = await refreshToken();
        
        if (!refreshed) {
          toast.error("Token inválido", {
            description: "Não foi possível renovar sua sessão. Por favor, faça login novamente."
          });
          navigate('/login');
          return false;
        }
      }
      
      return false;
    }
    
    setConnectionHealth('ok');
    setSessionValid(true);
    return true;
  }, [navigate, refreshToken]);

  return {
    sessionValid,
    isRefreshing,
    connectionHealth,
    refreshToken,
    executeWithAuthCheck,
    forceAuthCheck
  };
};
