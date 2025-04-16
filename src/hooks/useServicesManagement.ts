
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

  const fetchDefaultServices = async () => {
    try {
      console.log("Iniciando busca de serviços padrão");
      setLoading(true);
      
      // Verifica autenticação explicitamente
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session?.user?.id) {
        console.error("UID ausente na busca de serviços");
        setError("Você precisa estar logado para acessar esta página");
        setServices([]);
        setLoading(false);
        return [];
      }
      
      // Usar o serviço específico para buscar tipos de serviço com tratamento de erro melhorado
      try {
        const serviceTypes = await serviceTypeService.getServiceTypes();
        console.log(`${serviceTypes.length} tipos de serviço encontrados:`, serviceTypes);
        
        // Verificação explícita do formato dos dados
        if (!Array.isArray(serviceTypes) || serviceTypes.length === 0) {
          console.warn("Serviços não encontrados. Verifique tabela 'service_types'");
          setError("Não foram encontrados serviços disponíveis");
          setServices([]);
          setLoading(false);
          return [];
        }
        
        // Process services with proper type casting and create photo arrays
        const processedServices = serviceTypes.map(service => ({
          id: service.id,
          name: service.name,
          selected: false,
          type: service.id as unknown as ServiceType,
          photos: [],
          quantity: 1  // Adicionar quantidade padrão para evitar erros
        }));
        
        console.log("Serviços processados com sucesso:", processedServices.length);
        setServices(processedServices);
        setLoading(false);
        console.log("🔥 Finalizado carregamento de serviços com sucesso.");
        return processedServices;
      } catch (serviceError) {
        console.error("Erro específico ao buscar serviços:", serviceError);
        throw serviceError; // Repassar para tratamento no bloco catch externo
      }
    } catch (error) {
      console.error("Error fetching default services:", error);
      setError("Erro ao carregar serviços");
      toast.error("Erro ao carregar serviços", {
        description: error instanceof Error ? error.message : "Tente novamente mais tarde"
      });
      setServices([]);
      setLoading(false);
      return [];
    } finally {
      if (loading) {
        setLoading(false);
        console.log("🔥 Finalizado carregamento de serviços em finally.");
      }
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
