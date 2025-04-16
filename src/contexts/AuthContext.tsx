
import React, { createContext, useState, useEffect, useContext } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AuthContextProps {
  session: Session | null;
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  signIn: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
  // Aliases para compatibilidade
  login: (email: string) => Promise<void>;
  registerUser: (email: string) => Promise<void>;
  getUserMetadata: () => Record<string, any> | null;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps>({
  session: null,
  user: null,
  loading: false,
  error: null,
  isAuthenticated: false,
  signIn: async () => {},
  signOut: async () => {},
  login: async () => {},
  registerUser: async () => {},
  getUserMetadata: () => null,
  logout: async () => {},
  refreshSession: async () => false,
});

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [lastTokenRefresh, setLastTokenRefresh] = useState(0);

  const signIn = async (email: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOtp({ 
        email,
        options: {
          emailRedirectTo: window.location.origin,
          shouldCreateUser: true
        }
      });
      
      if (error) throw error;
      
      toast.success('Link de acesso enviado!', {
        description: 'Verifique seu email para o link de login'
      });
      
    } catch (error: any) {
      setError(error.message);
      toast.error('Erro ao enviar link de acesso', {
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      setSession(null);
      setUser(null);
      setIsAuthenticated(false);
      toast.info('Você saiu do sistema');
    } catch (error: any) {
      setError(error.message);
      toast.error('Erro ao sair', {
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const getUserMetadata = () => {
    return user?.user_metadata || null;
  };
  
  const refreshSession = async (): Promise<boolean> => {
    try {
      console.log("AuthContext: Tentando atualizar sessão...");
      
      // Verificar se já houve uma atualização recente para evitar muitas chamadas
      const now = Date.now();
      if (now - lastTokenRefresh < 30000) { // Evitar mais de uma atualização a cada 30 segundos
        console.log("AuthContext: Atualização de token ignorada, muito recente");
        return true;
      }
      
      setLoading(true);
      
      // Corrigindo o uso da função refreshAuthSession
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error("AuthContext: Erro ao atualizar sessão:", error);
        return false;
      }
      
      if (data && data.session) {
        console.log("AuthContext: Sessão atualizada com sucesso");
        setLastTokenRefresh(now);
        
        // Atualizar o estado com a nova sessão
        setSession(data.session);
        setUser(data.session.user);
        setIsAuthenticated(!!data.session.user);
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("AuthContext: Erro crítico ao atualizar sessão:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const setupAuth = async () => {
      try {
        setLoading(true);
        console.log("AuthContext: Iniciando configuração de autenticação...");
        
        // Primeiro, configurar o listener de alterações de estado antes de verificar a sessão
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (event, newSession) => {
            console.log("AuthContext: Evento de alteração de estado de autenticação:", event);
            
            // Atualizar estado com base no novo estado de autenticação
            setSession(newSession);
            setUser(newSession?.user || null);
            setIsAuthenticated(!!newSession?.user);
            
            if (event === "SIGNED_IN") {
              toast.success('Login realizado com sucesso!');
            } else if (event === "SIGNED_OUT") {
              setSession(null);
              setUser(null);
              setIsAuthenticated(false);
            } else if (event === "TOKEN_REFRESHED") {
              console.log("AuthContext: Token atualizado automaticamente pelo Supabase");
            }
          }
        );
        
        // Depois, verificar a sessão atual
        const { data } = await supabase.auth.getSession();
        
        if (data.session) {
          console.log("AuthContext: Sessão encontrada, usuário autenticado");
          console.log("AuthContext: Token expira em:", new Date(data.session.expires_at * 1000).toLocaleString());
          
          // Verificar se o token está próximo de expirar (menos de 5 minutos)
          const expiresAt = data.session.expires_at * 1000;
          const now = Date.now();
          const timeToExpire = expiresAt - now;
          
          if (timeToExpire < 300000) { // 5 minutos
            console.warn("AuthContext: Token próximo de expirar, renovando...");
            await refreshSession();
          } else {
            setSession(data.session);
            setUser(data.session.user);
            setIsAuthenticated(true);
          }
        } else {
          console.log("AuthContext: Nenhuma sessão ativa encontrada");
          setSession(null);
          setUser(null);
          setIsAuthenticated(false);
        }
        
        // Configurar verificação periódica da sessão
        const intervalId = setInterval(async () => {
          try {
            const { data } = await supabase.auth.getSession();
            if (data.session) {
              // Verificar se o token está próximo de expirar (menos de 15 minutos)
              const expiresAt = data.session.expires_at * 1000;
              const now = Date.now();
              const timeToExpire = expiresAt - now;
              
              if (timeToExpire < 900000) { // 15 minutos
                console.log("AuthContext: Atualizando token proativamente...");
                await refreshSession();
              }
            }
          } catch (error) {
            console.error("AuthContext: Erro na verificação periódica de sessão:", error);
          }
        }, 600000); // Verificar a cada 10 minutos
        
        // Limpar intervalo quando o componente for desmontado
        return () => {
          subscription.unsubscribe();
          clearInterval(intervalId);
        };
        
      } catch (error) {
        console.error("AuthContext: Erro ao configurar autenticação:", error);
        setSession(null);
        setUser(null);
        setIsAuthenticated(false);
        setError(
          error instanceof Error ? error.message : "Erro ao verificar autenticação"
        );
      } finally {
        setLoading(false);
      }
    };
    
    setupAuth();
  }, []);

  const value: AuthContextProps = {
    session,
    user,
    loading,
    error,
    isAuthenticated,
    signIn,
    signOut,
    // Aliases para compatibilidade
    login: signIn,
    registerUser: signIn,
    getUserMetadata,
    logout: signOut,
    refreshSession,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
