
import { supabase } from "@/integrations/supabase/client";
import { photoService } from "@/services/photoService";
import { toast } from "sonner";
import { isValidUrl, fixDuplicatedStoragePath } from "@/utils/photoUtils";

export function useTagPhotoUpload() {
  const handleTagPhoto = async (tagPhotoUrl: string, cycleId: string, sectorId: string, userId: string) => {
    try {
      console.log("Processando foto da TAG:", { tagPhotoUrl, cycleId, sectorId, userId });
      
      // Validar a URL
      if (!isValidUrl(tagPhotoUrl)) {
        console.error("URL da foto da TAG é inválida:", tagPhotoUrl);
        throw new Error("URL da foto da TAG é inválida");
      }
      
      // Corrigir possíveis problemas na URL
      const fixedUrl = fixDuplicatedStoragePath(tagPhotoUrl);
      console.log("URL corrigida:", fixedUrl);
      
      // Verificar se a foto já existe para evitar duplicação
      const { data: existingTagPhoto, error: queryError } = await supabase
        .from('photos')
        .select('id')
        .eq('url', fixedUrl)
        .eq('type', 'tag')
        .eq('cycle_id', cycleId)
        .maybeSingle();

      if (queryError) {
        console.warn("Erro ao verificar existência da foto da TAG:", queryError);
      }
        
      if (existingTagPhoto) {
        console.log("Foto da TAG já existe, ignorando:", fixedUrl);
        
        // Garantir que a URL está atualizada no setor mesmo que a foto já exista
        await photoService.updateTagPhotoUrl(sectorId, fixedUrl);
        return true;
      }

      // Inserir a foto da TAG no banco de dados
      console.log("Inserindo nova foto da TAG no banco de dados");
      const { data: photoData, error: tagPhotoError } = await supabase
        .from('photos')
        .insert({
          cycle_id: cycleId,
          service_id: null,
          url: fixedUrl,
          type: 'tag',
          created_by: userId,
          metadata: {
            sector_id: sectorId,
            stage: 'peritagem',
            type: 'tag',
            created_at: new Date().toISOString()
          }
        })
        .select('id');
        
      if (tagPhotoError) {
        console.error('Erro ao inserir foto da TAG:', tagPhotoError);
        throw tagPhotoError;
      }
      
      console.log('Foto da TAG inserida com sucesso no banco de dados:', photoData);
      
      // Atualizar a URL da foto da TAG diretamente na tabela sectors
      const updateResult = await photoService.updateTagPhotoUrl(sectorId, fixedUrl);
      
      if (!updateResult) {
        console.error("Erro ao atualizar URL da foto da TAG no setor, tentativa alternativa");
        
        // Tentativa alternativa direta
        const { error: sectorUpdateError } = await supabase
          .from('sectors')
          .update({
            tag_photo_url: fixedUrl,
            updated_at: new Date().toISOString()
          })
          .eq('id', sectorId);
          
        if (sectorUpdateError) {
          console.error("Erro na tentativa alternativa de atualizar URL da TAG:", sectorUpdateError);
          throw new Error("Não foi possível atualizar a URL da foto da TAG no setor");
        }
      }
      
      console.log('Foto da TAG atualizada com sucesso na tabela sectors:', fixedUrl);
      return true;
    } catch (error) {
      console.error('Erro ao processar foto da TAG:', error);
      toast.error("Erro ao salvar foto da TAG");
      throw error;
    }
  };

  return { handleTagPhoto };
}
