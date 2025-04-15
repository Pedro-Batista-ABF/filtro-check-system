
import { Service, ServiceType } from "@/types";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { handleDatabaseError } from "@/utils/errorHandlers";

export function useServicesManagement() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDefaultServices = async () => {
    try {
      console.log("Iniciando busca de serviços padrão");
      
      const { data: serviceTypes, error } = await supabase
        .from('service_types')
        .select('*');

      if (error) {
        throw handleDatabaseError(error, "Erro ao carregar tipos de serviço");
      }

      if (!serviceTypes || serviceTypes.length === 0) {
        console.warn("Nenhum tipo de serviço encontrado");
        setError("Não foram encontrados serviços disponíveis");
        setServices([]);
        setLoading(false);
        return [];
      }

      console.log(`${serviceTypes.length} tipos de serviço encontrados`);
      
      // Process services with proper type casting
      const processedServices = serviceTypes.map(service => ({
        id: service.id,
        name: service.name,
        selected: false,
        type: service.id as unknown as ServiceType, // Usando unknown como intermediário para evitar o erro TS2352
        photos: []
      }));
      
      setServices(processedServices);
      setLoading(false);
      return processedServices;
    } catch (error) {
      console.error("Error fetching default services:", error);
      setError("Erro ao carregar serviços");
      toast.error("Erro ao carregar serviços", {
        description: error instanceof Error ? error.message : "Tente novamente mais tarde"
      });
      setServices([]);
      setLoading(false);
      return [];
    }
  };

  return {
    services,
    setServices,
    loading,
    setLoading,
    error,
    fetchDefaultServices
  };
}
