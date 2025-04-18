
import { useState } from 'react';
import { photoService } from '@/services/photoService';
import { Photo, PhotoWithFile } from '@/types';
import { toast } from 'sonner';

export function usePhotosManagement() {
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  /**
   * Verifica a validade de uma URL de foto e tenta regenerá-la se necessário
   */
  const validatePhotoUrl = async (url: string): Promise<string> => {
    try {
      const isValid = await photoService.verifyPhotoUrl(url);
      
      if (!isValid) {
        console.warn("URL da foto não é válida, tentando regenerar:", url);
        
        const regeneratedUrl = photoService.regeneratePublicUrl(url);
        if (regeneratedUrl) {
          console.log("URL regenerada:", regeneratedUrl);
          return regeneratedUrl;
        }
      }
      
      return url;
    } catch (error) {
      console.error("Erro ao validar URL da foto:", error);
      return url;
    }
  };

  /**
   * Trata falhas no carregamento de imagens
   */
  const handleImageLoadError = async (url: string): Promise<string | null> => {
    try {
      console.log("Tentando recuperar imagem com erro:", url);
      
      // Tentar regenerar URL
      const regeneratedUrl = photoService.regeneratePublicUrl(url);
      if (regeneratedUrl && regeneratedUrl !== url) {
        console.log("URL regenerada após erro:", regeneratedUrl);
        
        // Verificar se a URL regenerada funciona
        const isValid = await photoService.verifyPhotoUrl(regeneratedUrl);
        if (isValid) {
          return regeneratedUrl;
        }
      }
      
      // Último recurso: download direto
      const downloadUrl = await photoService.downloadPhoto(url);
      if (downloadUrl) {
        console.log("Usando URL de download direto:", downloadUrl);
        return downloadUrl;
      }
      
      return null;
    } catch (error) {
      console.error("Erro ao tentar recuperar imagem:", error);
      return null;
    }
  };

  /**
   * Processa uma lista de fotos para garantir URLs válidas
   */
  const processPhotos = async (photos: Photo[]): Promise<PhotoWithFile[]> => {
    if (!photos || !Array.isArray(photos) || photos.length === 0) {
      return [];
    }
    
    const processedPhotos: PhotoWithFile[] = [];
    
    for (const photo of photos) {
      try {
        if (!photo.url) {
          console.warn("Foto sem URL encontrada:", photo);
          continue;
        }
        
        const validatedUrl = await validatePhotoUrl(photo.url);
        
        processedPhotos.push({
          ...photo,
          url: validatedUrl
        });
      } catch (error) {
        console.error("Erro ao processar foto:", error);
      }
    }
    
    return processedPhotos;
  };

  /**
   * Tenta diferentes métodos para carregar uma imagem
   */
  const tryLoadImage = async (url: string): Promise<{ success: boolean, url?: string }> => {
    try {
      // Verificar URL original
      let isValid = await photoService.verifyPhotoUrl(url);
      if (isValid) {
        return { success: true, url };
      }
      
      // Tentar regenerar URL
      const regeneratedUrl = photoService.regeneratePublicUrl(url);
      if (regeneratedUrl && regeneratedUrl !== url) {
        isValid = await photoService.verifyPhotoUrl(regeneratedUrl);
        if (isValid) {
          return { success: true, url: regeneratedUrl };
        }
      }
      
      // Último recurso: download direto
      const downloadUrl = await photoService.downloadPhoto(url);
      if (downloadUrl) {
        return { success: true, url: downloadUrl };
      }
      
      return { success: false };
    } catch (error) {
      console.error("Erro ao tentar carregar imagem:", error);
      return { success: false };
    }
  };

  return {
    uploadingPhoto,
    uploadProgress,
    uploadError,
    validatePhotoUrl,
    handleImageLoadError,
    processPhotos,
    tryLoadImage
  };
}
