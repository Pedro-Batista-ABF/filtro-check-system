
import { useState } from "react";
import { toast } from "sonner";
import { Service, PhotoWithFile } from "@/types";
import { photoService } from "@/services/photoService";
import { supabase } from "@/integrations/supabase/client";

export function useSectorPhotoHandling(services: Service[], setServices: (services: Service[]) => void) {
  const [isUploading, setIsUploading] = useState(false);

  const handleTagPhotoUpload = async (files: FileList): Promise<string | undefined> => {
    if (files.length === 0) return undefined;
    
    setIsUploading(true);
    try {
      const file = files[0];
      console.log("Iniciando upload da foto da TAG...");
      
      // Usar o serviço de foto para upload
      const uploadResult = await photoService.uploadPhoto(file, 'tags');
      
      if (!uploadResult) {
        throw new Error("Falha no upload da foto");
      }
      
      console.log("URL da foto da TAG:", uploadResult);
      
      // Verificar se a URL é acessível
      try {
        const isUrlValid = await photoService.verifyPhotoUrl(uploadResult);
        if (!isUrlValid) {
          console.warn(`URL da TAG retornou status inválido`);
          
          // Tentar regenerar a URL pública
          const regeneratedUrl = photoService.regeneratePublicUrl(uploadResult);
          if (regeneratedUrl) {
            console.log("URL pública regenerada:", regeneratedUrl);
            toast.success("Foto da TAG capturada com sucesso");
            return regeneratedUrl;
          }
        }
      } catch (error) {
        console.error("Erro ao verificar URL:", error);
      }
      
      toast.success("Foto da TAG capturada com sucesso");
      return uploadResult;
    } catch (error) {
      console.error('Erro ao fazer upload da foto da TAG:', error);
      toast.error(`Erro ao fazer upload da foto da TAG: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      return undefined;
    } finally {
      setIsUploading(false);
    }
  };

  const handlePhotoUpload = async (serviceId: string, files: FileList, type: "before" | "after"): Promise<void> => {
    if (!Array.isArray(services) || files.length === 0) return;
    
    setIsUploading(true);
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
      let successCount = 0;
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        try {
          const uploadPath = `services/${serviceId}/${type}`;
          console.log(`Enviando foto ${i+1} para ${uploadPath}...`);
          
          const photoUrl = await photoService.uploadPhoto(file, uploadPath);
          
          if (!photoUrl) {
            console.error(`Upload da foto ${i+1} falhou`);
            continue;
          }
          
          // Verificar se a URL é acessível
          let finalUrl = photoUrl;
          try {
            const isUrlValid = await photoService.verifyPhotoUrl(photoUrl);
            if (!isUrlValid) {
              console.warn(`URL da foto retornou status inválido`);
              
              // Tentar regenerar a URL pública
              const regeneratedUrl = photoService.regeneratePublicUrl(photoUrl);
              if (regeneratedUrl) {
                console.log("URL pública regenerada:", regeneratedUrl);
                finalUrl = regeneratedUrl;
              }
            }
          } catch (urlError) {
            console.error("Erro ao verificar URL:", urlError);
          }
          
          newPhotos.push({
            id: `photo-${Date.now()}-${i}`,
            url: finalUrl,
            type,
            serviceId,
            file
          });
          
          console.log(`Foto ${i+1} adicionada com sucesso. URL: ${finalUrl}`);
          successCount++;
          
          // Registrar no banco de dados
          try {
            await photoService.updateServicePhotos(service.id, serviceId, finalUrl, type);
          } catch (dbError) {
            console.error("Erro ao registrar foto no banco de dados:", dbError);
          }
        } catch (uploadError) {
          console.error(`Erro ao fazer upload da foto ${i+1}:`, uploadError);
          toast.error(`Erro ao fazer upload da foto ${i + 1}`);
        }
      }
      
      // Atualizar o serviço com as novas fotos apenas se pelo menos uma foi enviada com sucesso
      if (successCount > 0) {
        updatedServices[serviceIndex] = {
          ...service,
          photos: newPhotos
        };
        
        console.log(`Atualizando serviço com ${newPhotos.length} foto(s)...`);
        setServices(updatedServices);
        
        toast.success(`${successCount} foto(s) adicionada(s) ao serviço`);
      } else if (files.length > 0) {
        toast.error("Nenhuma foto foi enviada com sucesso");
      }
    } catch (error) {
      console.error('Erro no processamento de fotos:', error);
      toast.error(`Erro ao processar fotos: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleScrapPhotoUpload = async (files: FileList): Promise<PhotoWithFile[]> => {
    if (files.length === 0) return [];
    
    setIsUploading(true);
    const scrapPhotos: PhotoWithFile[] = [];
    
    try {
      console.log(`Iniciando upload de ${files.length} foto(s) de sucateamento...`);
      let successCount = 0;
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        try {
          const uploadPath = `scrap/${Date.now()}`;
          console.log(`Enviando foto de sucateamento ${i+1} para ${uploadPath}...`);
          
          const photoUrl = await photoService.uploadPhoto(file, uploadPath);
          
          if (!photoUrl) {
            console.error(`Upload da foto de sucateamento ${i+1} falhou`);
            continue;
          }
          
          // Verificar se a URL é acessível
          let finalUrl = photoUrl;
          try {
            const isUrlValid = await photoService.verifyPhotoUrl(photoUrl);
            if (!isUrlValid) {
              console.warn(`URL da foto retornou status inválido`);
              
              // Tentar regenerar a URL pública
              const regeneratedUrl = photoService.regeneratePublicUrl(photoUrl);
              if (regeneratedUrl) {
                console.log("URL pública regenerada:", regeneratedUrl);
                finalUrl = regeneratedUrl;
              }
            }
          } catch (urlError) {
            console.error("Erro ao verificar URL:", urlError);
          }
          
          scrapPhotos.push({
            id: `scrap-photo-${Date.now()}-${i}`,
            url: finalUrl,
            type: 'scrap',
            file
          });
          
          console.log(`Foto de sucateamento ${i+1} adicionada com sucesso. URL: ${finalUrl}`);
          successCount++;
        } catch (uploadError) {
          console.error(`Erro ao fazer upload da foto de sucateamento ${i+1}:`, uploadError);
          toast.error(`Erro ao fazer upload da foto ${i + 1}`);
        }
      }
      
      if (successCount > 0) {
        toast.success(`${successCount} foto(s) de sucateamento adicionada(s)`);
      } else if (files.length > 0) {
        toast.error("Nenhuma foto de sucateamento foi enviada com sucesso");
      }
      
      return scrapPhotos;
    } catch (error) {
      console.error('Erro no processamento de fotos de sucateamento:', error);
      toast.error(`Erro ao processar fotos: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      return [];
    } finally {
      setIsUploading(false);
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
      return photoService.extractPathFromUrl(url);
    } catch (e) {
      return null;
    }
  };

  return {
    handleTagPhotoUpload,
    handlePhotoUpload,
    handleScrapPhotoUpload,
    handleCameraCapture,
    isUploading
  };
}
