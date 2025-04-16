
import { supabase } from "@/integrations/supabase/client";

/**
 * Verifica a conexão com o Supabase
 * Retorna true se conectado, false caso contrário
 */
export async function checkSupabaseConnection(): Promise<boolean> {
  try {
    const startTime = Date.now();
    const { data, error } = await supabase.from('service_types').select('id').limit(1);
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    console.log(`Tempo de resposta do Supabase: ${responseTime}ms`);
    
    if (error) {
      console.error("Erro de conexão com Supabase:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Erro ao verificar conexão:", error);
    return false;
  }
}

/**
 * Verifica a conexão com o Supabase e testa a resposta
 */
export async function checkSupabaseStatus(): Promise<boolean> {
  try {
    const startTime = Date.now();
    const { data, error } = await supabase.from('service_types').select('id').limit(1);
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    console.log(`Tempo de resposta do Supabase: ${responseTime}ms`);
    
    if (error) {
      console.error("Erro ao verificar status do Supabase:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Erro ao verificar status do Supabase:", error);
    return false;
  }
}

/**
 * Verifica se o usuário está autenticado
 */
export async function checkSupabaseAuth(): Promise<boolean> {
  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error("Erro ao verificar autenticação:", error);
      return false;
    }
    
    return !!data.session?.user?.id;
  } catch (error) {
    console.error("Erro ao verificar autenticação:", error);
    return false;
  }
}

/**
 * Atualiza a sessão do usuário
 */
export async function refreshAuthSession(): Promise<boolean> {
  try {
    console.log("Tentando atualizar sessão...");
    
    const { data, error } = await supabase.auth.refreshSession();
    
    if (error) {
      console.error("Erro ao atualizar sessão:", error);
      return false;
    }
    
    return !!data.session;
  } catch (error) {
    console.error("Erro crítico ao atualizar sessão:", error);
    return false;
  }
}

/**
 * Verifica a saúde da conexão
 */
export async function checkConnectionHealth(): Promise<{
  status: 'online' | 'offline';
  reason?: string;
}> {
  try {
    // Primeiro verificar conexão básica
    const isConnected = await checkSupabaseConnection();
    
    if (!isConnected) {
      return { 
        status: 'offline', 
        reason: 'no-connection' 
      };
    }
    
    // Verificar autenticação
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      return { 
        status: 'offline', 
        reason: 'auth-error' 
      };
    }
    
    if (!data.session) {
      return { 
        status: 'offline', 
        reason: 'no-session' 
      };
    }
    
    // Verificar se o token está próximo de expirar
    const expiresAt = data.session.expires_at * 1000;
    const now = Date.now();
    const timeToExpire = expiresAt - now;
    
    if (timeToExpire < 60000) { // Menos de 1 minuto
      return { 
        status: 'offline', 
        reason: 'token-expired' 
      };
    }
    
    if (timeToExpire < 300000) { // Menos de 5 minutos
      return { 
        status: 'online', 
        reason: 'session-expiring' 
      };
    }
    
    // Verificar se o token é válido
    const { error: testError } = await supabase.from('profiles').select('id').limit(1);
    
    if (testError && testError.code === 'PGRST301') {
      return { 
        status: 'offline', 
        reason: 'invalid-token' 
      };
    }
    
    return { 
      status: 'online', 
      reason: 'healthy' 
    };
  } catch (error) {
    console.error("Erro ao verificar saúde da conexão:", error);
    return { 
      status: 'offline', 
      reason: 'connection-error' 
    };
  }
}

/**
 * Verifica se o estado de autenticação é válido e tenta corrigir se necessário
 */
export async function ensureValidAuthentication(): Promise<boolean> {
  try {
    // Verificar sessão atual
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error("Erro ao verificar sessão:", error);
      return false;
    }
    
    if (!data.session?.user?.id) {
      console.warn("Sem sessão ativa");
      return false;
    }
    
    // Verificar se o token está próximo de expirar
    const expiresAt = data.session.expires_at * 1000;
    const now = Date.now();
    const timeToExpire = expiresAt - now;
    
    if (timeToExpire < 300000) { // Menos de 5 minutos
      console.log("Token próximo de expirar, renovando...");
      const refreshed = await refreshAuthSession();
      
      if (!refreshed) {
        console.warn("Não foi possível renovar o token");
        return false;
      }
    }
    
    // Verificar se o token é válido com uma requisição de teste
    const { error: testError } = await supabase.from('profiles').select('id').limit(1);
    
    if (testError && testError.code === 'PGRST301') {
      console.warn("Token inválido, tentando renovar...");
      const refreshed = await refreshAuthSession();
      
      if (!refreshed) {
        console.warn("Não foi possível renovar o token");
        return false;
      }
      
      // Verificar novamente após a renovação
      const { error: retryError } = await supabase.from('profiles').select('id').limit(1);
      
      if (retryError) {
        console.error("Token ainda inválido após renovação:", retryError);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error("Erro ao validar autenticação:", error);
    return false;
  }
}

/**
 * Registra o status de autenticação no console
 */
export async function logAuthStatus(): Promise<string | null> {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error("Erro ao obter sessão:", error);
      return null;
    }
    
    const isAuthenticated = !!data.session;
    console.log(`Status de autenticação: ${isAuthenticated ? 'Autenticado' : 'Não autenticado'}`);
    
    if (isAuthenticated && data.session?.user) {
      console.log(`Usuário: ${data.session.user.email}`);
      console.log(`ID: ${data.session.user.id}`);
      
      // Verificar quando o token expira
      const expiresAt = data.session.expires_at * 1000;
      const now = Date.now();
      const timeToExpire = expiresAt - now;
      console.log(`Token expira em: ${Math.floor(timeToExpire / 60000)} minutos`);
      
      return data.session.user.id;
    }
    
    return null;
  } catch (error) {
    console.error("Erro ao verificar status de autenticação:", error);
    return null;
  }
}

