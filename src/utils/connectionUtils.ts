
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
 * Registra o status de autenticação no console
 */
export async function logAuthStatus(): Promise<void> {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error("Erro ao obter sessão:", error);
      return;
    }
    
    const isAuthenticated = !!data.session;
    console.log(`Status de autenticação: ${isAuthenticated ? 'Autenticado' : 'Não autenticado'}`);
    
    if (isAuthenticated) {
      const { data: userData } = await supabase.auth.getUser();
      console.log("Usuário atual:", userData.user?.email);
    }
  } catch (error) {
    console.error("Erro ao verificar status de autenticação:", error);
  }
}

/**
 * Aguarda a conexão com o servidor
 * Retorna uma Promise que resolve quando a conexão estiver estabelecida
 */
export function waitForConnection(maxAttempts = 10, delay = 2000): Promise<boolean> {
  return new Promise((resolve) => {
    let attempts = 0;
    
    const checkConnection = async () => {
      attempts++;
      const isConnected = await checkSupabaseConnection();
      
      if (isConnected) {
        resolve(true);
        return;
      }
      
      if (attempts >= maxAttempts) {
        resolve(false);
        return;
      }
      
      setTimeout(checkConnection, delay);
    };
    
    checkConnection();
  });
}

/**
 * Registra informações sobre a rede do usuário
 */
export function logNetworkInfo(): void {
  if (!navigator) return;
  
  // Verificar tipo de conexão se disponível
  if ('connection' in navigator) {
    // @ts-ignore - Propriedade não reconhecida pelo TypeScript
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (connection) {
      console.log("Informações de rede:", {
        // @ts-ignore
        type: connection.type,
        // @ts-ignore
        effectiveType: connection.effectiveType,
        // @ts-ignore
        downlinkMax: connection.downlinkMax,
        // @ts-ignore
        downlink: connection.downlink,
        // @ts-ignore
        rtt: connection.rtt,
        // @ts-ignore
        saveData: connection.saveData
      });
    }
  }
  
  // Verificar se está online
  console.log(`Status online: ${navigator.onLine ? 'Sim' : 'Não'}`);
}
