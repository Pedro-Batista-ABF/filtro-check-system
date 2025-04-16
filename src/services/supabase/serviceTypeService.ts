
import { Service } from "@/types";
import { supabase } from "@/integrations/supabase/client";

// Cache em memória para serviços
let serviceTypesCache: Service[] | null = null;
let lastCacheTime: number = 0;
const CACHE_TTL = 10 * 60 * 1000; // 10 minutos

export const serviceTypeService = {
  getServiceTypes: async (): Promise<Service[]> => {
    console.log("serviceTypeService: Iniciando busca de tipos de serviço");
    
    try {
      // Verificar se temos um cache válido
      const now = Date.now();
      if (serviceTypesCache && lastCacheTime > 0 && (now - lastCacheTime) < CACHE_TTL) {
        console.log("serviceTypeService: Usando cache de serviços", serviceTypesCache.length);
        return [...serviceTypesCache]; // Retornar cópia do cache
      }
      
      // Verificar autenticação primeiro
      const { data: session } = await supabase.auth.getSession();
      if (!session || !session.session?.user) {
        console.error("serviceTypeService: Usuário não autenticado");
        throw new Error("Usuário não autenticado");
      }

      console.log("serviceTypeService: Buscando tipos de serviço da tabela");
      
      // Usando Promise.race para implementar timeout manualmente
      const timeout = new Promise<null>((_, reject) => 
        setTimeout(() => reject(new Error("Timeout ao buscar serviços")), 3000)
      );
      
      const fetchPromise = supabase
        .from('service_types')
        .select('*')
        .order('name');
        
      const result = await Promise.race([fetchPromise, timeout]) as any;
      
      // Se timeout vencer, result será null
      if (!result) {
        throw new Error("Timeout excedido ao buscar serviços");
      }
      
      const { data, error } = result;
        
      if (error) {
        console.error("serviceTypeService: Erro ao buscar tipos de serviço:", error);
        throw new Error(`Erro ao buscar serviços: ${error.message}`);
      }
      
      if (!data) {
        console.error("serviceTypeService: Resultado nulo da consulta");
        throw new Error("Erro interno ao buscar serviços");
      }
      
      if (!Array.isArray(data)) {
        console.error("serviceTypeService: Retorno não é um array:", data);
        throw new Error("Formato inválido de dados retornados");
      }
      
      if (data.length === 0) {
        console.warn("serviceTypeService: Nenhum tipo de serviço encontrado");
        throw new Error("Não foram encontrados serviços disponíveis. Verifique se a tabela 'service_types' está corretamente configurada.");
      }
      
      console.log(`serviceTypeService: ${data.length} tipos de serviço encontrados`);
      
      // Mapear os dados do banco para o formato Service
      const services: Service[] = data.map(serviceType => ({
        id: serviceType.id,
        name: serviceType.name,
        description: serviceType.description,
        selected: false,
        type: serviceType.id as any, // Usando any para corrigir problema de tipagem
        photos: [],
        quantity: 1
      }));
      
      // Atualizar o cache
      serviceTypesCache = [...services];
      lastCacheTime = now;
      
      console.log("serviceTypeService: Serviços mapeados com sucesso:", services);
      return services;
    } catch (error) {
      console.error('serviceTypeService: Erro crítico:', error);
      
      // Se temos um cache antigo, usar como fallback em caso de erro
      if (serviceTypesCache) {
        console.warn('serviceTypeService: Usando cache expirado como fallback');
        return [...serviceTypesCache];
      }
      
      throw error;
    }
  },
  
  clearCache: () => {
    serviceTypesCache = null;
    lastCacheTime = 0;
    console.log("serviceTypeService: Cache limpo");
  }
};
