
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Verificar se há conexão com a internet
 */
export const checkInternetConnection = async (): Promise<boolean> => {
  try {
    if (!navigator.onLine) {
      return false;
    }
    
    // Fazemos uma verificação adicional com uma requisição real
    const response = await fetch('https://www.google.com/generate_204', {
      method: 'HEAD',
      mode: 'no-cors',
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache' },
      signal: AbortSignal.timeout(5000), // 5 segundos de timeout
    });
    
    return true;
  } catch (error) {
    console.error("Erro ao verificar conexão com a internet:", error);
    return false;
  }
};

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
 * Verificar status do Supabase (para medição de latência)
 */
export const checkSupabaseStatus = async (): Promise<boolean> => {
  try {
    const start = Date.now();
    const { data, error } = await supabase.from('service_types').select('id').limit(1).maybeSingle();
    const end = Date.now();
    
    console.log(`Tempo de resposta do Supabase: ${end - start}ms`);
    
    if (error && error.code === 'PGRST116') {
      // Este é um erro de permissão, significa que o Supabase está online
      return true;
    }
    
    return !error;
  } catch (error) {
    console.error("Erro ao verificar status do Supabase:", error);
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
 * Verificar e logar detalhes da sessão atual, retorna o ID do usuário ou null
 */
export const logAuthStatus = async (): Promise<string | null> => {
  try {
    const { data } = await supabase.auth.getSession();
    if (data.session) {
      const user = data.session.user;
      console.log("=== DETALHES DA SESSÃO ===");
      console.log(`ID do usuário: ${user.id}`);
      console.log(`Email: ${user.email}`);
      console.log(`Criado em: ${new Date(user.created_at || '').toLocaleString()}`);
      console.log(`Expira em: ${new Date(data.session.expires_at * 1000).toLocaleString()}`);
      
      // Verificar se o token está próximo de expirar
      const expiresAt = data.session.expires_at * 1000;
      const now = Date.now();
      const timeToExpire = expiresAt - now;
      console.log(`Tempo até expirar: ${Math.floor(timeToExpire / 60000)} minutos`);
      
      if (timeToExpire < 300000) { // 5 minutos
        console.warn("⚠️ Token próximo de expirar!");
      }
      
      console.log("=========================");
      return user.id;
    } else {
      console.warn("Nenhuma sessão ativa encontrada!");
      return null;
    }
  } catch (error) {
    console.error("Erro ao obter detalhes da sessão:", error);
    return null;
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
      return { status: 'offline', reason: 'no-internet' };
    }
    
    // Verificar se há conexão com o Supabase
    const isConnected = await checkSupabaseConnection();
    if (!isConnected) {
      return { status: 'offline', reason: 'server-down' };
    }
    
    // Verificar se há sessão válida
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      return { status: 'offline', reason: 'no-session' };
    }
    
    // Verificar se o token está próximo de expirar
    const expiresAt = data.session.expires_at * 1000;
    const now = Date.now();
    const timeToExpire = expiresAt - now;
    
    if (timeToExpire < 60000) { // 1 minuto
      return { status: 'offline', reason: 'invalid-token' };
    }
    
    if (timeToExpire < 300000) { // 5 minutos
      return { status: 'online', reason: 'session-expiring' };
    }
    
    return { status: 'online', reason: 'healthy' };
  } catch (error) {
    console.error("Erro ao verificar saúde da conexão:", error);
    return { status: 'offline', reason: 'unknown-error' };
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

/**
 * Executar diagnóstico completo de conectividade
 */
export const performFullConnectivityTest = async (): Promise<{
  success: boolean;
  internetConnected: boolean;
  supabaseConnected: boolean;
  authenticated: boolean;
  tokenValid: boolean | null;
  latency: number | null;
  errors?: string[];
}> => {
  const result = {
    success: false,
    internetConnected: false,
    supabaseConnected: false,
    authenticated: false,
    tokenValid: null,
    latency: null,
    errors: [] as string[]
  };
  
  try {
    // 1. Verificar conexão com a internet
    console.log("Verificando conexão com a internet...");
    result.internetConnected = await checkInternetConnection();
    if (!result.internetConnected) {
      result.errors?.push("Sem conexão com a internet");
      return result;
    }
    
    // 2. Verificar conexão com o Supabase
    console.log("Verificando conexão com o Supabase...");
    const start = Date.now();
    result.supabaseConnected = await checkSupabaseConnection();
    const end = Date.now();
    
    result.latency = end - start;
    
    if (!result.supabaseConnected) {
      result.errors?.push(`Não foi possível conectar ao Supabase (${result.latency}ms)`);
      return result;
    }
    
    // 3. Verificar autenticação
    console.log("Verificando autenticação...");
    const { data } = await supabase.auth.getSession();
    result.authenticated = !!data.session;
    
    if (!result.authenticated) {
      result.errors?.push("Sem sessão de autenticação válida");
      return result;
    }
    
    // 4. Verificar token
    console.log("Verificando validade do token...");
    const expiresAt = data.session?.expires_at || 0;
    const now = Math.floor(Date.now() / 1000);
    const timeLeft = expiresAt - now;
    
    result.tokenValid = timeLeft > 60; // Válido se expirar em mais de 1 minuto
    
    if (!result.tokenValid) {
      result.errors?.push(`Token inválido ou expirando (${timeLeft}s)`);
      
      // Tentar renovar o token
      const refreshed = await refreshAuthSession();
      if (refreshed) {
        result.errors?.pop(); // Remover erro anterior
        result.tokenValid = true;
      } else {
        result.errors?.push("Falha ao renovar token");
        return result;
      }
    }
    
    // 5. Teste de consulta básica
    console.log("Executando consulta de teste...");
    const { error: queryError } = await supabase.from('service_types').select('id').limit(1);
    
    if (queryError) {
      result.errors?.push(`Erro na consulta de teste: ${queryError.message}`);
      return result;
    }
    
    // Todos os testes passaram
    result.success = true;
    return result;
    
  } catch (error) {
    console.error("Erro no diagnóstico completo:", error);
    result.errors?.push(`Erro inesperado: ${error instanceof Error ? error.message : String(error)}`);
    return result;
  }
};
