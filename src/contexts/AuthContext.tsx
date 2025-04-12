
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  registerUser: (userData: { email: string; password: string; fullName: string; }) => Promise<boolean>;
  getUserMetadata: () => { fullName?: string; email?: string; };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Configura o listener de mudança de estado de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    );

    // Verifica sessão existente
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const getUserMetadata = () => {
    if (!user) return { fullName: undefined, email: undefined };
    
    const metadata = user.user_metadata || {};
    const email = user.email || '';
    
    return {
      fullName: metadata.full_name as string | undefined,
      email
    };
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        toast.error('Erro ao fazer login: ' + error.message);
        return false;
      }

      toast.success('Login realizado com sucesso!');
      return true;
    } catch (error) {
      toast.error('Erro ao fazer login');
      return false;
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error('Erro ao fazer logout: ' + error.message);
        return;
      }
      toast.success('Logout realizado com sucesso');
    } catch (error) {
      toast.error('Erro ao fazer logout');
    }
  };

  const registerUser = async (userData: { email: string; password: string; fullName: string; }): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            full_name: userData.fullName,
          }
        }
      });

      if (error) {
        toast.error('Erro ao cadastrar usuário: ' + error.message);
        return false;
      }

      toast.success('Cadastro realizado com sucesso! Verifique seu email.');
      return true;
    } catch (error) {
      toast.error('Erro ao cadastrar usuário');
      return false;
    }
  };

  const value = {
    user,
    session,
    isAuthenticated: !!user,
    login,
    logout,
    registerUser,
    getUserMetadata,
  };

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
