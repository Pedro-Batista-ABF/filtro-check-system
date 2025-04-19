
import { supabase } from "@/integrations/supabase/client";
import { extractPathFromUrl, addNoCacheParam, fixDuplicatedStoragePath, isDataUrl } from "@/utils/photoUtils";

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
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `sector_photos/${fileName}`;
      
      console.log(`Iniciando upload para ${filePath}`);
      
      const { error } = await supabase.storage
        .from('sector_photos')
        .upload(filePath, file);
        
      if (error) throw error;
      
      console.log(`Upload concluído para ${filePath}, obtendo URL pública`);
      
      const { data } = supabase.storage
        .from('sector_photos')
        .getPublicUrl(filePath);
        
      console.log(`URL pública obtida: ${data.publicUrl}`);
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

      // Corrigir possíveis problemas na URL
      const fixedUrl = fixDuplicatedStoragePath(url);
      console.log(`Verificando URL: ${fixedUrl}`);
      
      // Tentar acessar a URL para verificar se está disponível
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      try {
        const response = await fetch(fixedUrl, { 
          method: 'HEAD', 
          signal: controller.signal,
          cache: 'no-store'
        });
        
        clearTimeout(timeoutId);
        return response.ok;
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

      // Não processar URLs de dados
      if (isDataUrl(url)) return url;
      
      // Corrigir possível duplicação no caminho
      const fixedUrl = fixDuplicatedStoragePath(url);
      
      // Se a URL já foi corrigida, retorná-la
      if (fixedUrl !== url) {
        console.log('URL corrigida:', fixedUrl);
        return fixedUrl;
      }

      // Extrair o caminho da URL
      const path = extractPathFromUrl(url);
      if (!path) {
        console.warn("Não foi possível extrair o caminho da URL:", url);
        return null;
      }
      
      console.log(`Regenerando URL para o caminho: ${path}`);
      
      // Gerar nova URL pública
      const { data } = supabase.storage
        .from('sector_photos')
        .getPublicUrl(path);
      
      if (!data || !data.publicUrl) {
        console.warn("Falha ao regenerar URL pública");
        return null;
      }
      
      console.log(`URL regenerada: ${data.publicUrl}`);
      return data.publicUrl;
    } catch (error) {
      console.error('Erro ao regenerar URL pública:', error);
      return null;
    }
  },

  /**
   * Baixa uma foto do bucket do Storage como URL local
   */
  downloadPhoto: async (url: string): Promise<string | null> => {
    try {
      if (!url || typeof url !== 'string') return null;

      // Não processar URLs de dados
      if (isDataUrl(url)) return url;
      
      // Corrigir problemas comuns na URL
      const fixedUrl = fixDuplicatedStoragePath(url);
      console.log(`Tentando baixar foto da URL: ${fixedUrl}`);

      // Extrair caminho do arquivo da URL
      const path = extractPathFromUrl(fixedUrl);
      if (!path) {
        console.warn(`Caminho não extraído da URL: ${fixedUrl}`);
        return null;
      }
      
      console.log(`Caminho extraído: ${path}`);
      
      // Baixar do Supabase Storage
      const { data, error } = await supabase.storage
        .from('sector_photos')
        .download(path);
        
      if (error || !data) {
        console.error('Erro ao baixar foto do Supabase:', error);
        return null;
      }
      
      // Converter para URL local
      const localUrl = URL.createObjectURL(data);
      console.log(`Foto baixada e convertida para URL local`);
      return localUrl;
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
      
      console.log(`Atualizando URL da foto da TAG para o setor ${sectorId}`);
      
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
      
      console.log('URL da foto da TAG atualizada com sucesso');
      return true;
    } catch (error) {
      console.error('Erro ao atualizar URL da foto da TAG:', error);
      return false;
    }
  }
};
