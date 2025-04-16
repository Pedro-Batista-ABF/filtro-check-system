
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    const startTime = Date.now();
    console.log("ConnectionUtils: Verificando conexão com Supabase...");
    
    const timeoutMs = 5000;
    
    const timeout = new Promise<null>((_, reject) => 
      setTimeout(() => reject(new Error("Timeout de conexão")), timeoutMs)
    );
    
    const fetchPromise = supabase
      .from('service_types')
      .select('count(*)', { count: 'exact', head: true })
      .abortSignal(AbortSignal.timeout(timeoutMs));
      
    try {
      const result = await Promise.race([fetchPromise, timeout]) as any;
      
      if (!result) {
        const elapsedTime = Date.now() - startTime;
        console.error(`ConnectionUtils: Timeout de conexão com Supabase após ${elapsedTime}ms`);
        return false;
      }
      
      const { error, count } = result;
      const elapsedTime = Date.now() - startTime;
      
      if (error) {
        console.error(`ConnectionUtils: Erro de conexão com Supabase após ${elapsedTime}ms:`, error);
        toast.error("Erro de conexão", {
          description: `Não foi possível conectar ao servidor: ${error.message || "Erro desconhecido"}`
        });
        return false;
      }
      
      console.log(`ConnectionUtils: Conexão com Supabase OK em ${elapsedTime}ms - ${count || 0} tipos de serviço encontrados`);
      return true;
    } catch (error) {
      const elapsedTime = Date.now() - startTime;
      console.error(`ConnectionUtils: Falha na corrida de promises após ${elapsedTime}ms:`, error);
      
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast.error("Erro de conexão", {
        description: `Falha ao comunicar com o servidor: ${errorMessage}`
      });
      
      return false;
    }
  } catch (error) {
    console.error("ConnectionUtils: Erro crítico ao verificar conexão:", error);
    toast.error("Erro crítico de conexão", {
      description: "Ocorreu um erro interno ao verificar a conexão com o servidor."
    });
    return false;
  }
};
