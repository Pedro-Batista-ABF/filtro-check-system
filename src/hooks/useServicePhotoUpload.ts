
import { Photo, Service } from "@/types";
import { supabase } from "@/integrations/supabase/client";

export function useServicePhotoUpload() {
  const uploadServicePhotos = async (cycleId: string, sectorId: string, data: { services?: Service[] }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const selectedServices = data.services?.filter(service => service.selected) || [];
      
      for (const service of selectedServices) {
        const servicePhotos = service.photos || [];
        
        for (const photo of servicePhotos) {
          if (!photo.url) continue;
          
          const { data: existingPhoto } = await supabase
            .from('photos')
            .select('id')
            .eq('url', photo.url)
            .maybeSingle();
            
          if (existingPhoto) {
            console.log("Foto já existe no banco:", photo.url);
            continue;
          }
          
          const { error: photoError } = await supabase
            .from('photos')
            .insert({
              cycle_id: cycleId,
              service_id: service.id,
              url: photo.url,
              type: photo.type || 'before',
              created_by: user.id,
              metadata: {
                sector_id: sectorId,
                service_id: service.id,
                stage: 'peritagem',
                type: photo.type || 'servico'
              }
            });
            
          if (photoError) {
            console.error(`Erro ao inserir foto para serviço ${service.id}:`, photoError);
            throw photoError;
          }
        }
      }
    } catch (error) {
      console.error("Erro ao fazer upload de fotos dos serviços:", error);
      throw error;
    }
  };

  return { uploadServicePhotos };
}
