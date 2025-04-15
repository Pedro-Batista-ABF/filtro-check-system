
import { Photo, Sector } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function usePhotoUploadWithMetadata() {
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
              cycle_id: cycleData.id,
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
          }
        }
      }

      // Process tag photo if available
      if (data.tagPhotoUrl) {
        await handleTagPhoto(data.tagPhotoUrl, cycleData.id, sectorId, user.id);
      }
      
    } catch (error) {
      console.error("Erro ao fazer upload de fotos com metadados:", error);
      throw error;
    }
  };

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
    }
  };

  return { uploadPhotosWithMetadata };
}