/**
 * Verifica conexão com a internet
 */
export async function checkInternetConnection(): Promise<boolean> {
  try {
    // Fazer uma requisição para o Google para testar a conexão
    const response = await fetch('https://www.google.com', { 
      mode: 'no-cors',
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache'
      }
    });
    
    return true;
  } catch (error) {
    console.error("Erro ao verificar conexão com a internet:", error);
    return false;
  }
}

/**
 * Executa diagnóstico completo da conexão
 */
export async function runConnectionDiagnostics(): Promise<void> {
  console.log("=== DIAGNÓSTICO DE CONEXÃO ===");
  
  // Verificar conexão com a internet
  try {
    const internetConnected = await checkInternetConnection();
    console.log(`Conexão com a internet: ${internetConnected ? 'OK' : 'FALHA'}`);
  } catch (e) {
    console.error("Erro ao verificar conexão com a internet:", e);
  }
  
  // Verificar endereço do Supabase
  try {
    const supabaseUrl = "https://yjcyebiahnwfwrcgqlcm.supabase.co";
    const dnsCheckStart = Date.now();
    const dnsResponse = await fetch(`${supabaseUrl}/auth/v1/`, { 
      method: 'HEAD',
      mode: 'no-cors',
      cache: 'no-store'
    });
    const dnsTime = Date.now() - dnsCheckStart;
    
    console.log(`DNS Supabase: ${dnsResponse.ok ? 'OK' : 'RESPOSTA RECEBIDA'} (${dnsTime}ms)`);
  } catch (e) {
    console.error("Erro ao verificar DNS do Supabase:", e);
  }
  
  // Verificar conexão com Supabase
  try {
    const supabaseConnected = await checkSupabaseConnection();
    console.log(`Conexão com Supabase: ${supabaseConnected ? 'OK' : 'FALHA'}`);
  } catch (e) {
    console.error("Erro ao verificar conexão com Supabase:", e);
  }
  
  // Verificar autenticação
  try {
    const isAuthenticated = await checkSupabaseAuth();
    console.log(`Autenticação Supabase: ${isAuthenticated ? 'OK' : 'FALHA'}`);
    
    if (isAuthenticated) {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        const expiresAt = data.session.expires_at * 1000;
        const now = Date.now();
        const timeToExpire = expiresAt - now;
        console.log(`Token expira em: ${Math.floor(timeToExpire / 60000)} minutos`);
      }
    }
  } catch (e) {
    console.error("Erro ao verificar autenticação com Supabase:", e);
  }
  
  console.log("============================");
}

/**
 * Executa um teste completo de conectividade e retorna resultados detalhados
 */
export async function performFullConnectivityTest(): Promise<{
  success: boolean;
  internetConnected: boolean;
  supabaseConnected: boolean;
  authenticated: boolean;
  tokenValid: boolean | null;
  tokenExpiry: number | null;
  errors?: string[];
  pingTime?: number;
}> {
  const result = {
    success: false,
    internetConnected: false,
    supabaseConnected: false,
    authenticated: false,
    tokenValid: null,
    tokenExpiry: null,
    errors: [] as string[],
    pingTime: null as number | null
  };
  
  try {
    // Verificar conexão com a internet
    result.internetConnected = await checkInternetConnection();
    if (!result.internetConnected) {
      result.errors?.push("Sem conexão com a internet");
    }
    
    // Verificar conexão com Supabase
    const startTime = Date.now();
    result.supabaseConnected = await checkSupabaseConnection();
    result.pingTime = Date.now() - startTime;
    
    if (!result.supabaseConnected) {
      result.errors?.push("Não foi possível conectar ao Supabase");
    }
    
    // Verificar autenticação
    if (result.supabaseConnected) {
      result.authenticated = await checkSupabaseAuth();
      
      if (!result.authenticated) {
        result.errors?.push("Usuário não autenticado");
      } else {
        // Verificar validade do token
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          const expiresAt = data.session.expires_at * 1000;
          const now = Date.now();
          const timeToExpire = expiresAt - now;
          
          result.tokenExpiry = Math.floor(timeToExpire / 60000);
          
          if (timeToExpire < 60000) {
            result.tokenValid = false;
            result.errors?.push("Token expirado ou próximo de expirar");
          } else {
            result.tokenValid = true;
          }
          
          // Testar uma requisição para verificar se o token é válido
          const { error: testError } = await supabase.from('profiles').select('id').limit(1);
          if (testError) {
            result.tokenValid = false;
            result.errors?.push(`Erro ao usar token: ${testError.message}`);
          }
        }
      }
    }
    
    // Definir sucesso se todas as verificações passaram
    result.success = result.internetConnected && 
                     result.supabaseConnected && 
                     result.authenticated && 
                     result.tokenValid === true;
    
  } catch (error) {
    console.error("Erro durante o teste de conectividade:", error);
    result.errors?.push(`Erro inesperado: ${error instanceof Error ? error.message : 'Desconhecido'}`);
    result.success = false;
  }
  
  return result;
}
