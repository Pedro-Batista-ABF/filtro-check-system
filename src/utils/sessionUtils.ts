
import { supabase, refreshAuthSession } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const validateSession = async () => {
  try {
    console.log("SessionUtils: Iniciando validação de sessão");
    const timeoutPromise = new Promise<null>((_, reject) => 
      setTimeout(() => reject(new Error("Timeout ao validar sessão")), 5000)
    );
    
    const sessionPromise = supabase.auth.getSession();
    
    const { data: sessionData, error } = await Promise.race([
      sessionPromise,
      timeoutPromise
    ]) as any;
    
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
      return null;
    }
    
    console.log(`SessionUtils: Sessão válida para usuário ${sessionData.session.user.id.substring(0, 8)}...`);
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
    return !!data.session?.user?.id;
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
      console.log("=========================");
    } else {
      console.warn("Nenhuma sessão ativa encontrada!");
    }
  } catch (error) {
    console.error("Erro ao obter detalhes da sessão:", error);
  }
};
