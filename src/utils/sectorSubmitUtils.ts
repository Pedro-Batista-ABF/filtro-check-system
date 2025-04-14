
import { Sector, Photo, PhotoWithFile, SectorStatus, Service } from "@/types";
import { supabase } from "@/integrations/supabase/client";

/**
 * Process service photos for submission (upload any File objects)
 */
export async function processServicePhotos(
  services: Service[],
  uploadPhoto: (file: File, folder: string) => Promise<string>
): Promise<Photo[]> {
  const processedPhotos: Photo[] = [];
  
  for (const service of services) {
    if (service.selected && service.photos) {
      for (const photo of service.photos) {
        // Check if this is a PhotoWithFile and has a file
        const photoWithFile = photo as PhotoWithFile;
        if (photoWithFile && photoWithFile.file) {
          try {
            // Upload the photo and get its URL
            const url = await uploadPhoto(photoWithFile.file, 'services');
            
            // Add to processed photos
            processedPhotos.push({
              id: photo.id,
              url,
              type: photo.type,
              serviceId: service.id,
              // Add metadata to improve traceability
              metadata: {
                service_id: service.id,
                service_name: service.name,
                stage: 'peritagem',
                upload_time: new Date().toISOString()
              }
            });
          } catch (error) {
            console.error(`Error uploading photo for service ${service.id}:`, error);
          }
        } else if (photo.url) {
          // Photo already has a URL, just add it to the list with metadata
          processedPhotos.push({
            id: photo.id,
            url: photo.url,
            type: photo.type,
            serviceId: service.id,
            // Add metadata to improve traceability
            metadata: {
              service_id: service.id,
              service_name: service.name,
              stage: 'peritagem',
              existing_photo: true
            }
          });
        }
      }
    }
  }
  
  return processedPhotos;
}

/**
 * Update the status of a sector and related metadata in the database
 */
export async function updateSectorStatusAndMetadata(
  sectorId: string,
  data: Partial<Sector>
): Promise<boolean> {
  try {
    console.log(`Atualizando status do setor ${sectorId} no banco de dados...`);
    
    // Update sector status
    const { error } = await supabase
      .from('sectors')
      .update({
        current_status: data.status || 'emExecucao',
        current_outcome: data.outcome || 'EmAndamento',
        updated_at: new Date().toISOString()
      })
      .eq('id', sectorId);
      
    if (error) {
      console.error("Erro ao atualizar status do setor:", error);
      throw error;
    }
    
    // Update cycle status
    const { error: cycleError } = await supabase
      .from('cycles')
      .update({
        status: data.status || 'emExecucao',
        outcome: data.outcome || 'EmAndamento',
        updated_at: new Date().toISOString(),
        // Additional metadata
        entry_invoice: data.entryInvoice,
        tag_number: data.tagNumber,
        peritagem_date: data.peritagemDate
      })
      .eq('sector_id', sectorId)
      .order('created_at', { ascending: false })
      .limit(1);
      
    if (cycleError) {
      console.error("Erro ao atualizar status do ciclo:", cycleError);
      throw cycleError;
    }
    
    // Se for um status especial (como sucateadoPendente), garantir que está correto
    if (data.status === 'sucateadoPendente') {
      console.log("Verificando status especial 'sucateadoPendente'...");
      
      // Verificação extra para confirmar que o status foi realmente atualizado
      const { data: checkData, error: checkError } = await supabase
        .from('sectors')
        .select('current_status')
        .eq('id', sectorId)
        .single();
        
      if (checkError) {
        console.error("Erro ao verificar status:", checkError);
      } else if (checkData.current_status !== 'sucateadoPendente') {
        console.log(`Status atual é ${checkData.current_status}, forçando para sucateadoPendente...`);
        
        // Forçar atualização novamente
        const { error: forceError } = await supabase
          .from('sectors')
          .update({
            current_status: 'sucateadoPendente',
            updated_at: new Date().toISOString()
          })
          .eq('id', sectorId);
          
        if (forceError) {
          console.error("Erro ao forçar status:", forceError);
        }
      }
    }
    
    console.log("Status e metadados atualizados com sucesso");
    return true;
  } catch (error) {
    console.error(`Error updating sector ${sectorId} status:`, error);
    return false;
  }
}

/**
 * Prepare sector data for submission to the API
 */
export function prepareSectorData(
  data: Partial<Sector>,
  isEditing: boolean,
  sectorId: string | undefined,
  status: SectorStatus,
  processedPhotos: Photo[],
  cycleCount: number
): Partial<Sector> {
  // Garantir que a lista de scrapPhotos exista
  const scrapPhotos = data.scrapPhotos || [];
  
  // Separar as fotos por tipo
  const beforePhotos = processedPhotos.filter(p => p.type === 'before');
  const afterPhotos = processedPhotos.filter(p => p.type === 'after');
  const scrapProcessedPhotos = processedPhotos.filter(p => p.type === 'scrap');
  
  // Garantir que as fotos de sucateamento são preservadas
  const combinedScrapPhotos = [...scrapPhotos, ...scrapProcessedPhotos];
  
  return {
    ...data,
    id: isEditing ? sectorId : undefined,
    status,
    outcome: data.outcome || 'EmAndamento',
    cycleCount,
    productionCompleted: data.productionCompleted || false,
    beforePhotos,
    afterPhotos,
    scrapPhotos: combinedScrapPhotos,
    services: data.services?.map(service => ({
      ...service,
      // Ensure photos are provided
      photos: service.photos || []
    })) || [],
    updated_at: new Date().toISOString() // Always provide updated_at
  };
}

/**
 * Função para salvar fotos diretamente no Supabase com metadados adequados
 */
export async function savePhotosToSupabase(
  sectorId: string, 
  cycleId: string, 
  photos: Photo[], 
  stage: 'peritagem' | 'execucao' | 'checagem' | 'sucateamento' = 'peritagem'
): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error("Usuário não autenticado para salvar fotos");
      return false;
    }
    
    console.log(`Salvando ${photos.length} fotos para o setor ${sectorId} na etapa ${stage}`);
    
    for (const photo of photos) {
      // Verificar se a foto já existe
      const { data: existingPhoto } = await supabase
        .from('photos')
        .select('id')
        .eq('url', photo.url)
        .maybeSingle();
        
      if (existingPhoto) {
        console.log("Foto já existe:", photo.url);
        continue;
      }
      
      // Inserir foto com metadados completos
      const { error } = await supabase
        .from('photos')
        .insert({
          cycle_id: cycleId,
          service_id: photo.serviceId || null,
          url: photo.url,
          type: photo.type,
          created_by: user.id,
          metadata: {
            sector_id: sectorId,
            service_id: photo.serviceId,
            stage,
            type: photo.serviceId ? 'servico' : photo.type,
            created_at: new Date().toISOString()
          }
        });
        
      if (error) {
        console.error(`Erro ao salvar foto ${photo.id}:`, error);
      }
    }
    
    return true;
  } catch (error) {
    console.error("Erro ao salvar fotos no Supabase:", error);
    return false;
  }
}
