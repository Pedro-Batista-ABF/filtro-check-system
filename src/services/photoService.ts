
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
   * Verifica se uma URL de foto é acessível
   */
  verifyPhotoUrl: async (url: string): Promise<boolean> => {
    try {
      // Verificar se a URL é válida
      if (!url || typeof url !== 'string') return false;

      // Tentar acessar a URL para verificar se está disponível
      const response = await fetch(url, { method: 'HEAD', mode: 'no-cors' });
      
      // No-cors sempre retorna 'opaque' response sem status, então não podemos verificar status
      // Vamos considerar que a URL é válida se não houve erro
      return true;
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

      // Se a URL já contém token de download ou expiração, remover isso
      const simplifiedUrl = url.split('?')[0];
      
      // Gerar uma nova URL pública adicionando um timestamp como busca
      return `${simplifiedUrl}?t=${Date.now()}`;
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
      const path = url.split('/').slice(4).join('/').split('?')[0];
      
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

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
      }
      
      const blob = await response.blob();
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Erro ao baixar foto:', error);
      return null;
    }
  },

  /**
   * Atualiza a URL da foto da TAG de um setor
   */
  updateTagPhotoUrl: async (sectorId: string, url: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('sectors')
        .update({ tag_photo_url: url })
        .eq('id', sectorId);
        
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Erro ao atualizar URL da foto da TAG:', error);
      return false;
    }
  }
};
