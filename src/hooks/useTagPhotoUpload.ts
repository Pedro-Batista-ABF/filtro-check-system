
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
        const urlUpdateResult = await photoService.updateTagPhotoUrl(sectorId, fixedUrl);
        console.log("URL da TAG atualizada no setor:", urlUpdateResult);
        return true;
      }

      // Atualizar a URL da foto da TAG diretamente na tabela sectors
      let updateResult = false;
      let retryCount = 0;
      
      while (!updateResult && retryCount < 3) {
        updateResult = await photoService.updateTagPhotoUrl(sectorId, fixedUrl);
        
        if (!updateResult) {
          console.warn(`Tentativa ${retryCount + 1} de atualizar URL falhou, tentando novamente...`);
          retryCount++;
          
          // Espera breve antes de tentar novamente
          await new Promise(resolve => setTimeout(resolve, 300));
          
          // Na última tentativa, usar método alternativo
          if (retryCount === 2) {
            try {
              console.log("Tentando método alternativo de atualização...");
              const { error: sectorUpdateError } = await supabase
                .from('sectors')
                .update({
                  tag_photo_url: fixedUrl,
                  updated_at: new Date().toISOString()
                })
                .eq('id', sectorId);
              
              if (sectorUpdateError) {
                console.error("Erro na tentativa alternativa:", sectorUpdateError);
              } else {
                console.log("Método alternativo bem-sucedido");
                updateResult = true;
              }
            } catch (alternativeError) {
              console.error("Erro no método alternativo:", alternativeError);
            }
          }
        }
      }
      
      if (!updateResult) {
        console.error("Todas as tentativas de atualizar URL no setor falharam");
        throw new Error("Não foi possível atualizar a URL da foto da TAG no setor");
      }
      
      console.log('Foto da TAG atualizada com sucesso na tabela sectors:', fixedUrl);

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
        // Não interromper o fluxo por causa de erro na inserção da foto,
        // já que a URL foi atualizada no setor
        console.warn('A URL foi atualizada no setor, mas não foi possível registrar na tabela photos');
      } else {
        console.log('Foto da TAG inserida com sucesso no banco de dados:', photoData);
      }
      
      // Verificar se a URL da TAG foi realmente salva
      const { data: checkSector } = await supabase
        .from('sectors')
        .select('tag_photo_url')
        .eq('id', sectorId)
        .maybeSingle();
        
      if (checkSector) {
        console.log("Verificação final - URL salva:", checkSector.tag_photo_url);
        if (checkSector.tag_photo_url !== fixedUrl) {
          console.warn("ALERTA: A URL salva não corresponde à URL corrigida!");
        }
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao processar foto da TAG:', error);
      toast.error("Erro ao salvar foto da TAG");
      throw error;
    }
  };

  return { handleTagPhoto };
}
