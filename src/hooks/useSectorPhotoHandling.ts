
import { useState } from "react";
import { Photo, PhotoWithFile, Service } from "@/types";
import { useApi } from "@/contexts/ApiContextExtended";
import { toast } from "sonner";
import { photoService } from "@/services/photoService";

export function useSectorPhotoHandling() {
  const [photoUploading, setPhotoUploading] = useState(false);
  const { uploadPhoto } = useApi();

  // Function to handle tag photo upload
  const handleTagPhotoUpload = async (files: FileList): Promise<string | undefined> => {
    if (!files || files.length === 0) return undefined;

    setPhotoUploading(true);
    try {
      const file = files[0];
      const fileUrl = await uploadPhoto(file, 'tag');
      
      // Verificar se a URL é acessível
      const isAccessible = await photoService.verifyPhotoUrl(fileUrl);
      
      if (!isAccessible) {
        console.warn("URL da foto da TAG não é acessível, tentando regenerar:", fileUrl);
        
        const regeneratedUrl = photoService.regeneratePublicUrl(fileUrl);
        if (regeneratedUrl) {
          console.log("URL regenerada:", regeneratedUrl);
          return regeneratedUrl;
        }
      }
      
      return fileUrl;
    } catch (error) {
      console.error("Erro ao fazer upload da foto da TAG:", error);
      toast.error("Erro ao fazer upload da foto. Tente novamente.");
      return undefined;
    } finally {
      setPhotoUploading(false);
    }
  };

  // Function to handle service photo upload
  const handleServicePhotoUpload = async (
    serviceId: string, 
    files: FileList
  ): Promise<PhotoWithFile | undefined> => {
    if (!files || files.length === 0) return undefined;

    setPhotoUploading(true);
    try {
      const file = files[0];
      const fileUrl = await uploadPhoto(file, `service-${serviceId}`);
      
      // Verificar se a URL é acessível
      const isAccessible = await photoService.verifyPhotoUrl(fileUrl);
      
      if (!isAccessible) {
        console.warn("URL da foto de serviço não é acessível, tentando regenerar:", fileUrl);
        
        const regeneratedUrl = photoService.regeneratePublicUrl(fileUrl);
        if (regeneratedUrl) {
          console.log("URL regenerada:", regeneratedUrl);
          
          return {
            id: `temp-${Date.now()}`,
            url: regeneratedUrl,
            serviceId,
            type: "before",
            file
          };
        }
      }
      
      return {
        id: `temp-${Date.now()}`,
        url: fileUrl,
        serviceId,
        type: "before",
        file
      };
    } catch (error) {
      console.error("Erro ao fazer upload da foto do serviço:", error);
      toast.error("Erro ao fazer upload da foto do serviço. Tente novamente.");
      return undefined;
    } finally {
      setPhotoUploading(false);
    }
  };

  // Function to add a photo to a service
  const addPhotoToService = (
    services: Service[],
    serviceId: string,
    photo: PhotoWithFile
  ): Service[] => {
    return services.map(service => {
      if (service.id === serviceId) {
        const existingPhotos = service.photos || [];
        return {
          ...service,
          photos: [...existingPhotos, photo]
        };
      }
      return service;
    });
  };

  // Function to remove a photo from a service
  const removePhotoFromService = (
    services: Service[],
    serviceId: string,
    photoId: string
  ): Service[] => {
    return services.map(service => {
      if (service.id === serviceId && service.photos) {
        return {
          ...service,
          photos: service.photos.filter(photo => photo.id !== photoId)
        };
      }
      return service;
    });
  };

  return {
    photoUploading,
    handleTagPhotoUpload,
    handleServicePhotoUpload,
    addPhotoToService,
    removePhotoFromService
  };
}
