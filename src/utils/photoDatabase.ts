
import { supabase } from "@/integrations/supabase/client";

export const insertServicePhoto = async ({
  cycleId,
  serviceId,
  sectorId,
  url,
  type,
  userId
}: {
  cycleId: string;
  serviceId: string;
  sectorId: string;
  url: string;
  type?: string;
  userId: string;
}) => {
  // Make sure we have a userId
  if (!userId) {
    console.error("No userId provided for photo insertion");
    throw new Error("User ID is required for inserting photos");
  }

  try {
    const { error } = await supabase
      .from('photos')
      .insert({
        cycle_id: cycleId,
        service_id: serviceId,
        url: url,
        type: type || 'before',
        created_by: userId,
        metadata: {
          sector_id: sectorId,
          service_id: serviceId,
          stage: 'peritagem',
          type: type || 'servico'
        }
      });
      
    if (error) {
      console.error(`Erro ao inserir foto para serviço ${serviceId}:`, error);
      throw error;
    }
  } catch (error) {
    console.error(`Erro ao inserir foto no banco de dados:`, error);
    throw error;
  }
};

// Verificar se uma foto já existe no banco de dados pelo URL
export const checkPhotoExists = async (url: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('photos')
      .select('id')
      .eq('url', url)
      .maybeSingle();
    
    if (error) {
      console.error("Erro ao verificar foto existente:", error);
      return false;
    }
    
    return !!data;
  } catch (error) {
    console.error("Erro ao verificar existência de foto:", error);
    return false;
  }
};

// Obter todas as fotos de um serviço pelo ID
export const getServicePhotosById = async (serviceId: string, type?: 'before' | 'after') => {
  try {
    let query = supabase
      .from('photos')
      .select('*')
      .eq('service_id', serviceId);
    
    if (type) {
      query = query.eq('type', type);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error(`Erro ao buscar fotos do serviço ${serviceId}:`, error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error(`Erro ao buscar fotos do serviço ${serviceId}:`, error);
    return [];
  }
};
