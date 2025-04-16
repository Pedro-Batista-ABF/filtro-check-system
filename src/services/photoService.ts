
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
      
      // Verificar se o bucket existe ou criar
      try {
        const { data: buckets } = await supabase.storage.listBuckets();
        
        // Verificar se o bucket 'photos' existe
        const bucketExists = buckets && buckets.some(b => b.name === 'photos');
        
        if (!bucketExists) {
          console.log("Bucket 'photos' não encontrado, tentando criar...");
          const { data, error } = await supabase.storage.createBucket('photos', {
            public: true,
            fileSizeLimit: 5242880, // 5MB
          });
          
          if (error) {
            console.error("Erro ao criar bucket:", error);
            // Continuar mesmo com erro, tentando usar o upload
          } else {
            console.log("Bucket 'photos' criado com sucesso");
          }
        } else {
          console.log("Bucket 'photos' já existe");
        }
      } catch (bucketErr) {
        console.error("Erro ao verificar bucket:", bucketErr);
        // Continuar mesmo com erro
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
        
        // Método alternativo - usar um URL de dados temporário
        const reader = new FileReader();
        return new Promise((resolve, reject) => {
          reader.onload = (e) => {
            if (e.target && e.target.result) {
              console.log("Usando URL de dados temporário como fallback");
              resolve(e.target.result as string);
            } else {
              reject(new Error("Falha ao gerar URL de dados para a imagem"));
            }
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
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
      
      // Método alternativo - usar um URL de dados temporário
      if (file) {
        const reader = new FileReader();
        return new Promise((resolve, reject) => {
          reader.onload = (e) => {
            if (e.target && e.target.result) {
              console.log("Usando URL de dados temporário como fallback após erro");
              resolve(e.target.result as string);
            } else {
              reject(new Error("Falha ao gerar URL de dados para a imagem após erro"));
            }
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      }
      
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
        .maybeSingle();
        
      if (cycleError || !cycleData) {
        console.error("Erro ao encontrar ciclo para foto:", cycleError);
        return false;
      }
      
      // Inserir a foto com associação ao serviço e ID do usuário
      const photoData = {
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
      };
      
      const { error: photoError } = await supabase
        .from('photos')
        .insert(photoData);
        
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
        .maybeSingle();
        
      if (cycleError || !cycleData) {
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
