
import { supabase } from "@/integrations/supabase/client";

/**
 * Serviço para operações com fotos
 */
export const photoService = {
  /**
   * Faz upload de uma foto para o bucket do Storage
   */
  uploadPhoto: async (file: File, folder: string = 'general'): Promise<string> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${folder}/${Date.now()}.${fileExt}`;
      
      const { error } = await supabase.storage
        .from('sector_photos')
        .upload(fileName, file);
        
      if (error) throw error;
      
      const { data } = supabase.storage
        .from('sector_photos')
        .getPublicUrl(fileName);
        
      return data.publicUrl;
    } catch (error) {
      console.error('Erro ao fazer upload de foto:', error);
      throw error;
    }
  },
  
  /**
   * Busca as fotos associadas a um serviço específico
   */
  getServicePhotos: async (serviceId: string, stage: 'peritagem' | 'checagem'): Promise<any[]> => {
    try {
      const { data, error } = await supabase
        .from('photos')
        .select('*')
        .eq('service_id', serviceId)
        .eq('metadata->stage', stage)
        .maybeSingle();
      
      if (error) {
        console.error('Erro ao buscar fotos do serviço:', error);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar fotos do serviço:', error);
      return [];
    }
  },
  
  /**
   * Busca as fotos de um setor por estágio
   */
  getSectorPhotosByStage: async (sectorId: string, stage: 'peritagem' | 'checagem'): Promise<any[]> => {
    try {
      // Primeiro encontrar o ciclo atual
      const { data: cycleData, error: cycleError } = await supabase
        .from('cycles')
        .select('id')
        .eq('sector_id', sectorId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (cycleError || !cycleData) {
        console.error('Erro ao buscar ciclo do setor:', cycleError);
        return [];
      }
      
      // Depois buscar as fotos
      const { data, error } = await supabase
        .from('photos')
        .select('*')
        .eq('cycle_id', cycleData.id)
        .eq('metadata->stage', stage);
      
      if (error) {
        console.error('Erro ao buscar fotos do setor:', error);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar fotos do setor:', error);
      return [];
    }
  }
};
