
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
  }
};
