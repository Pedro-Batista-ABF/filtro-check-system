
import { useState } from 'react';
import { photoService } from '@/services/photoService';
import { Service, PhotoWithFile } from '@/types';
import { useApi } from '@/contexts/ApiContextExtended';
import { fileToBase64 } from '@/utils/photoUtils';
import { toast } from 'sonner';

export const useSectorPhotoHandling = (
  services: Service[],
  setServices: (services: Service[]) => void
) => {
  const [isUploading, setIsUploading] = useState(false);
  const { uploadPhoto } = useApi();

  const handleTagPhotoUpload = async (files: FileList): Promise<string | undefined> => {
    try {
      if (!files || files.length === 0) {
        return undefined;
      }
      
      setIsUploading(true);
      const file = files[0];
      
      // Verificar o tamanho (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Arquivo muito grande", {
          description: "O tamanho máximo permitido é 10MB"
        });
        return undefined;
      }
      
      // Upload da foto
      console.log("Iniciando upload da foto da TAG com file:", file.name, file.size);
      const url = await uploadPhoto(file);
      
      if (!url) {
        console.error("Upload falhou: URL indefinida");
        throw new Error("Erro ao obter URL da foto");
      }
      
      console.log("URL da foto da TAG obtida com sucesso:", url);
      return url;
    } catch (error) {
      console.error("Erro ao fazer upload da foto da TAG:", error);
      toast.error("Erro ao fazer upload da foto");
      return undefined;
    } finally {
      setIsUploading(false);
    }
  };

  const handlePhotoUpload = async (serviceId: string, files: FileList, type: 'before' | 'after') => {
    try {
      if (!files || files.length === 0) return;
      
      setIsUploading(true);
      
      // Encontrar o serviço pelo ID
      const serviceIndex = services.findIndex(s => s.id === serviceId);
      if (serviceIndex === -1) {
        console.error('Serviço não encontrado:', serviceId);
        return;
      }
      
      // Clonar o array de serviços
      const updatedServices = [...services];
      
      // Obter o serviço
      const service = { ...updatedServices[serviceIndex] };
      
      // Inicializar o array de fotos se não existir
      if (!service.photos) {
        service.photos = [];
      }
      
      // Processar cada arquivo
      const uploadPromises = Array.from(files).map(async (file) => {
        try {
          // Verificar o tamanho (10MB max)
          if (file.size > 10 * 1024 * 1024) {
            toast.error("Arquivo muito grande", {
              description: "O tamanho máximo permitido é 10MB"
            });
            return null;
          }
          
          console.log(`Fazendo upload de foto ${type} para serviço ${serviceId}:`, file.name);
          
          // Obter URL da foto
          const url = await uploadPhoto(file);
          
          if (!url) {
            console.error('Erro ao obter URL da foto durante upload');
            return null;
          }
          
          console.log(`Foto ${type} para serviço ${serviceId} enviada, URL:`, url);
          
          // Criar objeto de foto
          const newPhoto: PhotoWithFile = {
            id: `new-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            url,
            type,
            serviceId,
            file
          };
          
          return newPhoto;
        } catch (error) {
          console.error('Erro ao processar foto durante upload:', error);
          return null;
        }
      });
      
      // Aguardar todas as promessas
      const newPhotos = (await Promise.all(uploadPromises)).filter(Boolean) as PhotoWithFile[];
      
      // Adicionar novas fotos ao serviço
      service.photos = [...service.photos, ...newPhotos];
      
      // Atualizar o serviço no array
      updatedServices[serviceIndex] = service;
      
      // Atualizar o estado
      setServices(updatedServices);
      
      toast.success(`${newPhotos.length} foto(s) adicionada(s)`);
    } catch (error) {
      console.error('Erro ao fazer upload de fotos:', error);
      toast.error("Erro ao fazer upload de fotos");
    } finally {
      setIsUploading(false);
    }
  };

  const handleCameraCapture = (e: React.MouseEvent, serviceId?: string) => {
    e.preventDefault();
    
    toast.info("Captura de câmera", {
      description: "Funcionalidade de captura de câmera será implementada em breve."
    });
  };

  return {
    handleTagPhotoUpload,
    handlePhotoUpload,
    handleCameraCapture,
    isUploading
  };
};
