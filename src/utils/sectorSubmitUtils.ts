
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
              serviceId: service.id
            });
          } catch (error) {
            console.error(`Error uploading photo for service ${service.id}:`, error);
          }
        } else if (photo.url) {
          // Photo already has a URL, just add it to the list
          processedPhotos.push({
            id: photo.id,
            url: photo.url,
            type: photo.type,
            serviceId: service.id
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
      throw cycleError;
    }
    
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
  return {
    ...data,
    id: isEditing ? sectorId : undefined,
    status,
    outcome: data.outcome || 'EmAndamento',
    cycleCount,
    productionCompleted: data.productionCompleted || false,
    beforePhotos: processedPhotos.filter(p => p.type === 'before'),
    afterPhotos: processedPhotos.filter(p => p.type === 'after'),
    scrapPhotos: processedPhotos.filter(p => p.type === 'scrap'),
    services: data.services?.map(service => ({
      ...service,
      // Ensure photos are provided
      photos: service.photos || []
    })) || [],
    updated_at: new Date().toISOString() // Always provide updated_at
  };
}
