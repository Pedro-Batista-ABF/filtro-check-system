
import { Service } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { ServiceTypeDB, mapServiceFromDB } from "./mappers";

/**
 * Serviço para operações com tipos de serviço
 */
export const serviceTypeService = {
  /**
   * Busca os serviços disponíveis
   */
  getServiceTypes: async (): Promise<Service[]> => {
    try {
      const { data, error } = await supabase
        .from('service_types')
        .select('*')
        .order('name');
        
      if (error) throw error;
      
      return (data || []).map(serviceType => ({
        id: serviceType.id as any,
        name: serviceType.name,
        selected: false,
        type: serviceType.id as any // Add the type field
      }));
    } catch (error) {
      console.error('Erro ao buscar tipos de serviços:', error);
      throw error;
    }
  }
};
