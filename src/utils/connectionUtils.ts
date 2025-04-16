import { supabase } from "@/integrations/supabase/client";

/**
 * Verificar se a conexão com o servidor Supabase está funcionando
 * usando apenas verificação básica sem autenticação
 */
export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    console.log("Verificando conexão com Supabase...");
    
    // Usando apenas verificação básica sem autenticação, apenas para testar se o servidor está online
    const startTime = Date.now();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    try {
      const response = await fetch(
        "https://yjcyebiahnwfwrcgqlcm.supabase.co/rest/v1/",
        {
          method: 'HEAD',
          headers: {
            'Content-Type': 'application/json',
            'apikey': "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlqY3llYmlhaG53ZndyY2dxbGNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ0OTg0MzUsImV4cCI6MjA2MDA3NDQzNX0.MsHyZ9F4nVv0v9q8D7iQK4qgVmxUMdCAxKQun3GuSG4"
          },
          signal: controller.signal,
          cache: 'no-store' // Evitar cache
        }
      );
      
      clearTimeout(timeoutId);
      
      const elapsed = Date.now() - startTime;
      console.log(`Verificação de conexão com Supabase: ${response.status} (${elapsed}ms)`);
      
      // Aceitar inclusive 401, pois estamos apenas verificando se o servidor está online
      return response.status >= 200 && response.status < 500; 
    } catch (fetchError) {
      clearTimeout(timeoutId);
      console.error("Erro na requisição de verificação:", fetchError);
      return false;
    }
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
    
    // Verificar se o token é válido fazendo uma requisição
    try {
      const { error } = await supabase.from('profiles').select('id').limit(1);
      if (error && (error.code === 'PGRST301' || error.message?.includes('JWT'))) {
        // Token inválido, tentar renovar
        console.log("Token inválido, tentando renovar...");
        return await refreshAuthSession();
      }
      
      // Se não houve erro, o token é válido
      return true;
    } catch (e) {
      console.error("Erro ao verificar token:", e);
      return false;
    }
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
    
    // Verificar autorização com requisição real
    try {
      const { error } = await supabase.from('profiles').select('id').limit(1);
      console.log(`Teste de autorização: ${error ? 'FALHOU' : 'PASSOU'}`);
      if (error) {
        console.error("Erro no teste de autorização:", error);
      }
    } catch (e) {
      console.error("Erro ao testar autorização:", e);
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
    
    // Verificar se o token é realmente válido com uma requisição
    try {
      const { error } = await supabase.from('profiles').select('id').limit(1);
      if (error && (error.code === 'PGRST301' || error.message?.includes('JWT'))) {
        // Token inválido, tentar renovar
        const refreshed = await refreshAuthSession();
        if (!refreshed) {
          return { status: 'online', reason: 'invalid-token' };
        }
      }
    } catch (e) {
      console.error("Erro ao verificar token:", e);
      return { status: 'online', reason: 'auth-check-failed' };
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
    
    // Verificar se o token é válido com uma requisição
    try {
      const { error } = await supabase.from('profiles').select('id').limit(1);
      if (error && (error.code === 'PGRST301' || error.code === '401')) {
        // Token inválido, tentar renovar
        console.log("Token inválido, tentando renovar...");
        return await refreshAuthSession();
      }
    } catch (e) {
      console.error("Erro ao verificar token:", e);
      await refreshAuthSession(); // tentar renovar mesmo assim
    }
    
    // Sessão válida e não está próxima de expirar
    return true;
  } catch (error) {
    console.error("Erro ao verificar/renovar autenticação:", error);
    return false;
  }
};

/**
 * Verifica o token atual e retorna detalhes da sessão 
 * para diagnóstico de problemas
 */
export const getSessionDetails = async () => {
  try {
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      return { hasSession: false };
    }
    
    const expiresAt = data.session.expires_at * 1000;
    const now = Date.now();
    
    return {
      hasSession: true,
      userId: data.session.user.id,
      email: data.session.user.email,
      expiresIn: Math.floor((expiresAt - now) / 60000), // minutos
      accessToken: data.session.access_token.substring(0, 15) + '...',
      refreshToken: data.session.refresh_token ? 'Presente' : 'Ausente',
      tokenType: data.session.token_type
    };
  } catch (error) {
    console.error("Erro ao obter detalhes da sessão:", error);
    return { hasSession: false, error: String(error) };
  }
};

/**
 * Executa um teste completo de conectividade com o Supabase
 * Verifica internet, conexão com Supabase e autenticação
 * @returns Resultado detalhado dos testes
 */
