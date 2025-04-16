
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const validateSession = async () => {
  try {
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
      toast.error("Erro de autenticação", {
        description: "Não foi possível validar sua sessão. Por favor, faça login novamente."
      });
      return null;
    }
    
    if (!sessionData?.session?.user?.id) {
      console.error("SessionUtils: UID ausente na validação de sessão");
      return null;
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
