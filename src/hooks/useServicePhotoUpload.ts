
import { Service } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { insertServicePhoto } from "@/utils/photoDatabase";

export function useServicePhotoUpload() {
  const uploadServicePhotos = async (cycleId: string, sectorId: string, data: { services?: Service[] }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error("Usuário não autenticado");
        return;
      }

      if (!data.services || !Array.isArray(data.services)) {
        console.log("Nenhum serviço encontrado para upload de fotos");
        return;
      }

      console.log(`Processando fotos para ${data.services.length} serviços`);
      
      // Processar cada serviço selecionado
      for (const service of data.services) {
        if (!service.selected || !service.photos || !Array.isArray(service.photos)) {
          continue;
        }
        
        // Processar cada foto do serviço
        for (const photo of service.photos) {
          if (!photo.url) {
            console.log(`Foto sem URL para o serviço ${service.id}, ignorando`);
            continue;
          }
          
          try {
            // Verificar se a foto já existe no banco
            const { data: existingPhoto, error: checkError } = await supabase
              .from('photos')
              .select('id')
              .eq('url', photo.url)
              .maybeSingle();
              
            if (checkError) {
              console.error(`Erro ao verificar foto existente para ${photo.url}:`, checkError);
            }
            
            if (existingPhoto) {
              console.log(`Foto já existe no banco: ${photo.url}`);
              continue;
            }
            
            // Inserir nova foto
            await insertServicePhoto({
              cycleId,
              serviceId: service.id,
              sectorId,
              url: photo.url,
              type: photo.type || 'before',
              userId: user.id
            });
            
            console.log(`Foto registrada com sucesso para o serviço ${service.id}`);
          } catch (photoError) {
            console.error(`Erro ao processar foto para serviço ${service.id}:`, photoError);
          }
        }
      }
      
      console.log("Todas as fotos de serviços foram processadas");
    } catch (error) {
      console.error("Erro ao fazer upload de fotos dos serviços:", error);
      throw error;
    }
  };

  return { uploadServicePhotos };
}