export const performFullConnectivityTest = async () => {
  console.log("=== INICIANDO TESTE COMPLETO DE CONECTIVIDADE ===");
  
  // 1. Verificar internet
  console.log("1. Verificando conexão com internet...");
  const hasInternet = await checkInternetConnection();
  console.log(`   Internet: ${hasInternet ? '✅ OK' : '❌ FALHA'}`);
  
  if (!hasInternet) {
    console.log("=== TESTE INTERROMPIDO: SEM INTERNET ===");
    return {
      success: false,
      internetConnected: false,
      supabaseConnected: false,
      authenticated: false,
      errors: ["Sem conexão com a internet"]
    };
  }
  
  // 2. Verificar Supabase (sem autenticação)
  console.log("2. Verificando conexão com Supabase...");
  const supabaseConnected = await checkSupabaseConnection();
  console.log(`   Supabase: ${supabaseConnected ? '✅ OK' : '❌ FALHA'}`);
  
  if (!supabaseConnected) {
    console.log("=== TESTE INTERROMPIDO: SUPABASE INDISPONÍVEL ===");
    return {
      success: false,
      internetConnected: true,
      supabaseConnected: false,
      authenticated: false,
      errors: ["Servidor Supabase indisponível"]
    };
  }
  
  // 3. Verificar autenticação
  console.log("3. Verificando status da autenticação...");
  const { data: sessionData } = await supabase.auth.getSession();
  const authenticated = !!sessionData.session?.user;
  console.log(`   Autenticação: ${authenticated ? '✅ OK' : '❌ NÃO AUTENTICADO'}`);
  
  if (!authenticated) {
    console.log("=== TESTE INTERROMPIDO: USUÁRIO NÃO AUTENTICADO ===");
    return {
      success: false,
      internetConnected: true,
      supabaseConnected: true,
      authenticated: false,
      errors: ["Usuário não autenticado"]
    };
  }
  
  // 4. Verificar validade do token
  console.log("4. Verificando validade do token...");
  try {
    const { error } = await supabase.from('profiles').select('id').limit(1);
    if (error) {
      console.log(`   Token: ❌ INVÁLIDO (${error.message})`);
      
      // Tentar refresh
      console.log("   Tentando renovar token...");
      const refreshed = await refreshAuthSession();
      console.log(`   Renovação: ${refreshed ? '✅ SUCESSO' : '❌ FALHA'}`);
      
      if (!refreshed) {
        console.log("=== TESTE INTERROMPIDO: FALHA AO RENOVAR TOKEN ===");
        return {
          success: false,
          internetConnected: true,
          supabaseConnected: true,
          authenticated: true,
          tokenValid: false,
          tokenRefreshed: false,
          errors: ["Token inválido e falha ao renovar"]
        };
      }
    } else {
      console.log("   Token: ✅ VÁLIDO");
    }
  } catch (e) {
    console.error("   Erro ao verificar token:", e);
    return {
      success: false,
      internetConnected: true,
      supabaseConnected: true,
      authenticated: true,
      tokenValid: false,
      errors: ["Erro ao verificar validade do token"]
    };
  }
  
  // 5. Teste completo concluído com sucesso
  console.log("=== TESTE CONCLUÍDO COM SUCESSO ===");
  return {
    success: true,
    internetConnected: true,
    supabaseConnected: true,
    authenticated: true,
    tokenValid: true
  };
};

// Also add the missing functions that are being imported elsewhere
export const checkSupabaseStatus = async (): Promise<boolean> => {
  try {
    const { data } = await supabase.auth.getSession();
    if (!data.session) return false;
    
    // Fazer uma requisição simples para verificar se o token é válido
    const { error } = await supabase.from('profiles').select('id').limit(1);
    return !error;
  } catch (error) {
    console.error("Erro ao verificar status do Supabase:", error);
    return false;
  }
};

export const logAuthStatus = async (): Promise<string | null> => {
  try {
    const { data } = await supabase.auth.getSession();
    const userId = data.session?.user?.id;
    
    if (userId) {
      console.log(`✅ Usuário autenticado: ${userId.substring(0, 8)}...`);
      return userId;
    } else {
      console.warn("⚠️ Nenhum usuário autenticado!");
      return null;
    }
  } catch (error) {
    console.error("❌ Erro ao verificar autenticação:", error);
    return null;
  }
};

export const refreshAuthSession = async (): Promise<boolean> => {
  try {
    console.log("Tentando atualizar a sessão do usuário...");
    
    // Verificar se há sessão atual
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      console.log("Sem sessão para atualizar");
      return false;
    }
    
    // Tentar atualizar a sessão
    const { data, error } = await supabase.auth.refreshSession();
    
    if (error) {
      console.error("Falha ao atualizar sessão:", error);
      return false;
    }
    
    if (!data.session) {
      console.error("Sessão atualizada, mas sem dados de sessão retornados");
      return false;
    }
    
    console.log("Sessão atualizada com sucesso:", data.session.user?.id);
    return true;
    
  } catch (error) {
    console.error("Erro crítico ao atualizar sessão:", error);
    return false;
  }
};
