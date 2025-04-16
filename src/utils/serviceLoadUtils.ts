
import { Service } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { checkSupabaseConnection } from "./connectionUtils";
import { handleServiceError, logServiceLoadTime } from "./serviceProcessingUtils";

export const loadServicesOptimized = async (): Promise<Service[]> => {
  try {
    console.log("ServiceLoadUtils: Iniciando carregamento otimizado de serviços");
    const startTime = Date.now();
    
    const isConnected = await checkSupabaseConnection();
    if (!isConnected) {
      throw new Error("Falha na conexão com o servidor Supabase");
    }
    
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
        console.error(`ServiceLoadUtils: Erro ao carregar serviços (${status}):`, error);
        throw error;
      }
      
      if (!data || !Array.isArray(data)) {
        console.warn("ServiceLoadUtils: Dados inválidos recebidos:", data);
        throw new Error("Formato de dados inválido recebido do servidor");
      }
      
      if (data.length === 0) {
        console.warn("ServiceLoadUtils: Nenhum serviço encontrado");
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
