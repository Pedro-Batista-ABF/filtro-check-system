
import { Service } from "@/types";
import { supabase } from "@/integrations/supabase/client";

export const serviceTypeService = {
  getServiceTypes: async (): Promise<Service[]> => {
    console.log("serviceTypeService: Iniciando busca de tipos de serviço");
    
    try {
      // Verificar autenticação primeiro
      const { data: session } = await supabase.auth.getSession();
      if (!session || !session.session?.user) {
        console.error("serviceTypeService: Usuário não autenticado");
        throw new Error("Usuário não autenticado");
      }

      console.log("serviceTypeService: Buscando tipos de serviço da tabela");
      
      // Buscar tipos de serviço da tabela service_types
      const { data, error } = await supabase
        .from('service_types')
        .select('*')
        .order('name');
        
      if (error) {
        console.error("serviceTypeService: Erro ao buscar tipos de serviço:", error);
        throw error;
      }
      
      if (!data || !Array.isArray(data) || data.length === 0) {
        console.error("serviceTypeService: Nenhum tipo de serviço encontrado");
        throw new Error("Não foram encontrados serviços disponíveis");
      }
      
      console.log(`serviceTypeService: ${data.length} tipos de serviço encontrados`);
      
      // Mapear os dados do banco para o formato Service
      const services: Service[] = data.map(serviceType => ({
        id: serviceType.id,
        name: serviceType.name,
        description: serviceType.description,
        selected: false,
        type: serviceType.id as any,
        photos: [],
        quantity: 1
      }));
      
      console.log("serviceTypeService: Serviços mapeados com sucesso:", services);
      return services;
    } catch (error) {
      console.error('serviceTypeService: Erro crítico:', error);
      throw error;
    }
  }
};
