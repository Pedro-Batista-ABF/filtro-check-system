import React, { createContext, useState, useContext, ReactNode, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Service, PhotoType } from '@/types';
import { toast } from 'sonner';
import { photoService } from '@/services/photoService';

interface ApiContextValue {
  loading: boolean;
  error: string | null;
  uploadPhoto: (file: File, folder?: string) => Promise<string>;
  deletePhoto: (url: string) => Promise<boolean>;
  verifyPhotoUrl: (url: string) => Promise<boolean>;
  regeneratePublicUrl: (url: string) => string | null;
  downloadPhoto: (url: string) => Promise<string | null>;
  updateTagPhotoUrl: (sectorId: string, url: string) => Promise<boolean>;
  updateServicePhotos: (serviceId: string, photos: { url: string, type: PhotoType }[]) => Promise<boolean>;
}

const ApiContext = createContext<ApiContextValue | undefined>(undefined);

export const ApiContextExtendedProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Abortable requests
  const abortControllerRef = useRef<AbortController | null>(null);

  const uploadPhoto = async (file: File, folder: string = 'general'): Promise<string> => {
    setLoading(true);
    setError(null);
    
    try {
      // Criar novo AbortController para cada requisição
      abortControllerRef.current = new AbortController();
      
      // Adicionar timeout para a requisição
      const timeoutId = setTimeout(() => {
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
          throw new Error("Upload timeout: a operação demorou muito tempo");
        }
      }, 30000); // 30 segundos de timeout
      
      // Fazer upload da foto
      const fileUrl = await photoService.uploadPhoto(file, folder);
      
      // Limpar timeout se o upload foi bem-sucedido
      clearTimeout(timeoutId);
      
      return fileUrl;
    } catch (error) {
      console.error("Erro no uploadPhoto:", error);
      
      let errorMessage = "Erro ao fazer upload da foto";
      if (error instanceof Error) {
        errorMessage += `: ${error.message}`;
      }
      
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  };

  const deletePhoto = async (url: string): Promise<boolean> => {
    try {
      return await photoService.deletePhoto(url);
    } catch (error) {
      console.error("Erro ao excluir foto:", error);
      return false;
    }
  };

  const verifyPhotoUrl = async (url: string): Promise<boolean> => {
    try {
      return await photoService.verifyPhotoUrl(url);
    } catch (error) {
      console.error("Erro ao verificar URL da foto:", error);
      return false;
    }
  };

  const regeneratePublicUrl = (url: string): string | null => {
    try {
      return photoService.regeneratePublicUrl(url);
    } catch (error) {
      console.error("Erro ao regenerar URL pública:", error);
      return null;
    }
  };

  const downloadPhoto = async (url: string): Promise<string | null> => {
    try {
      return await photoService.downloadPhoto(url);
    } catch (error) {
      console.error("Erro ao baixar foto:", error);
      return null;
    }
  };

  const updateTagPhotoUrl = async (sectorId: string, url: string): Promise<boolean> => {
    try {
      return await photoService.updateTagPhotoUrl(sectorId, url);
    } catch (error) {
      console.error("Erro ao atualizar URL da foto da TAG:", error);
      return false;
    }
  };

  const updateServicePhotos = async (
    serviceId: string, 
    photos: { url: string, type: PhotoType }[]
  ): Promise<boolean> => {
    try {
      console.log(`Atualizando fotos para serviço ${serviceId}:`, photos);
      
      // Obter usuário atual
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Usuário não autenticado");
      }
      
      // Verificar fotos existentes do serviço para evitar duplicação
      const { data: existingPhotos, error: fetchError } = await supabase
        .from('photos')
        .select('url')
        .eq('service_id', serviceId);
        
      if (fetchError) {
        console.error("Erro ao buscar fotos existentes:", fetchError);
        throw fetchError;
      }
      
      // Filtrar fotos já existentes
      const existingUrls = new Set(existingPhotos?.map(p => p.url) || []);
      const newPhotos = photos.filter(p => !existingUrls.has(p.url));
      
      if (newPhotos.length === 0) {
        console.log("Nenhuma foto nova para inserir");
        return true;
      }
      
      // Registrar fotos no banco de dados
      const photosData = newPhotos.map(photo => ({
        service_id: serviceId,
        url: photo.url,
        type: photo.type,
        created_by: user.id,
        metadata: {
          service_id: serviceId,
          type: photo.type
        }
      }));
      
      const { error: insertError } = await supabase
        .from('photos')
        .insert(photosData);
        
      if (insertError) {
        console.error("Erro ao inserir fotos:", insertError);
        throw insertError;
      }
      
      console.log(`${photosData.length} fotos inseridas com sucesso`);
      return true;
    } catch (error) {
      console.error("Erro ao atualizar fotos do serviço:", error);
      toast.error("Falha ao salvar fotos do serviço");
      return false;
    }
  };

  const value = {
    loading,
    error,
    uploadPhoto,
    deletePhoto,
    verifyPhotoUrl,
    regeneratePublicUrl,
    downloadPhoto,
    updateTagPhotoUrl,
    updateServicePhotos
  };

  return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>;
};

// Also keep the original export for backward compatibility
export const ApiProvider = ApiContextExtendedProvider;

export const useApi = (): ApiContextValue => {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error("useApi deve ser usado dentro de um ApiProvider");
  }
  return context;
};
