
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
      
      // Garantir que a URL pública seja gerada com cabeçalhos de cache corretos
      const result = supabase.storage
        .from('sector_photos')
        .getPublicUrl(fileName, {
          download: false,
          transform: {
            quality: 80 // Qualidade de imagem (opcional)
          }
        });
        
      console.log(`Upload concluído. URL pública: ${result.data.publicUrl}`);
      
      // Verificar se a URL é acessível
      try {
        const response = await fetch(result.data.publicUrl, { method: 'HEAD' });
        console.log(`Verificação de URL: status ${response.status}`);
        
        if (!response.ok) {
          console.warn(`A URL gerada pode não ser acessível: ${response.status}`);
        }
      } catch (error) {
        console.error('Erro ao verificar URL:', error);
      }
      
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
      const path = extractPathFromUrl(url);
      if (!path) {
        console.error('Não foi possível extrair o caminho da URL:', url);
        return false;
      }
      
      const { error } = await supabase.storage
        .from('sector_photos')
        .remove([path]);
        
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
   * Verifica se uma URL de foto é válida e acessível
   */
  verifyPhotoUrl: async (url: string): Promise<boolean> => {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      console.error('Erro ao verificar URL da foto:', error);
      return false;
    }
  },

  /**
   * Tenta regenerar a URL pública de uma foto
   */
  regeneratePublicUrl: (url: string): string | null => {
    try {
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

/**
 * Função auxiliar para extrair o caminho do bucket de uma URL pública
 */
export const extractPathFromUrl = (url: string): string | null => {
  try {
    const urlParts = url.split('/object/public/');
    if (urlParts.length > 1) {
      return urlParts[1];
    }
    
    // Alternativa se o formato for diferente
    const match = url.match(/sector_photos\/([^?]+)/);
    if (match && match[1]) {
      return match[1];
    }
    
    return null;
  } catch (e) {
    console.error('Erro ao extrair caminho da URL:', e);
    return null;
  }
};
