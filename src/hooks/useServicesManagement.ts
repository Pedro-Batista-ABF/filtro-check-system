
import { Service, ServiceType } from "@/types";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export function useServicesManagement() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDefaultServices = async () => {
    try {
      const { data: serviceTypes } = await supabase
        .from('service_types')
        .select('*');

      if (!serviceTypes) {
        toast.error("Não foi possível carregar os serviços disponíveis");
        return [];
      }

      // Process services with proper type casting
      const processedServices = serviceTypes.map(service => ({
        id: service.id,
        name: service.name,
        selected: false,
        type: service.id as ServiceType, // Corrigido: usando as ServiceType para evitar o erro TS2352
        photos: []
      }));
      
      setServices(processedServices);
      return processedServices;
    } catch (error) {
      console.error("Error fetching default services:", error);
      toast.error("Erro ao carregar serviços");
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    services,
    setServices,
    loading,
    setLoading,
    fetchDefaultServices
  };
}
