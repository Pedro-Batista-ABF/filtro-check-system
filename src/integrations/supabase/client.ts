// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://yjcyebiahnwfwrcgqlcm.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlqY3llYmlhaG53ZndyY2dxbGNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ0OTg0MzUsImV4cCI6MjA2MDA3NDQzNX0.MsHyZ9F4nVv0v9q8D7iQK4qgVmxUMdCAxKQun3GuSG4";

// Configurações personalizadas para o cliente Supabase com melhorias para persistência e refresh automático
const options = {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'supabase.auth.token',
    storage: localStorage,
    flowType: 'implicit',
  },
  global: {
    headers: {
      'apikey': SUPABASE_PUBLISHABLE_KEY,
      'Content-Type': 'application/json'
    },
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
  // Aumentar o timeout global para 10 segundos
  fetch: (url: string, options: RequestInit) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    return fetch(url, {
      ...options,
      signal: controller.signal,
    }).finally(() => clearTimeout(timeoutId));
  }
};

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, options);

// Configurar interceptor para atualizar headers em todas as requisições
const originalFetch = supabase.rest.headers;
supabase.rest.headers = async () => {
  const { data } = await supabase.auth.getSession();
  const baseHeaders = await originalFetch();
  
  if (data.session?.access_token) {
    return {
      ...baseHeaders,
      'Authorization': `Bearer ${data.session.access_token}`
    };
  }
  
  return baseHeaders;
};

// Log inicial para verificar a inicialização do cliente Supabase
console.log("Cliente Supabase inicializado com persistência aprimorada");

// Verificar sessão inicial
supabase.auth.getSession().then(async ({ data, error }) => {
  if (error) {
    console.error("Erro ao obter sessão inicial:", error);
  } else if (data.session) {
    console.log(`Sessão inicial encontrada: ${data.session.user.id}`);
    
    // Verificar quando o token expira
    const expiresAt = data.session.expires_at * 1000;
    const now = Date.now();
    const timeToExpire = expiresAt - now;
    console.log(`Token expira em: ${Math.floor(timeToExpire / 60000)} minutos`);
    
    if (timeToExpire < 300000) { // menos de 5 minutos
      console.log("Token próximo de expirar, renovando...");
      refreshAuthSession().then(refreshed => {
        console.log(`Renovação automática do token: ${refreshed ? 'SUCESSO' : 'FALHA'}`);
      });
    }
    
    // Verificar se o token é válido com uma requisição de teste
    try {
      const { error: testError } = await supabase.from('profiles').select('id').limit(1);
      if (testError) {
        console.warn("Sessão inválida ou token expirado, tentando renovar...");
        await refreshAuthSession();
      } else {
        console.log("Sessão validada com sucesso");
      }
    } catch (e) {
      console.error("Erro ao validar sessão:", e);
    }
  } else {
    console.log("Nenhuma sessão inicial encontrada");
  }
});

