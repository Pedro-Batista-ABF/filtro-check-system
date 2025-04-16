
import { Service } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { handleDatabaseError } from "@/utils/errorHandlers";

/**
 * Serviço para operações com tipos de serviço
 */
export const serviceTypeService = {
  /**
   * Busca os serviços disponíveis
   */
  getServiceTypes: async (): Promise<Service[]> => {
    console.log("serviceTypeService: Iniciando busca de tipos de serviço");
    
    try {
      // Verificar autenticação primeiro
      const { data: session } = await supabase.auth.getSession();
      if (!session || !session.session?.user) {
        console.error("serviceTypeService: Usuário não autenticado");
        return []; // Retornar array vazio em vez de lançar erro
      }

      const uid = session.session.user.id;
      if (!uid) {
        console.error("serviceTypeService: UID ausente");
        return []; // Retornar array vazio em vez de lançar erro
      }

      console.log(`serviceTypeService: Autenticado como ${uid}, buscando tipos de serviço`);
      
      // Criar serviços padrão se a tabela não existir ou não tiver dados
      const { count, error: countError } = await supabase
        .from('service_types')
        .select('*', { count: 'exact', head: true });
        
      if (countError || count === 0) {
        console.log("serviceTypeService: Criando serviços padrão pois a tabela está vazia ou não existe");
        
        // Serviços padrão para garantir que o aplicativo funcione mesmo sem configuração prévia
        return [
          {
            id: "limpeza",
            name: "Limpeza",
            selected: false,
            type: "limpeza" as any,
            photos: [],
            quantity: 1
          },
          {
            id: "troca_anel",
            name: "Troca de Anel",
            selected: false,
            type: "troca_anel" as any,
            photos: [],
            quantity: 1
          },
          {
            id: "solda",
            name: "Solda",
            selected: false,
            type: "solda" as any,
            photos: [],
            quantity: 1
          },
          {
            id: "pintura",
            name: "Pintura",
            selected: false,
            type: "pintura" as any,
            photos: [],
            quantity: 1
          },
          {
            id: "reforma",
            name: "Reforma",
            selected: false,
            type: "reforma" as any,
            photos: [],
            quantity: 1
          }
        ];
      }
      
      // Buscar tipos de serviço
      const { data, error } = await supabase
        .from('service_types')
        .select('*')
        .order('name');
        
      if (error) {
        console.error("serviceTypeService: Erro ao buscar tipos de serviço:", error);
        // Não lançar erro, retornar serviços padrão
        return [
          {
            id: "limpeza",
            name: "Limpeza",
            selected: false,
            type: "limpeza" as any,
            photos: [],
            quantity: 1
          },
          {
            id: "troca_anel",
            name: "Troca de Anel",
            selected: false,
            type: "troca_anel" as any,
            photos: [],
            quantity: 1
          }
        ];
      }
      
      if (!data || !Array.isArray(data) || data.length === 0) {
        console.warn("serviceTypeService: Nenhum tipo de serviço encontrado, retornando padrões");
        return [
          {
            id: "limpeza",
            name: "Limpeza",
            selected: false,
            type: "limpeza" as any,
            photos: [],
            quantity: 1
          },
          {
            id: "troca_anel",
            name: "Troca de Anel",
            selected: false,
            type: "troca_anel" as any,
            photos: [],
            quantity: 1
          }
        ];
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
      
      console.log(`serviceTypeService: ${services.length} serviços mapeados com sucesso`);
      return services;
    } catch (error) {
      console.error('serviceTypeService: Erro ao buscar tipos de serviços:', error);
      // Retornar serviços padrão mínimos em caso de erro para garantir funcionamento
      return [
        {
          id: "limpeza",
          name: "Limpeza",
          selected: false,
          type: "limpeza" as any,
          photos: [],
          quantity: 1
        },
        {
          id: "manutencao",
          name: "Manutenção",
          selected: false,
          type: "manutencao" as any,
          photos: [],
          quantity: 1
        }
      ];
    }
  }
};
