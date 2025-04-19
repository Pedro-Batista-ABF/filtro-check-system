
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const photoService = {
  /**
   * Uploads a photo to Supabase Storage
   */
  async uploadPhoto(file: File, folder: string = 'general'): Promise<string> {
    try {
      // Ensure folder path is sanitized and safe
      const safeFolderPath = folder.replace(/\.\./g, '').replace(/\/\//g, '/');
      const timestamp = Date.now();
      const fileExt = file.name.split('.').pop();
      const filePath = `${safeFolderPath}/${timestamp}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;

      // Upload file to Supabase
      const { data, error } = await supabase.storage
        .from('photos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error("Erro ao fazer upload:", error);
        throw new Error(`Erro ao fazer upload: ${error.message}`);
      }

      if (!data) {
        throw new Error("Falha ao fazer upload da foto");
      }

      // Generate public URL
      const publicURL = await this.regeneratePublicUrl(data.path);
      return publicURL;
    } catch (error) {
      console.error("Erro no serviço de foto:", error);
      toast.error("Falha ao processar a foto");
      throw error;
    }
  },

  /**
   * Delete a photo from Supabase Storage
   */
  async deletePhoto(url: string): Promise<boolean> {
    try {
      // Extract path from URL
      const urlObj = new URL(url);
      const path = decodeURIComponent(urlObj.pathname).split('/').slice(2).join('/');

      // Delete the file
      const { error } = await supabase.storage
        .from('photos')
        .remove([path]);

      if (error) {
        console.error("Erro ao excluir foto:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Erro ao excluir foto:", error);
      return false;
    }
  },

  /**
   * Verify if a photo URL is accessible
   */
  async verifyPhotoUrl(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      console.error("Erro ao verificar URL da foto:", error);
      return false;
    }
  },

  /**
   * Regenerate a public URL for a photo
   */
  async regeneratePublicUrl(path: string): Promise<string> {
    try {
      // Generate public URL using Supabase
      const { data } = await supabase.storage
        .from('photos')
        .getPublicUrl(path);

      if (!data.publicUrl) {
        throw new Error("Falha ao gerar URL pública");
      }

      // Add cache-busting parameter
      return this.addCacheBustingParam(data.publicUrl);
    } catch (error) {
      console.error("Erro ao regenerar URL pública:", error);
      throw error;
    }
  },

  /**
   * Add a cache-busting parameter to URL
   */
  addCacheBustingParam(url: string): string {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}_cb=${Date.now()}`;
  },

  /**
   * Download a photo and convert to data URL
   */
  async downloadPhoto(url: string): Promise<string | null> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error("Erro ao baixar foto:", error);
      return null;
    }
  },

  /**
   * Update a sector's tag photo URL
   */
  async updateTagPhotoUrl(sectorId: string, url: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('sectors')
        .update({ tag_photo_url: url })
        .eq('id', sectorId);

      if (error) {
        console.error("Erro ao atualizar URL da foto da TAG:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Erro ao atualizar URL da foto da TAG:", error);
      return false;
    }
  }
};
