
import { useState, useCallback } from 'react';
import { Service } from '@/types';
import { useServicesManagement } from './useServicesManagement';
import { supabase } from '@/integrations/supabase/client';

export function useServiceDataFetching() {
  const [servicesFetched, setServicesFetched] = useState(false);
  const { services, fetchDefaultServices } = useServicesManagement();

  const loadServices = useCallback(async () => {
    if (servicesFetched) return services;

    try {
      console.log("useServiceDataFetching: Buscando serviços");
      const loadedServices = await fetchDefaultServices();
      setServicesFetched(true);
      return loadedServices;
    } catch (error) {
      console.error("useServiceDataFetching: Erro ao carregar serviços:", error);
      return getEmergencyServices();
    }
  }, [servicesFetched, services, fetchDefaultServices]);

  const getEmergencyServices = (): Service[] => [{
    id: "servico_emergencia_load",
    name: "Serviço de Emergência",
    selected: false,
    type: "servico_emergencia_load" as any,
    photos: [],
    quantity: 1
  }];

  const verifyConnection = async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      return !!sessionData?.session?.user?.id;
    } catch (error) {
      console.error("useServiceDataFetching: Erro ao verificar sessão:", error);
      return false;
    }
  };

  return {
    loadServices,
    servicesFetched,
    setServicesFetched,
    verifyConnection
  };
}
