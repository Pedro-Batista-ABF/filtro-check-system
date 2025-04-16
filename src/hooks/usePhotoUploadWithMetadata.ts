
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
      if (!user) {
        console.error("Usuário não autenticado");
        return;
      }

      // Buscar o ciclo atual para o setor
      const { data: cyclesData, error: cycleError } = await supabase
        .from('cycles')
        .select('id')
        .eq('sector_id', sectorId as any)
        .order('created_at', { ascending: false })
        .limit(1);
        
      if (cycleError || !cyclesData || cyclesData.length === 0) {
        console.error("Erro ao buscar ciclo para salvar fotos:", cycleError || "Nenhum ciclo encontrado");
        return;
      }

      const cycleId = cyclesData[0].id;
      console.log(`Ciclo encontrado: ${cycleId} para o setor ${sectorId}`);

      // Upload das fotos da TAG e dos serviços em paralelo
      await Promise.all([
        data.tagPhotoUrl && handleTagPhoto(data.tagPhotoUrl, cycleId, sectorId, user.id),
        uploadServicePhotos(cycleId, sectorId, data)
      ]);
      
      console.log("Upload de fotos com metadados concluído com sucesso");
    } catch (error) {
      console.error("Erro ao fazer upload de fotos com metadados:", error);
      throw error;
    }
  };

  return { uploadPhotosWithMetadata };
}
