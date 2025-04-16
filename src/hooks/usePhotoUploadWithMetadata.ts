
import { supabase } from "@/integrations/supabase/client";
import { Sector, PhotoWithFile } from "@/types";

export function usePhotoUploadWithMetadata() {
  const uploadPhotosWithMetadata = async (sectorId: string, data: Partial<Sector>) => {
    try {
      // Verificar se há foto da TAG
      if (data.tagPhotoUrl && data.tagPhotoUrl.startsWith('blob:')) {
        await uploadTagPhoto(sectorId, data.tagPhotoUrl);
      }
      
      return true;
    } catch (error) {
      console.error("Erro ao fazer upload das fotos com metadados:", error);
      return false;
    }
  };

  const uploadTagPhoto = async (sectorId: string, tagPhotoUrl: string) => {
    try {
      // Buscar dados do ciclo para o setor
      const { data: cycleData, error: cycleError } = await supabase
        .from('cycles')
        .select('id')
        .eq('sector_id', sectorId as unknown as string)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (cycleError) {
        throw cycleError;
      }

      const cycleId = cycleData?.id;
      if (!cycleId) {
        throw new Error("ID do ciclo não encontrado");
      }

      // Converter blob para File
      const response = await fetch(tagPhotoUrl);
      const blob = await response.blob();
      const file = new File([blob], `tag-${Date.now()}.jpg`, { type: 'image/jpeg' });

      // Fazer upload da foto para o storage
      const filePath = `tag-photos/${sectorId}/${Date.now()}.jpg`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('sector_photos')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Obter URL pública da foto
      const { data: publicUrlData } = await supabase.storage
        .from('sector_photos')
        .getPublicUrl(filePath);

      const url = publicUrlData.publicUrl;

      // Adicionar metadados da foto no banco de dados
      const photoData = {
        cycle_id: cycleId,
        type: 'tag' as string,
        url: url,
        service_id: null,
        created_by: (await supabase.auth.getUser()).data.user?.id,
        metadata: {
          sector_id: sectorId,
          stage: 'peritagem',
          type: 'tag'
        }
      };

      const { error: photoError } = await supabase
        .from('photos')
        .insert(photoData);

      if (photoError) {
        throw photoError;
      }

      return url;
    } catch (error) {
      console.error("Erro ao fazer upload de foto da TAG:", error);
      throw error;
    }
  };

  return { uploadPhotosWithMetadata };
}
