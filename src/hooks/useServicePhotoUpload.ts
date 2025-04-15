
import { Service } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { checkPhotoExists, getServicePhotos } from "@/utils/photoValidation";
import { insertServicePhoto } from "@/utils/photoDatabase";

export function useServicePhotoUpload() {
  const uploadServicePhotos = async (cycleId: string, sectorId: string, data: { services?: Service[] }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const servicePhotos = getServicePhotos(data.services);
      
      for (const photo of servicePhotos) {
        if (!photo.url) continue;
        
        const photoExists = await checkPhotoExists(photo.url);
        if (photoExists) {
          console.log("Foto já existe no banco:", photo.url);
          continue;
        }
        
        await insertServicePhoto({
          cycleId,
          serviceId: photo.serviceId || '',
          sectorId,
          url: photo.url,
          type: photo.type,
          userId: user.id
        });
      }
    } catch (error) {
      console.error("Erro ao fazer upload de fotos dos serviços:", error);
      throw error;
    }
  };

  return { uploadServicePhotos };
}
