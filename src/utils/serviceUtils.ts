
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
  type: service.id as ServiceType, // Corrigindo a conversão explicita para ServiceType
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
    
    // Tenta uma query simples para testar a conexão
    const { data, error } = await supabase
      .from('service_types')
      .select('count(*)', { count: 'exact', head: true });
      
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
    
    // Tentamos carregar com timeout reduzido
    const { data, error } = await supabase
      .from('service_types')
      .select('*')
      .order('name')
      .timeout(5000); // Timeout explícito de 5 segundos
      
    if (error) {
      console.error("ServiceUtils: Erro ao carregar serviços:", error);
      throw error;
    }
    
    if (!Array.isArray(data) || data.length === 0) {
      console.warn("ServiceUtils: Nenhum serviço encontrado");
      return [];
    }
    
    const processedServices = data.map(createProcessedService);
    logServiceLoadTime(startTime);
    
    return processedServices;
  } catch (error) {
    return handleServiceError(error);
  }
};
