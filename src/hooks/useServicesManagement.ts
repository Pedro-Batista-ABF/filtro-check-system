
import { Service, ServiceType } from "@/types";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
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
        setLoading(false);
        // Garantir retorno de array com serviços padrão em caso de falha
        return [
          {
            id: "servico_padrao",
            name: "Serviço Padrão",
            selected: false,
            type: "servico_padrao" as any,
            photos: [],
            quantity: 1
          }
        ];
      }
      
      console.log(`useServicesManagement: UID confirmado (${sessionData.session.user.id}), buscando tipos de serviço`);
      
      // Buscar tipos de serviço - agora sempre retorna um array, mesmo que vazio
      let serviceTypes = await serviceTypeService.getServiceTypes();
      
      // Verificação rigorosa para garantir array válido
      if (!Array.isArray(serviceTypes)) {
        console.error("useServicesManagement: serviceTypes não é um array");
        serviceTypes = [
          {
            id: "servico_emergencia",
            name: "Serviço de Emergência",
            selected: false,
            type: "servico_emergencia" as any,
            photos: [],
            quantity: 1
          }
        ];
      }
      
      console.log(`useServicesManagement: ${serviceTypes.length} tipos de serviço encontrados`);
      
      // Serviços de fallback se não houver nenhum
      if (serviceTypes.length === 0) {
        console.warn("useServicesManagement: Nenhum serviço encontrado, usando padrões");
        serviceTypes = [
          {
            id: "limpeza_emergencia",
            name: "Limpeza (Emergência)",
            selected: false,
            type: "limpeza_emergencia" as any,
            photos: [],
            quantity: 1
          },
          {
            id: "manutencao_emergencia",
            name: "Manutenção (Emergência)",
            selected: false,
            type: "manutencao_emergencia" as any,
            photos: [],
            quantity: 1
          }
        ];
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
      
      // Serviços padrão garantidos em caso de erro
      const fallbackServices = [
        {
          id: "limpeza_fallback",
          name: "Limpeza (Fallback)",
          selected: false,
          type: "limpeza_fallback" as any,
          photos: [],
          quantity: 1
        },
        {
          id: "reparo_fallback",
          name: "Reparo (Fallback)",
          selected: false,
          type: "reparo_fallback" as any,
          photos: [],
          quantity: 1
        }
      ];
      
      setError(error instanceof Error ? error.message : "Erro desconhecido");
      toast.error("Usando serviços padrão", {
        description: "Não foi possível carregar os serviços do banco de dados. Usando serviços padrão."
      });
      setServices(fallbackServices);
      setLoading(false);
      return fallbackServices;
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
