
import { supabase } from "@/integrations/supabase/client";
import { Photo } from "@/types";

export function usePhotosManagement() {
  /**
   * Função para buscar todas as fotos de um ciclo por tipo
   */
  const getPhotosByCycleAndType = async (cycleId: string, type: string): Promise<Photo[]> => {
    try {
      const { data, error } = await supabase
        .from('photos')
        .select('*')
        .eq('cycle_id', cycleId as unknown as string)
        .eq('type', type as unknown as string);
        
      if (error) {
        throw error;
      }
      
      return data?.map(photo => ({
        id: photo.id,
        url: photo.url,
        type: photo.type,
        serviceId: photo.service_id || undefined,
        metadata: photo.metadata || {}
      })) || [];
    } catch (error) {
      console.error('Erro ao buscar fotos:', error);
      return [];
    }
  };
  
  /**
   * Função para adicionar foto ao banco de dados
   */
  const addPhotoToDB = async (
    cycleId: string, 
    serviceId: string | null, 
    url: string, 
    type: string,
    metadata: any = {}
  ): Promise<string | null> => {
    try {
      // Obter o ID do usuário
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData.user) {
        throw new Error('Usuário não autenticado');
      }
      
      const photoData = {
        cycle_id: cycleId,
        service_id: serviceId,
        url: url,
        type: type as unknown as string,
        metadata: metadata,
        created_by: userData.user.id
      };
      
      const { data, error } = await supabase
        .from('photos')
        .insert(photoData)
        .select('id')
        .single();
        
      if (error) {
        throw error;
      }
      
      return data?.id || null;
    } catch (error) {
      console.error('Erro ao adicionar foto ao banco de dados:', error);
      return null;
    }
  };
  
  return {
    getPhotosByCycleAndType,
    addPhotoToDB
  };
}
