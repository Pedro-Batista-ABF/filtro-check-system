
import { useState, useEffect } from "react";
import { Service } from "@/types";
import { serviceTypeService } from "@/services/supabase/serviceTypeService";
import { validateSession, createProcessedService, handleServiceError, logServiceLoadTime } from "@/utils/serviceUtils";

export const useServiceLoader = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadStartTime] = useState(Date.now());

  const loadServices = async (): Promise<Service[]> => {
    console.log("useServiceLoader: Iniciando carregamento de serviços");
    
    try {
      await validateSession();
      const serviceTypes = await serviceTypeService.getServiceTypes();
      
      if (!Array.isArray(serviceTypes)) {
        throw new Error("Formato de dados inválido");
      }
      
      console.log(`useServiceLoader: ${serviceTypes.length} serviços encontrados`);
      const processedServices = serviceTypes.map(createProcessedService);
      
      logServiceLoadTime(loadStartTime);
      return processedServices;
    } catch (error) {
      return handleServiceError(error);
    }
  };

  return {
    loading,
    setLoading,
    error,
    setError,
    loadServices
  };
};
