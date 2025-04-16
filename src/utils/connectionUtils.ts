
import { supabase, refreshAuthSession } from "@/integrations/supabase/client";

/**
 * Verificar se a conexão com o servidor Supabase está funcionando
 * usando apenas verificação básica sem autenticação
 */
export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    console.log("Verificando conexão com Supabase...");
    // Usando apenas verificação básica sem autenticação, apenas para testar se o servidor está online
    const startTime = Date.now();
    const response = await fetch(
      "https://yjcyebiahnwfwrcgqlcm.supabase.co/rest/v1/",
      {
        method: 'HEAD',
        headers: {
          'Content-Type': 'application/json',
          'apikey': "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlqY3llYmlhaG53ZndyY2dxbGNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ0OTg0MzUsImV4cCI6MjA2MDA3NDQzNX0.MsHyZ9F4nVv0v9q8D7iQK4qgVmxUMdCAxKQun3GuSG4"
        },
        signal: AbortSignal.timeout(5000), // Limitar tempo de espera para 5 segundos
        cache: 'no-store' // Evitar cache
      }
    );
    
    const elapsed = Date.now() - startTime;
    console.log(`Verificação de conexão com Supabase: ${response.status} (${elapsed}ms)`);
    
    return response.status >= 200 && response.status < 500; // Aceitar inclusive 401, pois estamos apenas verificando se o servidor está online
  } catch (error) {
    console.error("Erro ao verificar conexão com Supabase:", error);
    return false;
  }
};

/**
 * Verificar se há conexão com a internet
 */
export const checkInternetConnection = async (): Promise<boolean> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    try {
      // Verificar conexão com internet usando um serviço confiável
      await fetch("https://www.google.com", {
        method: 'HEAD',
        mode: 'no-cors', // Importante para evitar problemas de CORS
        signal: controller.signal,
        cache: 'no-store' // Evitar cache
      });
      
      clearTimeout(timeoutId);
      return true; // Se chegou aqui, há conexão
    } catch (error) {
      clearTimeout(timeoutId);
      console.warn("Primeira tentativa de verificação de internet falhou:", error);
      
      // Segunda tentativa com outro domínio
      try {
        await fetch("https://www.cloudflare.com", {
          method: 'HEAD',
          mode: 'no-cors',
          signal: AbortSignal.timeout(3000),
          cache: 'no-store'
        });
        return true;
      } catch (secondError) {
        console.error("Segunda tentativa de verificação de internet falhou:", secondError);
        return false;
      }
    }
  } catch (error) {
    console.error("Erro ao verificar conexão com internet:", error);
    return false;
  }
};

/**
 * Verificar autenticação Supabase
 */
export const checkSupabaseAuth = async (): Promise<boolean> => {
  try {
    console.log("Verificando autenticação Supabase...");
    // Verificar se há uma sessão válida
    const { data } = await supabase.auth.getSession();
    
    if (!data.session?.user) {
      console.log("Sem sessão válida");
      return false;
    }
    
    // Verificar se o token está próximo de expirar
    const expiresAt = data.session.expires_at * 1000;
    const now = Date.now();
    const timeToExpire = expiresAt - now;
    
    // Se estiver próximo de expirar, tentar renovar
    if (timeToExpire < 300000) { // menos de 5 minutos
      console.log("Token próximo de expirar, tentando renovar...");
      return await refreshAuthSession();
    }
    
    return true;
  } catch (error) {
    console.error("Erro ao verificar autenticação Supabase:", error);
    return false;
  }
};

/**
 * Registrar diagnóstico de conexão completo
 */
