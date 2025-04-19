
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
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  registerUser: (email: string, password: string) => Promise<void>;
  getUserMetadata: () => Record<string, any> | null;
  logout: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
  signUp: (email: string, password: string) => Promise<any>;
}

const AuthContext = createContext<AuthContextProps>({} as AuthContextProps);

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

  // Função segura para refresh de token
  const refreshSession = async (): Promise<boolean> => {
    try {
      console.log("AuthContext: Tentando atualizar sessão...");
      
      const now = Date.now();
      if (now - lastTokenRefresh < 30000) {
        console.log("AuthContext: Ignorando refresh (muito recente)");
        return true;
      }

      // Primeiro verificar se há sessão
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        console.log("AuthContext: Sem sessão para atualizar");
        return false;
      }

      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error("AuthContext: Erro ao atualizar sessão:", error);
        return false;
      }
      
      if (data && data.session) {
        console.log("AuthContext: Sessão atualizada com sucesso");
        setLastTokenRefresh(now);
        setSession(data.session);
        setUser(data.session.user);
        setIsAuthenticated(true);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("AuthContext: Erro crítico ao atualizar sessão:", error);
      return false;
    }
  };

  // Setup inicial da autenticação
  useEffect(() => {
    const setupAuth = async () => {
      try {
        setLoading(true);
        console.log("AuthContext: Iniciando setup de autenticação");
        
        // Primeiro configurar o listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, newSession) => {
            console.log("AuthContext: Evento de auth:", event);
            
            if (event === "SIGNED_OUT") {
              setSession(null);
              setUser(null);
              setIsAuthenticated(false);
            } 
            else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
              setSession(newSession);
              setUser(newSession?.user || null);
              setIsAuthenticated(!!newSession?.user);
            }
          }
        );
        
        // Depois verificar sessão atual
        const { data: sessionData } = await supabase.auth.getSession();
        console.log("AuthContext: Sessão inicial:", sessionData.session?.user?.id || "nenhuma");
        
        if (sessionData.session) {
          setSession(sessionData.session);
          setUser(sessionData.session.user);
          setIsAuthenticated(true);
          
          // Verificar se token está próximo de expirar
          const expiresAt = sessionData.session.expires_at * 1000;
          const now = Date.now();
          const timeToExpire = expiresAt - now;
          
          if (timeToExpire < 300000) {
            console.log("AuthContext: Token próximo de expirar, renovando");
            await refreshSession();
          }
        }
        
        setLoading(false);
        
        // Configurar verificação periódica
        const checkInterval = setInterval(async () => {
          if (session) {
            const expiresAt = session.expires_at * 1000;
            const now = Date.now();
            const timeToExpire = expiresAt - now;
            
            if (timeToExpire < 900000) {
              await refreshSession();
            }
          }
        }, 300000); // Verificar a cada 5 minutos
        
        return () => {
          subscription.unsubscribe();
          clearInterval(checkInterval);
        };
        
      } catch (error) {
        console.error("AuthContext: Erro no setup:", error);
        setError(error instanceof Error ? error.message : "Erro ao verificar autenticação");
        setLoading(false);
      }
    };
    
    setupAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      console.log("AuthContext: Iniciando login com email:", email);
      
      // Limpar erros anteriores
      setError(null);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error("AuthContext: Erro de autenticação:", error);
        
        // Mensagem mais amigável para erro de credenciais inválidas
        if (error.message.includes("Invalid login credentials")) {
          throw new Error("Email ou senha incorretos. Por favor, verifique suas credenciais e tente novamente.");
        }
        
        throw error;
      }
      
      console.log("AuthContext: Login bem-sucedido, dados:", data.session?.user?.id || "sem ID");
      
      if (data && data.session) {
        setSession(data.session);
        setUser(data.session.user);
        setIsAuthenticated(true);
        toast.success('Login realizado com sucesso');
        return;
      } else {
        throw new Error("Falha no login: Não foi possível obter dados da sessão");
      }
      
    } catch (error: any) {
      console.error("AuthContext: Erro completo no login:", error);
      setError(error.message);
      toast.error('Erro ao fazer login', {
        description: error.message
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin
        }
      });
      
      if (error) throw error;
      
      toast.success('Cadastro realizado com sucesso');
      return data;
      
    } catch (error: any) {
      setError(error.message);
      toast.error('Erro ao criar conta', {
        description: error.message
      });
      throw error;
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

  // Update registerUser to match the Promise<void> return type in the interface
  const registerUser = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin
        }
      });
      
      if (error) throw error;
      
      toast.success('Cadastro realizado com sucesso');
    } catch (error: any) {
      setError(error.message);
      toast.error('Erro ao criar conta', {
        description: error.message
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    session,
    user,
    loading,
    error,
    isAuthenticated,
    signIn,
    signOut,
    signUp,
    login: signIn, // alias para signIn
    registerUser,
    getUserMetadata: () => user?.user_metadata || null,
    logout: signOut, // alias para signOut
    refreshSession,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
