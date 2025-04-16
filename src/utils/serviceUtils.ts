
import { Service, ServiceType, CycleOutcome } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const validateSession = async () => {
  try {
    // Adicionar timeout para evitar espera infinita
    const timeoutPromise = new Promise<null>((_, reject) => 
      setTimeout(() => reject(new Error("Timeout ao validar sessão")), 5000)
    );
    
    const sessionPromise = supabase.auth.getSession();
    
    // Race entre o timeout e a validação da sessão
    const { data: sessionData, error } = await Promise.race([
      sessionPromise,
      timeoutPromise
    ]) as any;
    
    if (error) {
      console.error("ServiceUtils: Erro ao validar sessão:", error);
      toast.error("Erro de autenticação", {
        description: "Não foi possível validar sua sessão. Por favor, faça login novamente."
      });
      return null;
    }
    
    if (!sessionData?.session?.user?.id) {
      console.error("ServiceUtils: UID ausente na validação de sessão");
      return null;
    }
    
    return sessionData.session.user.id;
  } catch (error) {
    console.error("ServiceUtils: Erro crítico ao validar sessão:", error);
    toast.error("Erro de autenticação", {
      description: "Ocorreu um erro crítico ao validar sua sessão. Por favor, tente novamente mais tarde."
    });
    return null;
  }
};

export const createProcessedService = (service: Service): Service => ({
  id: service.id,
  name: service.name,
  selected: false,
  type: service.type || service.id as any,
  photos: [],
  quantity: 1
});

export const handleServiceError = (error: unknown): Service[] => {
  const errorMessage = error instanceof Error ? error.message : String(error);
  console.error("ServiceUtils: Erro ao processar serviços:", error);
  
  // Mensagens de erro mais específicas
  if (errorMessage.includes("fetch failed") || errorMessage.includes("NetworkError")) {
    toast.error("Erro de conexão com o servidor", {
      description: "Não foi possível estabelecer conexão com o servidor. Verifique sua conexão de internet e tente novamente."
    });
  } else if (errorMessage.includes("JSON")) {
    toast.error("Erro ao processar resposta do servidor", {
      description: "Os dados recebidos do servidor estão corrompidos. Tente novamente mais tarde."
    });
  } else if (errorMessage.includes("undefined") || errorMessage.includes("null")) {
    toast.error("Erro de dados", {
      description: "Os dados necessários não foram encontrados. Tente novamente mais tarde."
    });
  } else {
    toast.error("Erro ao carregar serviços", {
      description: "Ocorreu um erro inesperado. Tente novamente em alguns instantes."
    });
  }
  
  return [];
};

export const logServiceLoadTime = (startTime: number) => {
  const elapsedTime = Date.now() - startTime;
  console.log(`ServiceUtils: 🔥 Carregamento de serviços finalizado em ${elapsedTime}ms`);
};

// Função aprimorada para diagnóstico de conexão
export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    const startTime = Date.now();
    console.log("ServiceUtils: Verificando conexão com Supabase...");
    
    // Implementamos um timeout mais curto para evitar esperas longas
    const timeoutMs = 5000;
    
    // Tenta uma query simples para testar a conexão com promise race para timeout
    const timeout = new Promise<null>((_, reject) => 
      setTimeout(() => reject(new Error("Timeout de conexão")), timeoutMs)
    );
    
    // Utilizamos uma query leve - apenas checando se o serviço responde
    const fetchPromise = supabase
      .from('service_types')
      .select('count(*)', { count: 'exact', head: true })
      .abortSignal(AbortSignal.timeout(timeoutMs));
      
    try {
      const result = await Promise.race([fetchPromise, timeout]) as any;
      
      // Se timeout vencer, result será null
      if (!result) {
        const elapsedTime = Date.now() - startTime;
        console.error(`ServiceUtils: Timeout de conexão com Supabase após ${elapsedTime}ms`);
        return false;
      }
      
      const { error, count } = result;
      const elapsedTime = Date.now() - startTime;
      
      if (error) {
        console.error(`ServiceUtils: Erro de conexão com Supabase após ${elapsedTime}ms:`, error);
        toast.error("Erro de conexão", {
          description: `Não foi possível conectar ao servidor: ${error.message || "Erro desconhecido"}`
        });
        return false;
      }
      
      console.log(`ServiceUtils: Conexão com Supabase OK em ${elapsedTime}ms - ${count || 0} tipos de serviço encontrados`);
      return true;
    } catch (error) {
      const elapsedTime = Date.now() - startTime;
      console.error(`ServiceUtils: Falha na corrida de promises após ${elapsedTime}ms:`, error);
      
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast.error("Erro de conexão", {
        description: `Falha ao comunicar com o servidor: ${errorMessage}`
      });
      
      return false;
    }
  } catch (error) {
    console.error("ServiceUtils: Erro crítico ao verificar conexão:", error);
    toast.error("Erro crítico de conexão", {
      description: "Ocorreu um erro interno ao verificar a conexão com o servidor."
    });
    return false;
  }
};

// Nova função para otimizar o carregamento de serviços
export const loadServicesOptimized = async (): Promise<Service[]> => {
  try {
    console.log("ServiceUtils: Iniciando carregamento otimizado de serviços");
    const startTime = Date.now();
    
    // Primeiro verificamos a conexão
    const isConnected = await checkSupabaseConnection();
    if (!isConnected) {
      throw new Error("Falha na conexão com o servidor Supabase");
    }
    
    // Tentamos carregar com timeout implementado manualmente
    const timeoutMs = 8000;
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), timeoutMs);
    
    try {
      const { data, error, status } = await supabase
        .from('service_types')
        .select('*')
        .order('name')
        .abortSignal(abortController.signal);
      
      clearTimeout(timeoutId);
      
      if (error) {
        console.error(`ServiceUtils: Erro ao carregar serviços (${status}):`, error);
        throw error;
      }
      
      if (!data || !Array.isArray(data)) {
        console.warn("ServiceUtils: Dados inválidos recebidos:", data);
        throw new Error("Formato de dados inválido recebido do servidor");
      }
      
      if (data.length === 0) {
        console.warn("ServiceUtils: Nenhum serviço encontrado");
        toast.warning("Nenhum serviço disponível", {
          description: "Não há serviços cadastrados no sistema."
        });
        return [];
      }
      
      const processedServices = data.map((service: any) => ({
        id: service.id,
        name: service.name,
        selected: false,
        type: service.id,
        photos: [],
        quantity: 1
      }));
      
      logServiceLoadTime(startTime);
      
      return processedServices;
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new Error(`Timeout de ${timeoutMs/1000}s excedido ao buscar serviços`);
      }
      throw error;
    }
  } catch (error) {
    return handleServiceError(error);
  }
};
