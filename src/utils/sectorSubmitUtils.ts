import { Sector, Photo, PhotoWithFile, SectorStatus, CycleOutcome, Service } from "@/types";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Processes photo uploads from services
 * @param services Services with photos to process
 * @param uploadPhotoFn Function to upload a photo
 * @returns Processed photos array
 */
export const processServicePhotos = async (
  services: Service[],
  uploadPhotoFn: (file: File, folder: string) => Promise<string>
): Promise<Photo[]> => {
  const processedPhotos: Photo[] = [];
  
  for (const service of services) {
    if (service.selected && service.photos && service.photos.length > 0) {
      for (const photo of service.photos) {
        // Ensure we have a valid photo object
        if (photo) {
          if ('file' in photo && photo.file instanceof File) {
            try {
              // Upload photo and get URL
              const photoWithFile = photo as PhotoWithFile;
              const photoUrl = await uploadPhotoFn(photoWithFile.file, 'before');
              
              // Create simple Photo object without file property
              const processedPhoto: Photo = {
                id: photo.id || `${service.id}-${Date.now()}`,
                url: photoUrl,
                type: 'before',
                serviceId: service.id
              };
              
              processedPhotos.push(processedPhoto);
            } catch (uploadError) {
              console.error('Photo Upload Error:', uploadError);
              throw new Error(`Erro ao fazer upload de foto: ${uploadError instanceof Error ? uploadError.message : 'Erro desconhecido'}`);
            }
          } else if (photo.url) {
            // If photo already has URL, add it as is (ensuring it doesn't have file)
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
  }
  
  return processedPhotos;
};

/**
 * Updates the sector status in Supabase and saves associated metadata
 * @param sectorId Sector ID to update
 * @param sectorResult The sector result from the save operation
 * @param data Partial sector data
 */
export const updateSectorStatusAndMetadata = async (
  sectorId: string, 
  data: Partial<Sector>
): Promise<void> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || !session.user) {
      throw new Error("Usuário não autenticado");
    }

    console.log("Atualizando status do setor para emExecucao:", sectorId);
    
    // 1. Update sector status
    const { error: updateStatusError } = await supabase
      .from('sectors')
      .update({ 
        current_status: 'emExecucao',
        updated_at: new Date().toISOString()
      })
      .eq('id', sectorId);
      
    if (updateStatusError) {
      console.error("Erro ao atualizar status do setor:", updateStatusError);
    } else {
      console.log("Status do setor atualizado com sucesso para emExecucao");
    }
    
    // 2. Save TAG photo correctly with metadata
    if (data.tagPhotoUrl) {
      // Use correct schema for photos table - adding cycle_id is required
      const { data: cycleData } = await supabase
        .from('cycles')
        .select('id')
        .eq('sector_id', sectorId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
        
      if (cycleData) {
        const { error: tagPhotoError } = await supabase
          .from('photos')
          .insert({
            cycle_id: cycleData.id,
            type: 'tag',
            url: data.tagPhotoUrl,
            service_id: null,
            created_by: session.user.id,
            created_at: new Date().toISOString(),
            metadata: {
              sector_id: sectorId,
              type: 'tag',
              stage: 'peritagem'
            }
          });
          
        if (tagPhotoError) {
          console.error("Erro ao salvar foto da TAG:", tagPhotoError);
        } else {
          console.log("Foto da TAG salva com sucesso com metadata");
        }
      }
    }
    
    // 3. Save selected services in cycle_services and sector_services
    await saveServicesToCycleAndSector(sectorId, data, session.user.id);
    
  } catch (statusUpdateError) {
    console.error("Erro ao tentar atualizar status:", statusUpdateError);
    // No need to interrupt the flow because of this secondary update
  }
};

/**
 * Saves services to both cycle_services and sector_services tables
 * @param sectorId Sector ID
 * @param data Sector data with services
 * @param userId User ID for created_by field
 */
export const saveServicesToCycleAndSector = async (
  sectorId: string,
  data: Partial<Sector>,
  userId: string
): Promise<void> => {
  try {
    const selectedServices = data.services?.filter(service => service.selected) || [];
    
    if (selectedServices.length === 0) {
      return;
    }
    
    const { data: cycleData } = await supabase
      .from('cycles')
      .select('id')
      .eq('sector_id', sectorId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
      
    if (cycleData) {
      // First delete existing services for this cycle
      const { error: deleteError } = await supabase
        .from('cycle_services')
        .delete()
        .eq('cycle_id', cycleData.id);
        
      if (deleteError) {
        console.error("Erro ao deletar serviços antigos:", deleteError);
      }
      
      // Now insert the updated services in cycle_services
      if (selectedServices.length > 0) {
        const { error: servicesError } = await supabase
          .from('cycle_services')
          .insert(
            selectedServices.map(service => ({
              cycle_id: cycleData.id,
              service_id: service.id,
              quantity: service.quantity || 1,
              observations: service.observations || "",
              selected: true,
              completed: false
            }))
          );
          
        if (servicesError) {
          console.error("Erro ao salvar serviços do ciclo:", servicesError);
        } else {
          console.log(`${selectedServices.length} serviços salvos com sucesso em cycle_services`);
        }
        
        // Also insert services in sector_services for better queries
        const { error: sectorServicesError } = await supabase
          .from('sector_services')
          .insert(
            selectedServices.map(service => ({
              sector_id: sectorId,
              service_id: service.id,
              quantity: service.quantity || 1,
              stage: 'peritagem',
              selected: true
            }))
          );
          
        if (sectorServicesError) {
          console.error("Erro ao salvar serviços no setor:", sectorServicesError);
        } else {
          console.log(`${selectedServices.length} serviços salvos com sucesso em sector_services`);
        }
      }
    }
  } catch (servicesError) {
    console.error("Erro ao tentar salvar serviços:", servicesError);
  }
};

/**
 * Prepares sector data for submission
 * @param data Partial sector data
 * @param isEditing If true, we're editing an existing sector
 * @param sectorId Optional sector ID for editing
 * @param status Status to set for the sector
 * @param processedPhotos Processed photos to include
 * @param cycleCount Cycle count to use
 * @returns Prepared sector data object
 */
export const prepareSectorData = (
  data: Partial<Sector>,
  isEditing: boolean,
  sectorId: string | undefined,
  status: SectorStatus,
  processedPhotos: Photo[],
  cycleCount: number
): Partial<Sector> => {
  const outcome: CycleOutcome = (data.outcome as CycleOutcome) || 'EmAndamento';
  
  return {
    tagNumber: data.tagNumber,
    tagPhotoUrl: data.tagPhotoUrl,
    entryInvoice: data.entryInvoice,
    entryDate: data.entryDate || format(new Date(), 'yyyy-MM-dd'),
    peritagemDate: format(new Date(), 'yyyy-MM-dd'),
    services: data.services || [],
    status: status,
    outcome: outcome,
    beforePhotos: processedPhotos,
    afterPhotos: [],
    productionCompleted: data.productionCompleted || false,
    cycleCount: cycleCount,
    entryObservations: data.entryObservations || '',
    updated_at: new Date().toISOString() // Using updated_at instead of modified_at
  };
};
