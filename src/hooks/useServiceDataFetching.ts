
import { useState, useCallback } from "react";
import { Service } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useServiceDataFetching() {
  const [servicesFetched, setServicesFetched] = useState(false);
  const [availableServices, setAvailableServices] = useState<Service[]>([]);

  // Verificar conexão com o Supabase
  const verifyConnection = useCallback(async (): Promise<boolean> => {
    try {
      const startTime = Date.now();
      
      const { data, error } = await supabase
        .from('service_types')
        .select('count')
        .limit(1)
        .single();
        
      const responseTime = Date.now() - startTime;
      console.log(`Tempo de resposta do Supabase: ${responseTime}ms`);
      
      if (error) {
        console.error("Erro ao verificar conexão:", error);
        throw error;
      }
      
      console.log("🟢 Conexão restabelecida");
      return true;
    } catch (error) {
      console.error("🔴 Erro na verificação de conexão:", error);
      return false;
    }
  }, []);

  // Carregar tipos de serviços
  const loadServices = useCallback(async (): Promise<Service[]> => {
    try {
      const { data, error } = await supabase
        .from('service_types')
        .select('*')
        .order('name');
        
      if (error) {
        throw error;
      }
      
      const services: Service[] = (data || []).map(service => ({
        id: service.id,
        name: service.name,
        description: service.description || '',
        selected: false,
        photos: []
      }));
      
      console.log(`Carregados ${services.length} tipos de serviços`);
      setServicesFetched(true);
      setAvailableServices(services);
      return services;
    } catch (error) {
      console.error("Erro ao carregar serviços:", error);
      toast.error("Erro ao carregar lista de serviços");
      return [];
    }
  }, []);

  return {
    loadServices,
    servicesFetched,
    setServicesFetched,
    verifyConnection,
    availableServices
  };
}
