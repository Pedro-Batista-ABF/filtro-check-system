
import { Sector } from "@/types";
import { useTagPhotoUpload } from "./useTagPhotoUpload";
import { useServicePhotoUpload } from "./useServicePhotoUpload";
import { supabase } from "@/integrations/supabase/client";

export function usePhotoUploadWithMetadata() {
  const { handleTagPhoto } = useTagPhotoUpload();
  const { uploadServicePhotos } = useServicePhotoUpload();

  const uploadPhotosWithMetadata = async (sectorId: string, data: Partial<Sector>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: cycleData, error: cycleError } = await supabase
        .from('cycles')
        .select('id')
        .eq('sector_id', sectorId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
        
      if (cycleError || !cycleData) {
        console.error("Erro ao buscar ciclo para salvar fotos:", cycleError);
        return;
      }

      await Promise.all([
        data.tagPhotoUrl && handleTagPhoto(data.tagPhotoUrl, cycleData.id, sectorId, user.id),
        uploadServicePhotos(cycleData.id, sectorId, data)
      ]);
      
    } catch (error) {
      console.error("Erro ao fazer upload de fotos com metadados:", error);
      throw error;
    }
  };

  return { uploadPhotosWithMetadata };
}
