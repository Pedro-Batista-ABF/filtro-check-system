
import { Service, ServiceType } from "@/types";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { handleDatabaseError } from "@/utils/errorHandlers";
import { serviceTypeService } from "@/services/supabase/serviceTypeService";

export function useServicesManagement() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [loadStartTime] = useState(Date.now());

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
        // Garantir retorno de array vazio em caso de falha
        return [];
      }
      
      console.log(`useServicesManagement: UID confirmado (${sessionData.session.user.id}), buscando tipos de serviço`);
      
      // Buscar tipos de serviço
      let serviceTypes: Service[] = [];
      try {
        serviceTypes = await serviceTypeService.getServiceTypes();
        
        // Verificação rigorosa para garantir array válido
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
      
      const elapsedTime = Date.now() - loadStartTime;
      console.log(`useServicesManagement: 🔥 Carregamento de serviços finalizado com sucesso em ${elapsedTime}ms`);
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

  // Inicialização automática para garantir que os dados existam
  useEffect(() => {
    if (!initialized && loading) {
      fetchDefaultServices();
    }
  }, [initialized, loading]);

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
