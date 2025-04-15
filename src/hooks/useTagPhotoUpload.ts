
import { supabase } from "@/integrations/supabase/client";

export function useTagPhotoUpload() {
  const handleTagPhoto = async (tagPhotoUrl: string, cycleId: string, sectorId: string, userId: string) => {
    const { data: existingTagPhoto } = await supabase
      .from('photos')
      .select('id')
      .eq('url', tagPhotoUrl)
      .eq('type', 'tag')
      .maybeSingle();
      
    if (existingTagPhoto) return;

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
      });
      
    if (tagPhotoError) {
      console.error('Erro ao inserir foto da TAG:', tagPhotoError);
      throw tagPhotoError;
    }
  };

  return { handleTagPhoto };
}
