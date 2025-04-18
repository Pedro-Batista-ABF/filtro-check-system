
import { toast } from "sonner";
import { Service, PhotoWithFile } from "@/types";
import { photoService } from "@/services/photoService";
import { supabase } from "@/integrations/supabase/client";

export function useSectorPhotoHandling(services: Service[], setServices: (services: Service[]) => void) {
  const handleTagPhotoUpload = async (files: FileList): Promise<string | undefined> => {
    if (files.length > 0) {
      try {
        const file = files[0];
        console.log("Iniciando upload da foto da TAG...");
        
        // Usar o serviço de foto para upload
        const uploadResult = await photoService.uploadPhoto(file, 'tags');
        
        if (uploadResult) {
          console.log("URL da foto da TAG:", uploadResult);
          
          // Verificar se a URL é acessível
          try {
            const response = await fetch(uploadResult, { method: 'HEAD' });
            if (!response.ok) {
              console.warn(`URL da TAG retornou status ${response.status}`);
              
              // Tentar regenerar a URL pública
              const path = extractPathFromUrl(uploadResult);
              if (path) {
                const { data } = supabase.storage
                  .from('sector_photos')
                  .getPublicUrl(path);
                  
                if (data.publicUrl) {
                  console.log("URL pública regenerada:", data.publicUrl);
                  toast.success("Foto da TAG capturada com sucesso");
                  return data.publicUrl;
                }
              }
            }
          } catch (error) {
            console.error("Erro ao verificar URL:", error);
          }
          
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

  const handlePhotoUpload = async (serviceId: string, files: FileList, type: "before" | "after"): Promise<void> => {
    if (!Array.isArray(services) || files.length === 0) return;
    
    try {
      console.log(`Iniciando upload de ${files.length} foto(s) para o serviço ${serviceId}...`);
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
          console.log(`Enviando foto ${i+1} para ${uploadPath}...`);
          const photoUrl = await photoService.uploadPhoto(file, uploadPath);
          
          if (photoUrl) {
            // Verificar se a URL é acessível
            try {
              const response = await fetch(photoUrl, { method: 'HEAD' });
              if (!response.ok) {
                console.warn(`URL da foto retornou status ${response.status}`);
                
                // Tentar regenerar a URL pública
                const path = extractPathFromUrl(photoUrl);
                if (path) {
                  const { data } = supabase.storage
                    .from('sector_photos')
                    .getPublicUrl(path);
                    
                  if (data.publicUrl) {
                    console.log("URL pública regenerada:", data.publicUrl);
                    
                    newPhotos.push({
                      id: `photo-${Date.now()}-${i}`,
                      url: data.publicUrl,
                      type,
                      serviceId,
                      file
                    });
                    continue;
                  }
                }
              }
            } catch (error) {
              console.error("Erro ao verificar URL:", error);
            }
            
            newPhotos.push({
              id: `photo-${Date.now()}-${i}`,
              url: photoUrl,
              type,
              serviceId,
              file
            });
            console.log(`Foto ${i+1} adicionada com sucesso. URL: ${photoUrl}`);
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
      
      console.log(`Atualizando serviço com ${newPhotos.length} foto(s)...`);
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

  // Função auxiliar para extrair o caminho do bucket de uma URL pública
  const extractPathFromUrl = (url: string): string | null => {
    try {
      const urlParts = url.split('/object/public/');
      if (urlParts.length > 1) {
        return urlParts[1];
      }
      return null;
    } catch (e) {
      return null;
    }
  };

  return {
    handleTagPhotoUpload,
    handlePhotoUpload,
    handleCameraCapture
  };
}
