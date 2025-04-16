
import { Service, ServiceType } from "@/types";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { handleDatabaseError } from "@/utils/errorHandlers";
import { serviceTypeService } from "@/services/supabase/serviceTypeService";

export function useServicesManagement() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  const fetchDefaultServices = async () => {
    // Registrar o início da operação
    console.log("useServicesManagement: Iniciando busca de serviços padrão");
    
    try {
      setLoading(true);
      setError(null);
      
      // Verificação explícita da sessão
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session?.user?.id) {
        console.error("useServicesManagement: UID ausente na busca de serviços");
        setError("Usuário não autenticado");
        setServices([]);
        setLoading(false);
        return [];
      }
      
      console.log("useServicesManagement: UID confirmado, buscando tipos de serviço");
      
      // Buscar tipos de serviço
      let serviceTypes: Service[] = [];
      try {
        serviceTypes = await serviceTypeService.getServiceTypes();
        
        // Verificar se os dados são válidos
        if (!Array.isArray(serviceTypes)) {
          console.error("useServicesManagement: serviceTypes não é um array");
          throw new Error("Formato de dados inválido");
        }
        
        console.log(`useServicesManagement: ${serviceTypes.length} tipos de serviço encontrados`);
        
        if (serviceTypes.length === 0) {
          console.warn("useServicesManagement: Nenhum serviço encontrado");
          setError("Não foram encontrados serviços disponíveis");
          setServices([]);
          setLoading(false);
          return [];
        }
      } catch (serviceError) {
        console.error("useServicesManagement: Erro ao buscar tipos de serviço:", serviceError);
        setError("Erro ao carregar tipos de serviço");
        setServices([]);
        setLoading(false);
        return [];
      }
      
      // Processar serviços
      const processedServices = serviceTypes.map(service => ({
        id: service.id,
        name: service.name,
        selected: false,
        type: service.id as unknown as ServiceType,
        photos: [],
        quantity: 1
      }));
      
      console.log("useServicesManagement: Serviços processados:", processedServices.length);
      setServices(processedServices);
      setInitialized(true);
      setLoading(false);
      
      console.log("useServicesManagement: 🔥 Carregamento de serviços finalizado com sucesso");
      return processedServices;
    } catch (error) {
      console.error("useServicesManagement: Erro geral:", error);
      setError(error instanceof Error ? error.message : "Erro desconhecido");
      toast.error("Erro ao carregar serviços", {
        description: "Verifique sua conexão ou tente novamente mais tarde"
      });
      setServices([]);
      setLoading(false);
      return [];
    } finally {
      // Garantir que o loading seja sempre definido como false ao final
      setLoading(false);
      console.log("useServicesManagement: Finalizando busca de serviços (finally)");
    }
  };

  return {
    services,
    setServices,
    loading,
    setLoading,
    error,
    initialized,
    fetchDefaultServices
  };
}
