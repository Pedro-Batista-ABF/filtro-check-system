
import { Service } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { ServiceTypeDB, mapServiceFromDB } from "./mappers";
import { handleDatabaseError } from "@/utils/errorHandlers";

/**
 * Serviço para operações com tipos de serviço
 */
export const serviceTypeService = {
  /**
   * Busca os serviços disponíveis
   */
  getServiceTypes: async (): Promise<Service[]> => {
    try {
      // Verificar autenticação primeiro
      const { data: session } = await supabase.auth.getSession();
      if (!session || !session.session?.user) {
        console.error("serviceTypeService: Usuário não autenticado");
        throw new Error("Usuário não autenticado ao buscar tipos de serviço");
      }

      console.log("serviceTypeService: Buscando tipos de serviço");
      
      const { data, error } = await supabase
        .from('service_types')
        .select('*')
        .order('name');
        
      if (error) {
        console.error("serviceTypeService: Erro ao buscar tipos de serviço:", error);
        throw handleDatabaseError(error, "Erro ao buscar tipos de serviço");
      }
      
      if (!data) {
        console.warn("serviceTypeService: Resposta vazia da tabela service_types");
        return [];
      }
      
      if (data.length === 0) {
        console.warn("serviceTypeService: Nenhum tipo de serviço encontrado");
        return [];
      }
      
      console.log(`serviceTypeService: ${data.length} tipos de serviço encontrados`);
      
      // Criar os serviços a partir dos dados do banco
      const services = data.map(serviceType => ({
        id: serviceType.id,
        name: serviceType.name,
        selected: false,
        type: serviceType.id as any,
        photos: [],
        quantity: 1
      }));
      
      // Log de verificação
      console.log(`serviceTypeService: ${services.length} serviços mapeados`);
      
      // Verificação final do formato de retorno
      if (!Array.isArray(services)) {
        console.error("serviceTypeService: Erro crítico - services não é um array");
        return [];
      }
      
      return services;
    } catch (error) {
      console.error('serviceTypeService: Erro ao buscar tipos de serviços:', error);
      // Não propagar o erro, retornar array vazio
      return [];
    }
  }
};
