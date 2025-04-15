
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

      // Process services to ensure correct typing
      return serviceTypes.map(service => ({
        id: service.id,
        name: service.name,
        selected: false,
        type: service.id as ServiceType,
        photos: []
      }));
    } catch (error) {
      console.error("Error fetching default services:", error);
      toast.error("Erro ao carregar serviços");
      return [];
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
