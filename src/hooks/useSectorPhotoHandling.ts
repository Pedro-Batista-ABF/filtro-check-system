
import { toast } from "sonner";
import { Service } from "@/types";

export function useSectorPhotoHandling() {
  const handleTagPhotoUpload = async (files: FileList) => {
    if (files.length > 0) {
      const tempUrl = URL.createObjectURL(files[0]);
      toast.success("Foto da TAG capturada");
      return tempUrl;
    }
    return undefined;
  };

  const handleServicePhotoUpload = (
    serviceId: string,
    files: FileList,
    type: "before" | "after",
    services: Service[]
  ): Service[] => {
    if (files.length === 0) return services;

    return services.map(service => {
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
  };

  return {
    handleTagPhotoUpload,
    handleServicePhotoUpload
  };
}
