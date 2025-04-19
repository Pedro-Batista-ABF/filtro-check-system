
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
   * Verifica se uma URL de foto é acessível
   */
  verifyPhotoUrl: async (url: string): Promise<boolean> => {
    try {
      // Verificar se a URL é válida
      if (!url || typeof url !== 'string') return false;

      // Tentar acessar a URL para verificar se está disponível
      // Usando no-cors para evitar problemas de CORS
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      try {
        await fetch(url, { 
          method: 'HEAD', 
          mode: 'no-cors',
          signal: controller.signal,
          cache: 'no-store'
        });
        
        // No-cors sempre retorna 'opaque' response sem status, então não podemos verificar status
        clearTimeout(timeoutId);
        return true;
      } catch (e) {
        console.warn("Erro ao verificar URL com fetch:", e);
        return false;
      }
    } catch (error) {
      console.error('Erro ao verificar URL da foto:', error);
      return false;
    }
  },

  /**
   * Regenera uma URL pública de uma foto no bucket do Storage
   */
  regeneratePublicUrl: (url: string): string | null => {
    try {
      if (!url || typeof url !== 'string') return null;

      // Extrair o caminho da URL usando a função auxiliar
      const path = extractPathFromUrl(url);
      if (!path) {
        console.warn("Não foi possível extrair o caminho da URL:", url);
        return null;
      }
      
      // Gerar nova URL pública
      const { data } = supabase.storage
        .from('sector_photos')
        .getPublicUrl(path);
      
      if (!data || !data.publicUrl) {
        console.warn("Falha ao regenerar URL pública");
        return null;
      }
      
      return data.publicUrl;
    } catch (error) {
      console.error('Erro ao regenerar URL pública:', error);
      return null;
    }
  },

  /**
   * Exclui uma foto do bucket do Storage
   */
  deletePhoto: async (url: string): Promise<boolean> => {
    try {
      if (!url || typeof url !== 'string') return false;

      // Extrair caminho do arquivo da URL
      const path = extractPathFromUrl(url);
      if (!path) {
        console.error('URL inválida para exclusão:', url);
        return false;
      }

      const { error } = await supabase.storage
        .from('sector_photos')
        .remove([path]);
        
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Erro ao excluir foto:', error);
      return false;
    }
  },

  /**
   * Baixa uma foto do bucket do Storage como base64
   */
  downloadPhoto: async (url: string): Promise<string | null> => {
    try {
      if (!url || typeof url !== 'string') return null;

      // Extrair caminho do arquivo da URL
      const path = extractPathFromUrl(url);
      if (!path) {
        console.warn('Caminho não extraído da URL:', url);
        
        // Tentar baixar diretamente a URL como fallback
        try {
          const response = await fetch(url, { cache: 'no-store' });
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
          
          const blob = await response.blob();
          return URL.createObjectURL(blob);
        } catch (fetchError) {
          console.error('Erro ao baixar URL diretamente:', fetchError);
          return null;
        }
      }
      
      // Baixar do Supabase Storage
      try {
        const { data, error } = await supabase.storage
          .from('sector_photos')
          .download(path);
          
        if (error || !data) {
          console.error('Erro ao baixar foto do Supabase:', error);
          return null;
        }
        
        // Converter para URL local
        return URL.createObjectURL(data);
      } catch (downloadError) {
        console.error('Erro ao baixar do Supabase:', downloadError);
        return null;
      }
    } catch (error) {
      console.error('Erro ao fazer download de foto:', error);
      return null;
    }
  },

  /**
   * Atualiza a URL da foto da TAG de um setor
   */
  updateTagPhotoUrl: async (sectorId: string, url: string): Promise<boolean> => {
    try {
      if (!sectorId || !url) return false;
      
      const { error } = await supabase
        .from('sectors')
        .update({ 
          tag_photo_url: url,
          updated_at: new Date().toISOString()
        })
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
