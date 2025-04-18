
import { supabase } from "@/integrations/supabase/client";
import { SectorStatus, PhotoType } from "@/types";
import { photoService } from "@/services/photoService";
import { toast } from "sonner";

export function useTagPhotoUpload() {
  const handleTagPhoto = async (tagPhotoUrl: string, cycleId: string, sectorId: string, userId: string) => {
    try {
      console.log("Processando foto da TAG:", { tagPhotoUrl, cycleId, sectorId });
      
      // Verificar se a URL é acessível
      const isAccessible = await photoService.verifyPhotoUrl(tagPhotoUrl);
      
      if (!isAccessible) {
        console.warn("URL da foto da TAG não é acessível, tentando regenerar:", tagPhotoUrl);
        
        const regeneratedUrl = photoService.regeneratePublicUrl(tagPhotoUrl);
        if (regeneratedUrl) {
          console.log("URL regenerada:", regeneratedUrl);
          tagPhotoUrl = regeneratedUrl;
        } else {
          console.error("Não foi possível regenerar a URL da foto da TAG");
        }
      }
    
      // Verificar se a foto já existe para evitar duplicação
      const { data: existingTagPhoto } = await supabase
        .from('photos')
        .select('id')
        .eq('url', tagPhotoUrl)
        .eq('type', 'tag')
        .eq('cycle_id', cycleId)
        .maybeSingle();
        
      if (existingTagPhoto) {
        console.log("Foto da TAG já existe, ignorando:", tagPhotoUrl);
        return;
      }

      // Inserir a foto da TAG no banco de dados
      const { data: photoData, error: tagPhotoError } = await supabase
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
        })
        .select('id');
        
      if (tagPhotoError) {
        console.error('Erro ao inserir foto da TAG:', tagPhotoError);
        throw tagPhotoError;
      }
      
      // Atualizar a URL da foto da TAG diretamente na tabela sectors
      const { error: sectorUpdateError } = await supabase
        .from('sectors')
        .update({
          tag_photo_url: tagPhotoUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', sectorId);
        
      if (sectorUpdateError) {
        console.error("Erro ao atualizar URL da foto da TAG no setor:", sectorUpdateError);
      } else {
        console.log('Foto da TAG inserida com sucesso e atualizada na tabela sectors');
      }
    } catch (error) {
      console.error('Erro ao processar foto da TAG:', error);
      toast.error("Erro ao salvar foto da TAG");
      throw error;
    }
  };

  return { handleTagPhoto };
}
