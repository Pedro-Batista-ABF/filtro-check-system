
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Verificar se há conexão com o Supabase
 */
export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    const start = Date.now();
    const { data, error } = await supabase.from('service_types').select('id').limit(1).maybeSingle();
    const end = Date.now();
    
    console.log(`Tempo de resposta do Supabase: ${end - start}ms`);
    
    if (error && error.code === 'PGRST116') {
      // Este é um erro de permissão, significa que o Supabase está online
      // mas o usuário pode não ter acesso à tabela
      console.log("Conexão OK, mas usuário sem permissão");
      return true;
    }
    
    return !error;
  } catch (error) {
    console.error("Erro ao verificar conexão com Supabase:", error);
    return false;
  }
};

/**
 * Verificar se há sessão de autenticação válida
 */
export const checkSupabaseAuth = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.auth.getSession();
    return !error && !!data.session;
  } catch (error) {
    console.error("Erro ao verificar autenticação:", error);
    return false;
  }
};

/**
 * Forçar atualização da sessão de autenticação
 */
export const refreshAuthSession = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.auth.refreshSession();
    return !error && !!data.session;
  } catch (error) {
    console.error("Erro ao atualizar sessão:", error);
    return false;
  }
};

/**
 * Verificar saúde da conexão
 */
export const checkConnectionHealth = async (): Promise<{
  status: 'online' | 'offline';
  reason?: string;
}> => {
  try {
    // Verificar se há conexão com a internet
    if (!navigator.onLine) {
      return { status: 'offline', reason: 'Sem conexão com a internet' };
    }
    
    // Verificar se há conexão com o Supabase
    const isConnected = await checkSupabaseConnection();
    if (!isConnected) {
      return { status: 'offline', reason: 'Servidor não disponível' };
    }
    
    // Verificar se há sessão válida
    const isAuth = await checkSupabaseAuth();
    if (!isAuth) {
      return { status: 'offline', reason: 'Sessão inválida' };
    }
    
    return { status: 'online' };
  } catch (error) {
    console.error("Erro ao verificar saúde da conexão:", error);
    return { status: 'offline', reason: 'Erro desconhecido' };
  }
};

/**
 * Garantir que a autenticação é válida
 */
export const ensureValidAuthentication = async (): Promise<boolean> => {
  try {
    // Verificar se há sessão válida
    const { data: sessionData } = await supabase.auth.getSession();
    
    // Se não há sessão, a autenticação falhou
    if (!sessionData.session) {
      console.log("Sem sessão válida");
      return false;
    }
    
    // Se a sessão expira em menos de 10 minutos, atualizar
    const expiresAt = sessionData.session.expires_at || 0;
    const now = Math.floor(Date.now() / 1000);
    const timeLeft = expiresAt - now;
    
    if (timeLeft < 600) {
      console.log(`Sessão expirando em ${timeLeft} segundos, atualizando...`);
      const refreshed = await refreshAuthSession();
      
      if (!refreshed) {
        console.log("Falha ao atualizar sessão");
        return false;
      }
      
      console.log("Sessão atualizada com sucesso");
    }
    
    return true;
  } catch (error) {
    console.error("Erro ao garantir autenticação válida:", error);
    return false;
  }
};

/**
 * Realizar diagnóstico completo de conexão
 */
export const runConnectionDiagnostics = async (): Promise<{
  internet: boolean;
  server: boolean;
  auth: boolean;
  latency: number;
  message: string;
}> => {
  const result = {
    internet: navigator.onLine,
    server: false,
    auth: false,
    latency: -1,
    message: ""
  };
  
  try {
    if (!result.internet) {
      result.message = "Sem conexão com a internet";
      return result;
    }
    
    // Verificar latência e conexão com o servidor
    const start = Date.now();
    const isServerConnected = await checkSupabaseConnection();
    const end = Date.now();
    
    result.server = isServerConnected;
    result.latency = end - start;
    
    if (!result.server) {
      result.message = "Servidor não disponível";
      return result;
    }
    
    // Verificar autenticação
    result.auth = await checkSupabaseAuth();
    
    if (!result.auth) {
      result.message = "Sessão inválida";
      
      // Tentar atualizar a sessão
      const refreshed = await refreshAuthSession();
      
      if (refreshed) {
        result.auth = true;
        result.message = "Sessão atualizada com sucesso";
      } else {
        result.message = "Falha ao atualizar sessão";
      }
    } else {
      result.message = "Conexão estável";
    }
    
    return result;
  } catch (error) {
    console.error("Erro no diagnóstico de conexão:", error);
    result.message = "Erro desconhecido";
    return result;
  }
};
