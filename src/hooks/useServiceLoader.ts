
import { useState, useCallback } from "react";
import { Service } from "@/types";
import { serviceTypeService } from "@/services/supabase/serviceTypeService";
import { validateSession } from "@/utils/sessionUtils";
import { handleServiceError, logServiceLoadTime, createProcessedService } from "@/utils/serviceProcessingUtils";
import { loadServicesOptimized } from "@/utils/serviceLoadUtils";

export const useServiceLoader = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadStartTime] = useState(Date.now());
  const [connectionChecked, setConnectionChecked] = useState(false);

  const loadServices = useCallback(async (): Promise<Service[]> => {
    console.log("useServiceLoader: Iniciando carregamento de serviços");
    
    try {
      // Primeiro, tentamos o método otimizado
      if (!connectionChecked) {
        const optimizedResult = await loadServicesOptimized();
        setConnectionChecked(true);
        
        if (optimizedResult && optimizedResult.length > 0) {
          console.log(`useServiceLoader: ${optimizedResult.length} serviços encontrados via método otimizado`);
          return optimizedResult;
        }
      }
      
      // Se o otimizado falhar, tentamos o método original
      await validateSession();
      const serviceTypes = await serviceTypeService.getServiceTypes();
      
      if (!Array.isArray(serviceTypes)) {
        throw new Error("Formato de dados inválido");
      }
      
      console.log(`useServiceLoader: ${serviceTypes.length} serviços encontrados via método padrão`);
      const processedServices = serviceTypes.map(createProcessedService);
      
      logServiceLoadTime(loadStartTime);
      return processedServices;
    } catch (error) {
      return handleServiceError(error);
    }
  }, [loadStartTime, connectionChecked]);

  return {
    loading,
    setLoading,
    error,
    setError,
    loadServices,
    connectionChecked
  };
};
