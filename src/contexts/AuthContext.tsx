import React, { createContext, useState, useEffect, useContext } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextProps {
  session: Session | null;
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps>({
  session: null,
  user: null,
  loading: false,
  error: null,
  signIn: async () => {},
  signOut: async () => {},
});

export const useAuth = () => {
  return useContext(AuthContext);
};

// Aprimorar o contexto de autenticação para lidar melhor com erros de conexão
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const signIn = async (email: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOtp({ email });
      if (error) throw error;
      alert('Verifique seu email para o link de login mágico!');
    } catch (error: any) {
      setError(error.message);
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
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const getSession = async () => {
      try {
        setLoading(true);
        
        // Adicionando timeout para evitar bloqueio indefinido
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error("Timeout ao buscar sessão")), 8000);
        });
        
        const sessionPromise = supabase.auth.getSession();
        
        // Race entre o timeout e a busca da sessão
        const { data } = await Promise.race([sessionPromise, timeoutPromise]) as any;
        const session = data?.session;
        
        if (session) {
          console.log("AuthContext: Sessão encontrada, usuário autenticado");
          setSession(session);
          setUser(session.user);
        } else {
          console.log("AuthContext: Nenhuma sessão ativa encontrada");
          setSession(null);
          setUser(null);
        }
      } catch (error) {
        console.error("AuthContext: Erro ao buscar sessão:", error);
        setSession(null);
        setUser(null);
        setError(
          error instanceof Error ? error.message : "Erro ao verificar autenticação"
        );
      } finally {
        setLoading(false);
      }
    };

    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log("AuthContext: Evento de alteração de estado de autenticação:", event);
        
        if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
          setSession(newSession);
          setUser(newSession?.user || null);
        } else if (event === "SIGNED_OUT") {
          setSession(null);
          setUser(null);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const value: AuthContextProps = {
    session,
    user,
    loading,
    error,
    signIn,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
