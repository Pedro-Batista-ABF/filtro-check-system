
import { supabase, refreshAuthSession } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const validateSession = async () => {
  try {
    console.log("SessionUtils: Iniciando validação de sessão");
    
    // Primeiro, tentar obter a sessão atual
    const { data: sessionData, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error("SessionUtils: Erro ao validar sessão:", error);
      
      // Tentar atualizar a sessão automaticamente
      console.log("SessionUtils: Tentando atualizar sessão...");
      const refreshed = await refreshAuthSession();
      
      if (!refreshed) {
        toast.error("Erro de autenticação", {
          description: "Não foi possível validar sua sessão. Por favor, faça login novamente."
        });
        return null;
      }
      
      // Se conseguiu atualizar, buscar a sessão novamente
      const { data: refreshedData } = await supabase.auth.getSession();
      
      if (!refreshedData?.session?.user?.id) {
        console.error("SessionUtils: UID ausente após renovação de sessão");
        return null;
      }
      
      console.log("SessionUtils: Sessão renovada com sucesso");
      return refreshedData.session.user.id;
    }
    
    if (!sessionData?.session?.user?.id) {
      console.error("SessionUtils: UID ausente na validação de sessão");
      
      // Tentar atualizar a sessão como última chance
      const refreshed = await refreshAuthSession();
      if (refreshed) {
        // Verificar novamente após refresh
        const { data: refreshedData } = await supabase.auth.getSession();
        if (refreshedData?.session?.user?.id) {
          return refreshedData.session.user.id;
        }
      }
      
      return null;
    }
    
    console.log(`SessionUtils: Sessão válida para usuário ${sessionData.session.user.id.substring(0, 8)}...`);
    
    // Verificar se o token está próximo de expirar (menos de 5 minutos)
    const expiresAt = sessionData.session.expires_at * 1000;
    const now = Date.now();
    const timeToExpire = expiresAt - now;
    
    if (timeToExpire < 300000) { // 5 minutos
      console.warn("SessionUtils: Token próximo de expirar, renovando...");
      await refreshAuthSession();
    }
    
    return sessionData.session.user.id;
  } catch (error) {
    console.error("SessionUtils: Erro crítico ao validar sessão:", error);
    toast.error("Erro de autenticação", {
      description: "Ocorreu um erro crítico ao validar sua sessão. Por favor, tente novamente mais tarde."
    });
    return null;
  }
};

// Função para verificar se há uma sessão ativa
export const hasActiveSession = async (): Promise<boolean> => {
  try {
    const { data } = await supabase.auth.getSession();
    
    if (!data.session?.user?.id) {
      return false;
    }
    
    // Verificar se o token está próximo de expirar (menos de 2 minutos)
    const expiresAt = data.session.expires_at * 1000;
    const now = Date.now();
    const timeToExpire = expiresAt - now;
    
    if (timeToExpire < 120000) { // 2 minutos
      console.warn("SessionUtils: Token próximo de expirar, renovando...");
      const refreshed = await refreshAuthSession();
      return refreshed;
    }
    
    return true;
  } catch (error) {
    console.error("Erro ao verificar sessão ativa:", error);
    return false;
  }
};

// Função para verificar e logar detalhes da sessão atual
export const logSessionDetails = async () => {
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
    } else {
      console.warn("Nenhuma sessão ativa encontrada!");
    }
  } catch (error) {
    console.error("Erro ao obter detalhes da sessão:", error);
  }
};

// Função para garantir que a sessão é válida antes das operações
export const ensureValidSession = async (): Promise<string | null> => {
  // Validar sessão atual
  const userId = await validateSession();
  
  if (!userId) {
    console.error("Sessão inválida ou expirada");
    
    // Se não conseguiu validar, tenta refresh mais uma vez
    const refreshed = await refreshAuthSession();
    if (!refreshed) {
      toast.error("Sessão expirada", {
        description: "Por favor, faça login novamente para continuar"
      });
      return null;
    }
    
    // Verificar se a sessão foi atualizada com sucesso
    const { data } = await supabase.auth.getSession();
    return data.session?.user?.id || null;
  }
  
  return userId;
};
