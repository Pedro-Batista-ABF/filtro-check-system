
import { supabase } from "@/integrations/supabase/client";
import { photoService } from "@/services/photoService";
import { toast } from "sonner";
import { isValidUrl, fixDuplicatedStoragePath } from "@/utils/photoUtils";

export function useTagPhotoUpload() {
  const handleTagPhoto = async (tagPhotoUrl: string, cycleId: string, sectorId: string, userId: string) => {
    try {
      console.log("Processando foto da TAG:", { tagPhotoUrl, cycleId, sectorId });
      
      // Validar a URL
      if (!isValidUrl(tagPhotoUrl)) {
        console.error("URL da foto da TAG é inválida:", tagPhotoUrl);
        throw new Error("URL da foto da TAG é inválida");
      }
      
      // Corrigir possíveis problemas na URL
      const fixedUrl = fixDuplicatedStoragePath(tagPhotoUrl);
      console.log("URL corrigida:", fixedUrl);
      
      // Verificar se a URL é acessível (com tratamento mais tolerante)
      let finalUrl = fixedUrl;
      
      try {
        const isAccessible = await photoService.verifyPhotoUrl(fixedUrl);
        
        if (!isAccessible) {
          console.warn("URL da foto da TAG não é acessível, tentando regenerar:", fixedUrl);
          
          const regeneratedUrl = photoService.regeneratePublicUrl(fixedUrl);
          if (regeneratedUrl) {
            console.log("URL regenerada:", regeneratedUrl);
            finalUrl = regeneratedUrl;
          } else {
            console.warn("Não foi possível regenerar a URL da foto da TAG, usando a original");
          }
        }
      } catch (verifyError) {
        console.warn("Erro ao verificar URL da foto da TAG, continuando com a URL original:", verifyError);
      }
    
      // Verificar se a foto já existe para evitar duplicação
      const { data: existingTagPhoto, error: queryError } = await supabase
        .from('photos')
        .select('id')
        .eq('url', finalUrl)
        .eq('type', 'tag')
        .eq('cycle_id', cycleId)
        .maybeSingle();

      if (queryError) {
        console.warn("Erro ao verificar existência da foto da TAG:", queryError);
      }
        
      if (existingTagPhoto) {
        console.log("Foto da TAG já existe, ignorando:", finalUrl);
        return;
      }

      // Inserir a foto da TAG no banco de dados
      const { data: photoData, error: tagPhotoError } = await supabase
        .from('photos')
        .insert({
          cycle_id: cycleId,
          service_id: null,
          url: finalUrl,
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
      
      console.log('Foto da TAG inserida com sucesso no banco de dados');
      
      // Atualizar a URL da foto da TAG diretamente na tabela sectors
      const updateResult = await photoService.updateTagPhotoUrl(sectorId, finalUrl);
      
      if (!updateResult) {
        console.error("Erro ao atualizar URL da foto da TAG no setor");
        
        // Tentativa alternativa direta
        const { error: sectorUpdateError } = await supabase
          .from('sectors')
          .update({
            tag_photo_url: finalUrl,
            updated_at: new Date().toISOString()
          })
          .eq('id', sectorId);
          
        if (sectorUpdateError) {
          console.error("Erro na tentativa alternativa de atualizar URL da TAG:", sectorUpdateError);
          throw new Error("Não foi possível atualizar a URL da foto da TAG no setor");
        }
      }
      
      console.log('Foto da TAG atualizada com sucesso na tabela sectors:', finalUrl);
    } catch (error) {
      console.error('Erro ao processar foto da TAG:', error);
      toast.error("Erro ao salvar foto da TAG");
      throw error;
    }
  };

  return { handleTagPhoto };
}
