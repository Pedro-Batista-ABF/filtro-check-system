import { supabase } from '@/integrations/supabase/client';
import { Photo, PhotoWithFile } from '@/types';

export const photoService = {
  // Regenerar URL pública para uma foto
  regeneratePublicUrl: async (url: string): Promise<string | null> => {
    try {
      if (!url) return null;
      
      // Extrair o caminho do bucket a partir da URL
      const urlParts = url.split('/');
      const bucketName = urlParts[3]; // Assumindo formato: https://[project].supabase.co/storage/v1/object/public/[bucket]/[path]
      const filePath = urlParts.slice(4).join('/');
      
      if (!bucketName || !filePath) {
        console.error('URL inválida para regeneração:', url);
        return null;
      }
      
      // Obter URL pública com nova assinatura
      const { data, error } = await supabase.storage
        .from(bucketName)
        .createSignedUrl(filePath, 60 * 60); // Expiração em 1 hora
      
      if (error) {
        console.error('Erro ao regenerar URL da foto:', error);
        
        // Fallback: tentar URL pública direta
        const { data: publicURL } = supabase.storage
          .from(bucketName)
          .getPublicUrl(filePath);
          
        return publicURL?.publicUrl || null;
      }
      
      return data?.signedUrl || null;
    } catch (error) {
      console.error('Erro crítico ao regenerar URL:', error);
      return null;
    }
  },
  
  // Função para fazer upload de uma foto para o bucket
  uploadPhoto: async (file: File, bucketName: string, filePath: string): Promise<Photo | null> => {
    try {
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (error) {
        console.error("Erro ao fazer upload da foto:", error);
        return null;
      }
      
      // Obter a URL pública da foto
      const { data: publicURL } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);
      
      if (!publicURL?.publicUrl) {
        console.error("Erro ao obter URL pública da foto");
        return null;
      }
      
      return {
        id: data?.path || filePath,
        url: publicURL.publicUrl,
        file: file,
      };
    } catch (error) {
      console.error("Erro ao fazer upload da foto:", error);
      return null;
    }
  },

  // Função para excluir uma foto do bucket
  deletePhoto: async (bucketName: string, filePath: string): Promise<boolean> => {
    try {
      const { error } = await supabase.storage
        .from(bucketName)
        .remove([filePath]);

      if (error) {
        console.error("Erro ao excluir a foto:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Erro ao excluir a foto:", error);
      return false;
    }
  },
};
