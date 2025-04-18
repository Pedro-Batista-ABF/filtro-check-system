
import { useState } from "react";
import { Photo, PhotoWithFile, Service } from "@/types";
import { useApi } from "@/contexts/ApiContextExtended";
import { toast } from "sonner";
import { photoService } from "@/services/photoService";

export function useSectorPhotoHandling(
  services?: Service[], 
  setServices?: React.Dispatch<React.SetStateAction<Service[]>>
) {
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

  // New function to handle photo upload with type
  const handlePhotoUpload = async (
    serviceId: string, 
    files: FileList, 
    type: "before" | "after"
  ) => {
    if (!services || !setServices) {
      console.error("Services or setServices not provided");
      return;
    }

    try {
      console.log(`Uploading ${type} photo for service ${serviceId}`);
      const photo = await handleServicePhotoUpload(serviceId, files);
      
      if (photo) {
        // Set the correct type for the photo
        photo.type = type;
        
        // Add the photo to the service
        const updatedServices = addPhotoToService(services, serviceId, photo);
        setServices(updatedServices);
        
        console.log(`Photo added to service ${serviceId} with type ${type}`);
      } else {
        toast.error(`Falha ao adicionar foto ${type === "before" ? "antes" : "depois"}`);
      }
    } catch (error) {
      console.error(`Error uploading ${type} photo:`, error);
      toast.error(`Erro ao fazer upload da foto ${type === "before" ? "antes" : "depois"}`);
    }
  };

  // Mock function for camera capture (can be implemented later)
  const handleCameraCapture = (e: React.MouseEvent, serviceId?: string) => {
    e.preventDefault();
    toast.info("Funcionalidade de câmera não implementada");
    console.log("Camera capture for service:", serviceId);
  };

  return {
    photoUploading,
    handleTagPhotoUpload,
    handleServicePhotoUpload,
    addPhotoToService,
    removePhotoFromService,
    handlePhotoUpload,
    handleCameraCapture
  };
}
