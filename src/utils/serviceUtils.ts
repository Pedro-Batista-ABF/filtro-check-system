
import { Service, ServiceType } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const validateSession = async () => {
  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData?.session?.user?.id) {
    console.error("ServiceUtils: UID ausente na validação de sessão");
    throw new Error("Usuário não autenticado");
  }
  return sessionData.session.user.id;
};

export const createProcessedService = (service: Service): Service => ({
  id: service.id,
  name: service.name,
  selected: false,
  type: service.id as any, // Usando any para corrigir problema de tipagem
  photos: [],
  quantity: 1
});

export const handleServiceError = (error: unknown): Service[] => {
  console.error("ServiceUtils: Erro ao processar serviços:", error);
  toast.error("Erro ao carregar serviços", {
    description: "Tente novamente em alguns instantes."
  });
  return [];
};

export const logServiceLoadTime = (startTime: number) => {
  const elapsedTime = Date.now() - startTime;
  console.log(`ServiceUtils: 🔥 Carregamento de serviços finalizado em ${elapsedTime}ms`);
};

// Nova função para adicionar diagnóstico de conexão
export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    const startTime = Date.now();
    console.log("ServiceUtils: Verificando conexão com Supabase...");
    
    // Tenta uma query simples para testar a conexão com promise race para timeout
    const timeout = new Promise<null>((_, reject) => 
      setTimeout(() => reject(new Error("Timeout de conexão")), 3000)
    );
    
    const fetchPromise = supabase
      .from('service_types')
      .select('count(*)', { count: 'exact', head: true });
      
    const result = await Promise.race([fetchPromise, timeout]) as any;
    
    // Se timeout vencer, result será null
    if (!result) {
      const elapsedTime = Date.now() - startTime;
      console.error(`ServiceUtils: Timeout de conexão com Supabase após ${elapsedTime}ms`);
      return false;
    }
    
    const { error } = result;
    const elapsedTime = Date.now() - startTime;
    
    if (error) {
      console.error(`ServiceUtils: Erro de conexão com Supabase após ${elapsedTime}ms:`, error);
      return false;
    }
    
    console.log(`ServiceUtils: Conexão com Supabase OK em ${elapsedTime}ms`);
    return true;
  } catch (error) {
    console.error("ServiceUtils: Erro crítico ao verificar conexão:", error);
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
    const timeout = new Promise<null>((_, reject) => 
      setTimeout(() => reject(new Error("Timeout ao buscar serviços")), 5000)
    );
    
    const fetchPromise = supabase
      .from('service_types')
      .select('*')
      .order('name');
      
    const result = await Promise.race([fetchPromise, timeout]) as any;
    
    // Se timeout vencer, result será null
    if (!result) {
      throw new Error("Timeout excedido ao buscar serviços");
    }
    
    const { data, error } = result;
      
    if (error) {
      console.error("ServiceUtils: Erro ao carregar serviços:", error);
      throw error;
    }
    
    if (!Array.isArray(data) || data.length === 0) {
      console.warn("ServiceUtils: Nenhum serviço encontrado");
      return [];
    }
    
    const processedServices = data.map((service: any) => ({
      id: service.id,
      name: service.name,
      selected: false,
      type: service.id as any, // Usando any para corrigir problema de tipagem
      photos: [],
      quantity: 1
    }));
    
    logServiceLoadTime(startTime);
    
    return processedServices;
  } catch (error) {
    return handleServiceError(error);
  }
};