export const runConnectionDiagnostics = async () => {
  console.log("=== DIAGNÓSTICO DE CONEXÃO ===");
  
  // Verificar conexão com internet
  const hasInternet = await checkInternetConnection();
  console.log(`Internet: ${hasInternet ? 'OK' : 'FALHA'}`);
  
  // Verificar conexão com Supabase
  const hasSupabase = await checkSupabaseConnection();
  console.log(`Supabase: ${hasSupabase ? 'OK' : 'FALHA'}`);
  
  // Verificar status da sessão
  const { data } = await supabase.auth.getSession();
  const hasSession = !!data.session?.user;
  console.log(`Sessão: ${hasSession ? 'ATIVA' : 'INATIVA'}`);
  
  if (hasSession) {
    console.log(`Usuário: ${data.session?.user.id}`);
    console.log(`Expira em: ${new Date(data.session?.expires_at! * 1000).toLocaleString()}`);
    
    // Verificar token
    if (data.session?.expires_at) {
      const expiresAt = data.session.expires_at * 1000;
      const now = Date.now();
      const timeToExpire = expiresAt - now;
      console.log(`Token expira em: ${Math.floor(timeToExpire / 60000)} minutos`);
    }
  }
  
  // Tentar renovar sessão se necessário
  if (hasInternet && hasSupabase && hasSession) {
    try {
      const refreshed = await refreshAuthSession();
      console.log(`Renovação do token: ${refreshed ? 'SUCESSO' : 'FALHA'}`);
    } catch (error) {
      console.error("Erro ao renovar token:", error);
    }
  }
  
  console.log("=============================");
  
  return {
    internet: hasInternet,
    supabase: hasSupabase,
    session: hasSession,
    sessionDetails: hasSession ? data.session : null
  };
};

/**
 * Verifica a saúde geral da conexão e autenticação
 */
export const checkConnectionHealth = async () => {
  // Verificar internet
  const hasInternet = await checkInternetConnection();
  if (!hasInternet) {
    return { status: 'offline', reason: 'no-internet' };
  }
  
  // Verificar Supabase
  const hasSupabase = await checkSupabaseConnection();
  if (!hasSupabase) {
    return { status: 'offline', reason: 'supabase-unavailable' };
  }
  
  // Verificar sessão
  try {
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      return { status: 'online', reason: 'no-session' };
    }
    
    // Verificar se o token está próximo de expirar
    const expiresAt = data.session.expires_at * 1000;
    const now = Date.now();
    const timeToExpire = expiresAt - now;
    
    if (timeToExpire < 300000) { // 5 minutos
      try {
        // Tentar atualizar o token
        const refreshed = await refreshAuthSession();
        if (!refreshed) {
          return { status: 'online', reason: 'session-expiring' };
        }
      } catch (error) {
        console.error("Erro ao atualizar sessão:", error);
        return { status: 'online', reason: 'refresh-failed' };
      }
    }
    
    return { status: 'online', reason: 'healthy' };
  } catch (error) {
    console.error("Erro ao verificar sessão:", error);
    return { status: 'online', reason: 'session-error' };
  }
};

/**
 * Verifica a autenticação e renova a sessão se necessário
 */
export const ensureValidAuthentication = async (): Promise<boolean> => {
  console.log("Verificando autenticação...");
  
  try {
    // Verificar sessão atual
    const { data } = await supabase.auth.getSession();
    
    // Se não houver sessão, já retorna falso
    if (!data.session) {
      console.log("Sem sessão ativa");
      return false;
    }
    
    console.log(`Sessão encontrada para ${data.session.user.email}`);
    
    // Verificar se o token está próximo de expirar
    const expiresAt = data.session.expires_at * 1000;
    const now = Date.now();
    const timeToExpire = expiresAt - now;
    
    // Se estiver próximo de expirar ou já expirado, tentar renovar
    if (timeToExpire < 600000) { // menos de 10 minutos
      console.log("Token próximo de expirar ou expirado, renovando...");
      return await refreshAuthSession();
    }
    
    // Sessão válida e não está próxima de expirar
    return true;
  } catch (error) {
    console.error("Erro ao verificar/renovar autenticação:", error);
    return false;
  }
};
