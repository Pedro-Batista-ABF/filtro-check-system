
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { extractPathFromUrl, addNoCacheParam, checkImageExists } from "@/utils/photoUtils";

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
      
      if (!file) {
        throw new Error("Arquivo não fornecido");
      }
      
      // Verificar tamanho do arquivo (limite de 10MB)
      const MAX_SIZE = 10 * 1024 * 1024; // 10MB
      if (file.size > MAX_SIZE) {
        throw new Error(`Arquivo muito grande (${(file.size / 1024 / 1024).toFixed(2)}MB). O limite é 10MB.`);
      }
      
      // Verificar se o bucket existe
      try {
        const { error: bucketError } = await supabase.storage
          .getBucket('sector_photos');
          
        if (bucketError) {
          console.error("Erro ao verificar bucket:", bucketError);
          throw new Error("Erro ao acessar armazenamento de fotos");
        }
      } catch (bucketCheckError) {
        console.error("Erro ao verificar bucket:", bucketCheckError);
      }
      
      // Gerar nome de arquivo único
      const fileExt = file.name.split('.').pop() || 'jpg';
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      
      // Fazer upload
      const { error } = await supabase.storage
        .from('sector_photos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });
        
      if (error) {
        console.error('Erro ao fazer upload de foto:', error);
        throw error;
      }
      
      // Obter URL pública
      const { data } = supabase.storage
        .from('sector_photos')
        .getPublicUrl(fileName);
      
      const publicUrl = addNoCacheParam(data.publicUrl);
      console.log(`Upload concluído. URL pública: ${publicUrl}`);
      
      return publicUrl;
    } catch (error) {
      console.error('Erro ao fazer upload de foto:', error);
      toast.error(`Erro ao fazer upload de foto: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
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
   * Inclui fallback para caso a verificação HEAD falhe
   */
  verifyPhotoUrl: async (url: string): Promise<boolean> => {
    try {
      if (!url) return false;
      
      // Primeiro, tente verificar usando HEAD (mais rápido)
      try {
        const isAccessible = await checkImageExists(url);
        if (isAccessible) {
          return true;
        }
      } catch (headError) {
        console.warn('Erro na verificação HEAD, tentando fallback:', headError);
      }
      
      // Fallback: Tentar criar uma imagem e verificar se carrega
      // Este método é mais tolerante a problemas de CORS/headers
      return new Promise((resolve) => {
        const img = new Image();
        const timeoutId = setTimeout(() => {
          console.warn('Timeout ao carregar imagem:', url);
          img.onload = null;
          img.onerror = null;
          resolve(false);
        }, 5000);

        img.onload = () => {
          clearTimeout(timeoutId);
          resolve(true);
        };
        
        img.onerror = () => {
          clearTimeout(timeoutId);
          console.warn('Erro ao carregar imagem:', url);
          resolve(false);
        };
        
        img.src = addNoCacheParam(url);
      });
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
      if (!url) return null;
      
      const path = extractPathFromUrl(url);
      if (!path) {
        console.error("Não foi possível extrair o caminho da URL:", url);
        return null;
      }
      
      const { data } = supabase.storage
        .from('sector_photos')
        .getPublicUrl(path);
        
      return addNoCacheParam(data.publicUrl);
    } catch (error) {
      console.error('Erro ao regenerar URL pública:', error);
      return null;
    }
  },

  /**
   * Baixa uma foto diretamente do Storage como fallback
   */
  downloadPhoto: async (url: string): Promise<string | null> => {
    try {
      const path = extractPathFromUrl(url);
      if (!path) return null;
      
      console.log("Tentando baixar arquivo diretamente:", path);
      
      const { data, error } = await supabase.storage
        .from('sector_photos')
        .download(path);
        
      if (error || !data) {
        console.error("Erro ao baixar foto:", error);
        return null;
      }
      
      // Criar URL temporária para o arquivo baixado
      const objectUrl = URL.createObjectURL(data);
      console.log("URL de objeto criada:", objectUrl);
      return objectUrl;
    } catch (error) {
      console.error("Erro ao baixar foto:", error);
      return null;
    }
  },
  
  /**
   * Atualiza a URL da foto da TAG na tabela sectors
   */
  updateTagPhotoUrl: async (sectorId: string, url: string): Promise<boolean> => {
    try {
      if (!sectorId || !url) {
        console.error("ID do setor ou URL inválidos:", { sectorId, url });
        return false;
      }
      
      console.log("Atualizando URL da foto da TAG:", { sectorId, url });
      
      const { error } = await supabase
        .from('sectors')
        .update({
          tag_photo_url: url,
          updated_at: new Date().toISOString()
        })
        .eq('id', sectorId);
        
      if (error) {
        console.error("Erro ao atualizar URL da foto da TAG:", error);
        return false;
      }
      
      console.log("URL da foto da TAG atualizada com sucesso");
      return true;
    } catch (error) {
      console.error("Erro ao atualizar URL da foto da TAG:", error);
      return false;
    }
  }
};
