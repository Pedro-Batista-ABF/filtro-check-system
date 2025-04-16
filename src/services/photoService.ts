
import { supabase } from "@/integrations/supabase/client";
import { Photo } from "@/types";
import { toast } from "sonner";

/**
 * Serviço para gerenciar fotos
 */
export const photoService = {
  /**
   * Faz upload de uma foto para o Storage
   */
  uploadPhoto: async (file: File, folder: string = 'general'): Promise<string> => {
    try {
      if (!file || !(file instanceof File)) {
        throw new Error("Arquivo inválido");
      }

      // Verificar se é uma imagem
      if (!file.type.startsWith('image/')) {
        throw new Error("O arquivo precisa ser uma imagem");
      }

      console.log(`Iniciando upload de foto para pasta '${folder}'`);

      // Gerar nome único para o arquivo
      const fileExt = file.name.split('.').pop();
      const randomId = Math.random().toString(36).substring(2, 15);
      const fileName = `${randomId}_${Date.now()}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;
      
      console.log(`Nome de arquivo gerado: ${fileName}`);
      
      // Tentar criar bucket se não existir
      try {
        const { data: bucketData, error: bucketError } = await supabase.storage.getBucket('photos');
        if (bucketError && bucketError.message.includes('not found')) {
          const { error: createError } = await supabase.storage.createBucket('photos', {
            public: true,
            fileSizeLimit: 5242880, // 5MB
          });
          if (createError) {
            console.error("Erro ao criar bucket:", createError);
          } else {
            console.log("Bucket 'photos' criado com sucesso");
          }
        }
      } catch (bucketErr) {
        console.error("Erro ao verificar bucket:", bucketErr);
      }
      
      // Fazer upload para o bucket 'photos'
      const { data, error } = await supabase.storage
        .from('photos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
        
      if (error) {
        console.error("Erro no upload para o Supabase:", error);
        throw error;
      }
      
      console.log("Upload para Supabase concluído com sucesso");
      
      // Obter a URL pública
      const { data: urlData } = supabase.storage
        .from('photos')
        .getPublicUrl(filePath);
        
      if (!urlData || !urlData.publicUrl) {
        throw new Error("Não foi possível obter URL pública da imagem");
      }
      
      console.log(`URL pública gerada: ${urlData.publicUrl}`);
      
      return urlData.publicUrl;
    } catch (error) {
      console.error("Erro no upload da foto:", error);
      throw error;
    }
  },
  
  /**
   * Atualiza fotos para um serviço específico
   */
  updateServicePhotos: async (
    sectorId: string,
    serviceId: string,
    photoUrl: string,
    type: 'before' | 'after'
  ): Promise<boolean> => {
    try {
      // Obter o usuário atual
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        console.error("Usuário não autenticado");
        return false;
      }

      // Encontrar o ciclo atual para este setor
      const { data: cycleData, error: cycleError } = await supabase
        .from('cycles')
        .select('id')
        .eq('sector_id', sectorId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
        
      if (cycleError) {
        console.error("Erro ao encontrar ciclo para foto:", cycleError);
        return false;
      }
      
      // Inserir a foto com associação ao serviço e ID do usuário
      const { error: photoError } = await supabase
        .from('photos')
        .insert({
          cycle_id: cycleData.id,
          service_id: serviceId,
          url: photoUrl,
          type,
          created_by: userData.user.id,
          metadata: {
            sector_id: sectorId,
            service_id: serviceId,
            stage: type === 'before' ? 'peritagem' : 'checagem',
            type
          }
        });
        
      if (photoError) {
        console.error("Erro ao inserir foto do serviço:", photoError);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Erro em updateServicePhotos:", error);
      return false;
    }
  },
  
  /**
   * Recupera todas as fotos de um setor
   */
  getSectorPhotos: async (sectorId: string): Promise<Photo[]> => {
    try {
      // Encontrar o ciclo atual para este setor
      const { data: cycleData, error: cycleError } = await supabase
        .from('cycles')
        .select('id')
        .eq('sector_id', sectorId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
        
      if (cycleError) {
        console.error("Erro ao encontrar ciclo para fotos:", cycleError);
        return [];
      }
      
      // Buscar todas as fotos associadas a este ciclo
      const { data: photos, error: photosError } = await supabase
        .from('photos')
        .select('*')
        .eq('cycle_id', cycleData.id);
        
      if (photosError) {
        console.error("Erro ao buscar fotos do setor:", photosError);
        return [];
      }
      
      return photos as Photo[];
    } catch (error) {
      console.error("Erro em getSectorPhotos:", error);
      return [];
    }
  }
};

/**
 * Hook para usar o serviço de fotos
 */
export function usePhotoService() {
  return photoService;
}
