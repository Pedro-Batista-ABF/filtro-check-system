
import { supabase, refreshAuthSession } from "@/integrations/supabase/client";

/**
 * Verificar se a conexão com o servidor Supabase está funcionando
 */
export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    // Primeiro, tentar atualizar a sessão para garantir token válido
    await refreshAuthSession();
    
    // Obter a sessão para extrair o token de autenticação
    const { data: sessionData } = await supabase.auth.getSession();
    const authHeader = sessionData?.session ? 
      `Bearer ${sessionData.session.access_token}` : 
      `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlqY3llYmlhaG53ZndyY2dxbGNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ0OTg0MzUsImV4cCI6MjA2MDA3NDQzNX0.MsHyZ9F4nVv0v9q8D7iQK4qgVmxUMdCAxKQun3GuSG4"}`;
    
    // Verificar status da conexão com timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL || "https://yjcyebiahnwfwrcgqlcm.supabase.co"}/rest/v1/`,
      {
        method: 'HEAD',
        headers: {
          'Authorization': authHeader,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlqY3llYmlhaG53ZndyY2dxbGNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ0OTg0MzUsImV4cCI6MjA2MDA3NDQzNX0.MsHyZ9F4nVv0v9q8D7iQK4qgVmxUMdCAxKQun3GuSG4",
          'Content-Type': 'application/json'
        },
        signal: controller.signal,
      }
    );
    
    clearTimeout(timeoutId);
    
    if (response.status === 401) {
      console.warn("Erro de autenticação (401) detectado na verificação de conexão");
      // Tentar refresh da sessão automaticamente
      await refreshAuthSession();
      return false;
    }
    
    return response.ok;
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
    
    // Verificar conexão com internet usando um serviço confiável
    const response = await fetch("https://www.google.com", {
      method: 'HEAD',
      mode: 'no-cors', // Importante para evitar problemas de CORS
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    return true; // Se chegou aqui, há conexão
  } catch (error) {
    console.error("Erro ao verificar conexão com internet:", error);
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
  }
  
  console.log("=============================");
  
  return {
    internet: hasInternet,
    supabase: hasSupabase,
    session: hasSession,
    sessionDetails: hasSession ? data.session : null
  };
};