// Função para verificar se o Supabase está acessível com melhor tratamento de erros
export const checkSupabaseStatus = async (): Promise<boolean> => {
  try {
    const startTime = Date.now();
    
    // Primeiro, obter a sessão atual para garantir autenticação
    const { data: sessionData } = await supabase.auth.getSession();
    
    // Tentativa de conexão com headers adequados
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    
    const headers: Record<string, string> = {
      'apikey': SUPABASE_PUBLISHABLE_KEY,
      'Content-Type': 'application/json',
    };
    
    // Adicionar token de autorização se disponível
    if (sessionData?.session?.access_token) {
      headers['Authorization'] = `Bearer ${sessionData.session.access_token}`;
    }
    
    const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      method: 'HEAD',
      headers,
      signal: controller.signal,
      cache: 'no-store', // Evitar cache
    });
    
    clearTimeout(timeoutId);
    
    const elapsedTime = Date.now() - startTime;
    console.log(`Verificação de status do Supabase completada em ${elapsedTime}ms (Status: ${response.status})`);
    
    if (response.status === 401) {
      console.warn("Erro de autenticação (401) detectado. Tentando atualizar a sessão...");
      await refreshAuthSession();
      
      // Fazer uma segunda tentativa após atualizar o token
      const retry = await fetch(`${SUPABASE_URL}/rest/v1/`, {
        method: 'HEAD',
        headers: {
          ...headers,
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token || ''}`
        },
      });
      
      return retry.ok;
    }
    
    return response.ok;
  } catch (error) {
    console.error("Erro ao verificar status do Supabase:", error);
    return false;
  }
};

// Função aprimorada para forçar atualização do token
export const refreshAuthSession = async (): Promise<boolean> => {
  try {
    console.log("Tentando atualizar a sessão do usuário...");
    
    // Verificar se há sessão atual
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      console.log("Sem sessão para atualizar");
      return false;
    }
    
    // Tentar atualizar a sessão com retry em caso de falha
    let attempts = 0;
    const maxAttempts = 3;
    
    while (attempts < maxAttempts) {
      try {
        const { data, error } = await supabase.auth.refreshSession();
        
        if (error) {
          console.error(`Falha ao atualizar sessão (tentativa ${attempts + 1}/${maxAttempts}):`, error);
          attempts++;
          await new Promise(resolve => setTimeout(resolve, 1000)); // Esperar 1 segundo entre tentativas
          continue;
        }
        
        if (!data.session) {
          console.error(`Sessão atualizada, mas sem dados de sessão retornados (tentativa ${attempts + 1}/${maxAttempts})`);
          attempts++;
          continue;
        }
        
        console.log("Sessão atualizada com sucesso:", data.session.user?.id);
        
        // Verificar quando o token atualizado expira
        const expiresAt = data.session.expires_at * 1000;
        const now = Date.now();
        const timeToExpire = expiresAt - now;
        console.log(`Novo token expira em: ${Math.floor(timeToExpire / 60000)} minutos`);
        
        return true;
      } catch (attemptError) {
        console.error(`Erro na tentativa ${attempts + 1}/${maxAttempts}:`, attemptError);
        attempts++;
        await new Promise(resolve => setTimeout(resolve, 1000)); // Esperar 1 segundo entre tentativas
      }
    }
    
    // Se chegou aqui, todas as tentativas falharam
    console.error(`Falha ao atualizar sessão após ${maxAttempts} tentativas`);
    
    // Última tentativa: fazer logout e forçar login novamente
    try {
      await supabase.auth.signOut();
      console.log("Logout forçado devido a falhas persistentes no refresh");
      return false;
    } catch (logoutError) {
      console.error("Erro ao forçar logout:", logoutError);
      return false;
    }
  } catch (error) {
    console.error("Erro crítico ao atualizar sessão:", error);
    return false;
  }
};

// Adiciona middleware para todas as chamadas supabase
export const withAuthRefresh = async <T>(
  operation: () => Promise<T>
): Promise<T> => {
  try {
    // Tenta a operação normalmente
    return await operation();
  } catch (error: any) {
    // Se for erro 401, tenta renovar o token e tenta a operação novamente
    if (error.status === 401 || error.code === 'PGRST301') {
      console.warn("Erro 401 detectado, tentando renovar sessão...");
      const refreshed = await refreshAuthSession();
      
      if (refreshed) {
        console.log("Sessão renovada, tentando operação novamente...");
        return await operation();
      }
    }
    
    // Se não for erro 401 ou não conseguir renovar, propaga o erro
    throw error;
  }
};

// Função otimizada para verificar e logar o status da autenticação
export const logAuthStatus = async (): Promise<string | null> => {
  try {
    const { data } = await supabase.auth.getSession();
    const userId = data.session?.user?.id;
    
    if (userId) {
      console.log(`✅ Usuário autenticado: ${userId.substring(0, 8)}...`);
      
      // Verificar validade do token de forma mais robusta
      try {
        const { error } = await supabase.from('profiles').select('id').limit(1);
        if (error) {
          console.warn(`⚠️ Sessão presente mas com erro ao validar: ${error.message}`);
          await refreshAuthSession();
        }
      } catch (validationError) {
        console.error("Erro ao validar token:", validationError);
      }
      
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

// Criar uma função que obtenha os headers de autenticação atuais
export const getAuthHeaders = async () => {
  const { data } = await supabase.auth.getSession();
  
  // Se tiver uma sessão, use o access_token do usuário
  if (data.session?.access_token) {
    return {
      'Authorization': `Bearer ${data.session.access_token}`,
      'apikey': SUPABASE_PUBLISHABLE_KEY
    };
  }
  
  // Caso contrário, use apenas a chave pública
  return {
    'apikey': SUPABASE_PUBLISHABLE_KEY
  };
};

// Função para fazer fetch com headers de autenticação atualizados
export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const headers = await getAuthHeaders();
  
  return fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
      'Content-Type': 'application/json',
    },
  });
};

// Verificar eventos de autenticação com melhor logging
supabase.auth.onAuthStateChange((event, session) => {
  console.log(`Evento de autenticação: ${event}`);
  
  if (event === 'SIGNED_IN') {
    console.log('Usuário autenticado com sucesso');
    localStorage.setItem('last_auth_event', JSON.stringify({
      event: 'SIGNED_IN',
      timestamp: Date.now(),
      userId: session?.user?.id
    }));
  } else if (event === 'SIGNED_OUT') {
    console.log('Usuário desconectado');
    localStorage.setItem('last_auth_event', JSON.stringify({
      event: 'SIGNED_OUT',
      timestamp: Date.now()
    }));
  } else if (event === 'TOKEN_REFRESHED') {
    console.log('Token atualizado automaticamente');
    if (session) {
      const expiresAt = session.expires_at * 1000;
      const now = Date.now();
      const timeToExpire = expiresAt - now;
      console.log(`Token atualizado expira em: ${Math.floor(timeToExpire / 60000)} minutos`);
      localStorage.setItem('last_token_refresh', JSON.stringify({
        timestamp: Date.now(),
        expiresAt: expiresAt
      }));
    }
  }
});

// Adicionar função para realizar um teste completo de conectividade
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
  } catch (tokenError) {
    console.error("   Erro ao verificar token:", tokenError);
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
