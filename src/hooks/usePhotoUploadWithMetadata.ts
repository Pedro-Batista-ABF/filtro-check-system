
import { Sector, Photo, PhotoType } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function usePhotoUploadWithMetadata() {
  const uploadPhotosWithMetadata = async (sectorId: string, data: Partial<Sector>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error("Usuário não autenticado ao fazer upload de fotos");
        return;
      }
      
      // Upload da foto da TAG (se nova)
      if (data.tagPhotoUrl && !data.tagPhotoUrl.includes('supabase.co')) {
        await uploadTagPhoto(data.tagPhotoUrl, sectorId, user.id);
      }
      
      // Upload de fotos dos serviços
      if (data.services && Array.isArray(data.services)) {
        for (const service of data.services) {
          if (!service.selected || !service.photos || !Array.isArray(service.photos)) continue;
          
          for (const photo of service.photos) {
            // Apenas faz upload de fotos que ainda não estão no Supabase
            if (photo.url && !photo.url.includes('supabase.co')) {
              try {
                await uploadServicePhoto(photo.url, service.id, sectorId, 'before', user.id);
              } catch (error) {
                console.error(`Erro ao fazer upload da foto para o serviço ${service.id}:`, error);
              }
            }
          }
        }
      }
      
      console.log("Upload de fotos com metadados concluído com sucesso");
    } catch (error) {
      console.error("Erro ao fazer upload de fotos com metadados:", error);
      toast.error("Erro ao processar fotos do setor");
    }
  };
  
  /**
   * Faz upload de uma foto da TAG
   */
  const uploadTagPhoto = async (url: string, sectorId: string, userId: string) => {
    try {
      // Buscar o ciclo atual do setor
      const { data: cycleData, error: cycleError } = await supabase
        .from('cycles')
        .select('id')
        .eq('sector_id', sectorId)
        .order('created_at', { ascending: false })
        .limit(1);
        
      if (cycleError || !cycleData || cycleData.length === 0) {
        console.error("Erro ao buscar ciclo para upload de foto da TAG:", cycleError);
        return;
      }
      
      const cycleId = cycleData[0].id;
      
      // Verificar se a foto já existe
      const { data: existingPhoto } = await supabase
        .from('photos')
        .select('id')
        .eq('cycle_id', cycleId)
        .eq('type', 'tag')
        .maybeSingle();
        
      if (existingPhoto && existingPhoto.id) {
        console.log("Foto da TAG já existe, apenas atualizando URL");
        // Atualizar URL da foto existente
        await supabase
          .from('photos')
          .update({ url: url })
          .eq('id', existingPhoto.id);
          
        return;
      }
      
      // Inserir nova foto
      const { data: photoData, error: photoError } = await supabase
        .from('photos')
        .insert({
          cycle_id: cycleId,
          service_id: null,
          url: url,
          type: 'tag',
          created_by: userId,
          metadata: {
            sector_id: sectorId,
            stage: 'peritagem',
            type: 'tag'
          }
        })
        .select('id');
        
      if (photoError) {
        console.error("Erro ao inserir foto da TAG:", photoError);
        throw photoError;
      }
      
      // Atualizar a URL da foto da TAG diretamente na tabela sectors
      const { error: sectorUpdateError } = await supabase
        .from('sectors')
        .update({
          tag_photo_url: url,
          updated_at: new Date().toISOString()
        })
        .eq('id', sectorId);
        
      if (sectorUpdateError) {
        console.error("Erro ao atualizar URL da foto da TAG no setor:", sectorUpdateError);
      } else {
        console.log("URL da foto da TAG atualizada com sucesso na tabela sectors");
      }
        
      console.log("Foto da TAG inserida com sucesso");
    } catch (error) {
      console.error("Erro ao fazer upload da foto da TAG:", error);
      throw error;
    }
  };
  
  /**
   * Faz upload de uma foto de serviço
   */
  const uploadServicePhoto = async (
    url: string,
    serviceId: string,
    sectorId: string,
    type: PhotoType,
    userId: string
  ) => {
    try {
      // Buscar o ciclo atual do setor
      const { data: cycleData, error: cycleError } = await supabase
        .from('cycles')
        .select('id')
        .eq('sector_id', sectorId)
        .order('created_at', { ascending: false })
        .limit(1);
        
      if (cycleError || !cycleData || cycleData.length === 0) {
        console.error("Erro ao buscar ciclo para upload de foto de serviço:", cycleError);
        return;
      }
      
      const cycleId = cycleData[0].id;
      
      // Inserir foto
      const { data: photoData, error: photoError } = await supabase
        .from('photos')
        .insert({
          cycle_id: cycleId,
          service_id: serviceId,
          url: url,
          type: type,
          created_by: userId,
          metadata: {
            sector_id: sectorId,
            service_id: serviceId,
            stage: 'peritagem',
            type: type
          }
        })
        .select('id');
        
      if (photoError) {
        console.error(`Erro ao fazer upload da foto do serviço ${serviceId}:`, photoError);
        throw photoError;
      }
        
      console.log(`Foto do serviço ${serviceId} inserida com sucesso`);
    } catch (error) {
      console.error(`Erro ao fazer upload da foto do serviço ${serviceId}:`, error);
      throw error;
    }
  };

  return { uploadPhotosWithMetadata };
}
