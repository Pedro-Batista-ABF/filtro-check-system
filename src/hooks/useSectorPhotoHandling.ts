
import { toast } from "sonner";
import { Service } from "@/types";
import { photoService } from "@/services/photoService";

export function useSectorPhotoHandling(services: Service[], setServices: (services: Service[]) => void) {
  const handleTagPhotoUpload = async (files: FileList) => {
    if (files.length > 0) {
      try {
        const file = files[0];
        // Usar o serviço de foto real em vez de URL temporária
        const uploadResult = await photoService.uploadPhoto(file, 'tags');
        
        if (uploadResult) {
          toast.success("Foto da TAG capturada com sucesso");
          return uploadResult;
        } else {
          throw new Error("URL de foto inválida");
        }
      } catch (error) {
        console.error('Erro ao fazer upload da foto da TAG:', error);
        toast.error("Erro ao fazer upload da foto da TAG");
        return undefined;
      }
    }
    return undefined;
  };

  const handlePhotoUpload = async (serviceId: string, files: FileList, type: "before" | "after") => {
    if (!Array.isArray(services) || files.length === 0) return;
    
    try {
      const updatedServices = [...services];
      const serviceIndex = updatedServices.findIndex(service => service.id === serviceId);
      
      if (serviceIndex === -1) {
        toast.error("Serviço não encontrado");
        return;
      }
      
      const service = updatedServices[serviceIndex];
      const newPhotos = [...(service.photos || [])];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        try {
          const uploadPath = `services/${serviceId}/${type}`;
          const photoUrl = await photoService.uploadPhoto(file, uploadPath);
          
          if (photoUrl) {
            newPhotos.push({
              id: `photo-${Date.now()}-${i}`,
              url: photoUrl,
              type,
              serviceId,
              file
            });
            console.log(`Foto adicionada com sucesso. URL: ${photoUrl}`);
          } else {
            console.error('URL de foto retornada inválida');
            toast.error(`Erro ao processar foto ${i + 1}`);
          }
        } catch (uploadError) {
          console.error('Erro ao fazer upload da foto:', uploadError);
          toast.error(`Erro ao fazer upload da foto ${i + 1}`);
        }
      }
      
      // Atualizar o serviço com as novas fotos
      updatedServices[serviceIndex] = {
        ...service,
        photos: newPhotos
      };
      
      setServices(updatedServices);
      
      if (newPhotos.length > (service.photos?.length || 0)) {
        toast.success(`${files.length} foto(s) adicionada(s) ao serviço`);
      }
    } catch (error) {
      console.error('Erro no processamento de fotos:', error);
      toast.error("Erro ao processar fotos");
    }
  };

  const handleCameraCapture = (e: React.MouseEvent, serviceId?: string) => {
    e.preventDefault();
    
    // Verificar se a API de câmera está disponível
    if ('mediaDevices' in navigator && navigator.mediaDevices.getUserMedia) {
      toast.info("Abrindo câmera...", {
        description: "Esta funcionalidade ainda está em desenvolvimento."
      });
    } else {
      toast.error("Câmera não disponível", {
        description: "Seu dispositivo não suporta acesso à câmera ou o acesso foi negado."
      });
    }
  };

  return {
    handleTagPhotoUpload,
    handlePhotoUpload,
    handleCameraCapture
  };
}
