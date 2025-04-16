
import { useState, useEffect, useCallback } from 'react';
import { refreshAuthSession, supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

/**
 * Hook para gerenciar o refresh automático do token em solicitações HTTP
 * e lidar com erros 401 de autenticação
 */
export const useAuthRefreshOnRequest = () => {
  const [lastTokenRefresh, setLastTokenRefresh] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sessionValid, setSessionValid] = useState<boolean | null>(null);
  const navigate = useNavigate();

  // Verificar sessão atual
  useEffect(() => {
    const checkSession = async () => {
      try {
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
            refreshToken();
          }
        }
      } catch (error) {
        console.error("Erro ao verificar sessão:", error);
        setSessionValid(false);
      }
    };
    
    checkSession();
  }, []);

  // Fazer refresh do token e rastrear quando foi atualizado pela última vez
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
      const refreshed = await refreshAuthSession();
      setLastTokenRefresh(now);
      setIsRefreshing(false);
      
      if (refreshed) {
        setSessionValid(true);
        return true;
      } else {
        // Se falhar, a sessão pode estar inválida
        const { data } = await supabase.auth.getSession();
        const hasValidSession = !!data.session?.user?.id;
        setSessionValid(hasValidSession);
        return hasValidSession;
      }
    } catch (error) {
      console.error("Erro ao atualizar token:", error);
      setIsRefreshing(false);
      setSessionValid(false);
      return false;
    }
  }, [isRefreshing, lastTokenRefresh]);

  // Função para executar uma operação com verificação automática de autenticação
  const executeWithAuthCheck = useCallback(async <T>(
    operation: () => Promise<T>,
    options: {
      redirectOnFailure?: boolean;
      showToastOnFailure?: boolean;
    } = {}
  ): Promise<T | null> => {
    const { redirectOnFailure = true, showToastOnFailure = true } = options;
    
    try {
      // Tenta a operação normalmente
      return await operation();
    } catch (error: any) {
      console.error("Erro durante a operação:", error);
      
      // Verifica se é um erro de autenticação (401/403)
      const isAuthError = 
        error.message?.includes('401') || 
        error.message?.includes('403') || 
        error.code === 'PGRST301' ||
        (error.message && (
          error.message.includes('JWT') || 
          error.message.includes('token') || 
          error.message.includes('auth')
        ));
      
      if (isAuthError) {
        console.log("Erro de autenticação detectado, tentando refresh do token...");
        
        // Tenta atualizar o token
        const refreshed = await refreshToken();
        
        if (refreshed) {
          // Se conseguiu atualizar, tenta a operação novamente
          console.log("Token atualizado, tentando operação novamente...");
          try {
            return await operation();
          } catch (retryError) {
            console.error("Falha na segunda tentativa após refresh:", retryError);
            
            if (showToastOnFailure) {
              toast.error("Erro de autenticação", {
                description: "Por favor, faça login novamente."
              });
            }
            
            if (redirectOnFailure) {
              // Redirecionar para o login se ainda falhar
              navigate('/login');
            }
            
            return null;
          }
        } else {
          // Se não conseguiu atualizar, informa que precisa fazer login
          if (showToastOnFailure) {
            toast.error("Sessão expirada", {
              description: "Por favor, faça login novamente."
            });
          }
          
          if (redirectOnFailure) {
            navigate('/login');
          }
          
          return null;
        }
      }
      
      // Se não for erro de autenticação, propaga o erro
      throw error;
    }
  }, [navigate, refreshToken]);

  return {
    sessionValid,
    isRefreshing,
    refreshToken,
    executeWithAuthCheck
  };
};
