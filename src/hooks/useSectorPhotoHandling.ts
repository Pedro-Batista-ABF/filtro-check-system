
import { toast } from "sonner";
import { Service } from "@/types";

export function useSectorPhotoHandling(services: Service[], setServices: (services: Service[]) => void) {
  const handleTagPhotoUpload = async (files: FileList) => {
    if (files.length > 0) {
      const tempUrl = URL.createObjectURL(files[0]);
      toast.success("Foto da TAG capturada");
      return tempUrl;
    }
    return undefined;
  };

  const handlePhotoUpload = (serviceId: string, files: FileList, type: "before" | "after") => {
    if (!Array.isArray(services) || files.length === 0) return;

    const updatedServices = services.map(service => {
      if (service.id === serviceId) {
        const newPhotos = [...(service.photos || [])];
        
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const tempId = `temp-${Date.now()}-${i}`;
          const tempUrl = URL.createObjectURL(file);
          
          newPhotos.push({
            id: tempId,
            url: tempUrl,
            type,
            serviceId,
            file
          });
        }
        
        return { ...service, photos: newPhotos };
      }
      return service;
    });
    
    setServices(updatedServices);
  };

  const handleCameraCapture = (e: React.MouseEvent, serviceId?: string) => {
    e.preventDefault();
    // Camera functionality would go here in a real implementation
    toast.info("Captura de câmera não implementada nesta versão");
  };

  return {
    handleTagPhotoUpload,
    handlePhotoUpload,
    handleCameraCapture
  };
}
