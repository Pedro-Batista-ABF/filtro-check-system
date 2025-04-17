
import { supabase } from "@/integrations/supabase/client";
import { SectorStatus } from "@/types";

export function useTagPhotoUpload() {
  const handleTagPhoto = async (tagPhotoUrl: string, cycleId: string, sectorId: string, userId: string) => {
    // Verificar se a foto já existe para evitar duplicação
    const { data: existingTagPhoto } = await supabase
      .from('photos')
      .select('id')
      .eq('url', tagPhotoUrl as any)
      .eq('type', 'tag' as any)
      .maybeSingle();
      
    if (existingTagPhoto) {
      console.log("Foto da TAG já existe, ignorando:", tagPhotoUrl);
      return;
    }

    try {
      // Inserir a foto da TAG no banco de dados
      const { error: tagPhotoError } = await supabase
        .from('photos')
        .insert({
          cycle_id: cycleId,
          service_id: null,
          url: tagPhotoUrl,
          type: 'tag',
          created_by: userId,
          metadata: {
            sector_id: sectorId,
            stage: 'peritagem',
            type: 'tag'
          }
        } as any);
        
      if (tagPhotoError) {
        console.error('Erro ao inserir foto da TAG:', tagPhotoError);
        throw tagPhotoError;
      } else {
        console.log('Foto da TAG inserida com sucesso');
      }
    } catch (error) {
      console.error('Erro ao processar foto da TAG:', error);
      throw error;
    }
  };

  return { handleTagPhoto };
}
