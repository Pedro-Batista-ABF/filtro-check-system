
import { Sector } from "@/types";
import { useTagPhotoUpload } from "./useTagPhotoUpload";
import { useServicePhotoUpload } from "./useServicePhotoUpload";
import { supabase } from "@/integrations/supabase/client";

export function usePhotoUploadWithMetadata() {
  const { handleTagPhoto } = useTagPhotoUpload();
  const { uploadServicePhotos } = useServicePhotoUpload();

  const uploadPhotosWithMetadata = async (sectorId: string, data: Partial<Sector>) => {
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        console.error("Usuário não autenticado:", userError);
        throw new Error("Usuário não autenticado");
      }

      // Buscar o ciclo atual para o setor
      const { data: cyclesData, error: cycleError } = await supabase
        .from('cycles')
        .select('id')
        .eq('sector_id', sectorId)
        .order('created_at', { ascending: false })
        .limit(1);
        
      if (cycleError || !cyclesData || cyclesData.length === 0) {
        console.error("Erro ao buscar ciclo para salvar fotos:", cycleError || "Nenhum ciclo encontrado");
        throw new Error("Erro ao buscar ciclo");
      }

      const cycleId = cyclesData[0].id;
      console.log(`Ciclo encontrado: ${cycleId} para o setor ${sectorId}`);

      // Array para armazenar promessas de uploads
      const uploadPromises = [];

      // Upload da foto da TAG
      if (data.tagPhotoUrl) {
        uploadPromises.push(handleTagPhoto(data.tagPhotoUrl, cycleId, sectorId, userData.user.id));
      }

      // Upload das fotos dos serviços
      uploadPromises.push(uploadServicePhotos(cycleId, sectorId, data));
      
      // Aguardar conclusão de todos os uploads
      await Promise.allSettled(uploadPromises);
      
      console.log("Upload de fotos com metadados concluído com sucesso");
    } catch (error) {
      console.error("Erro ao fazer upload de fotos com metadados:", error);
      throw error;
    }
  };

  return { uploadPhotosWithMetadata };
}
