
import { supabase } from "@/integrations/supabase/client";
import { extractPathFromUrl } from "@/utils/photoUtils";

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
   * Regenera a URL pública para uma imagem
   */
  regeneratePublicUrl: (url: string): string | null => {
    try {
      if (!url) return null;
      
      const path = extractPathFromUrl(url);
      if (!path) return null;
      
      const { data } = supabase.storage
        .from('sector_photos')
        .getPublicUrl(path);
        
      return data.publicUrl;
    } catch (error) {
      console.error('Erro ao regenerar URL pública:', error);
      return null;
    }
  },
  
  /**
   * Verifica se a URL de uma foto é acessível
   */
  verifyPhotoUrl: async (url: string): Promise<boolean> => {
    try {
      if (!url) return false;
      
      // Simplificando para tornar mais robusto
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      const response = await fetch(url, { 
        method: 'HEAD',
        signal: controller.signal,
        mode: 'no-cors',
        cache: 'no-store'
      });
      
      clearTimeout(timeoutId);
      return true;
    } catch (error) {
      console.warn('Erro ao verificar URL da foto:', error);
      return false;
    }
  },
  
  /**
   * Faz download direto de uma foto
   */
  downloadPhoto: async (url: string): Promise<string | null> => {
    try {
      if (!url) return null;
      
      const path = extractPathFromUrl(url);
      if (!path) return null;
      
      const { data, error } = await supabase.storage
        .from('sector_photos')
        .download(path);
        
      if (error || !data) {
        console.error('Erro ao baixar foto:', error);
        return null;
      }
      
      // Converter para URL local
      return URL.createObjectURL(data);
    } catch (error) {
      console.error('Erro ao fazer download de foto:', error);
      return null;
    }
  },
  
  /**
   * Atualiza a URL da foto da TAG diretamente no setor
   */
  updateTagPhotoUrl: async (sectorId: string, url: string): Promise<boolean> => {
    try {
      if (!sectorId || !url) return false;
      
      const { error } = await supabase
        .from('sectors')
        .update({ tag_photo_url: url, updated_at: new Date().toISOString() })
        .eq('id', sectorId);
        
      if (error) {
        console.error('Erro ao atualizar URL da foto da TAG:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao atualizar URL da foto da TAG:', error);
      return false;
    }
  }
};
