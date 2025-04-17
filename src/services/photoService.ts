
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
      console.log(`Iniciando upload de foto para ${folder}`);
      
      // Comprimir imagem se necessário (no futuro)
      
      const fileExt = file.name.split('.').pop() || 'jpg';
      const fileName = `${folder}/${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('sector_photos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });
        
      if (error) {
        console.error('Erro ao fazer upload de foto:', error);
        throw error;
      }
      
      const result = supabase.storage
        .from('sector_photos')
        .getPublicUrl(fileName);
        
      console.log(`Upload concluído. URL pública: ${result.data.publicUrl}`);
      
      return result.data.publicUrl;
    } catch (error) {
      console.error('Erro ao fazer upload de foto:', error);
      throw error;
    }
  },
  
  /**
   * Exclui uma foto do bucket do Storage
   */
  deletePhoto: async (url: string): Promise<boolean> => {
    try {
      // Extrair o caminho do arquivo da URL
      const baseUrl = supabase.storage.from('sector_photos').getPublicUrl('').data.publicUrl;
      const filePath = url.replace(baseUrl, '');
      
      const { error } = await supabase.storage
        .from('sector_photos')
        .remove([filePath]);
        
      if (error) {
        console.error('Erro ao excluir foto:', error);
        throw error;
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao excluir foto:', error);
      return false;
    }
  },

  /**
   * Atualiza as fotos de um serviço
   */
  updateServicePhotos: async (
    sectorId: string,
    serviceId: string,
    photoUrl: string,
    type: 'before' | 'after'
  ): Promise<boolean> => {
    try {
      // Implementação simplificada - apenas retorna true por enquanto
      // Esta função será expandida no futuro para manipular as fotos no banco de dados
      console.log(`Atualizando fotos para serviço ${serviceId}, tipo ${type}`);
      return true;
    } catch (error) {
      console.error('Erro ao atualizar fotos do serviço:', error);
      return false;
    }
  }
};
