import { Sector, Photo, Service, SectorStatus } from "@/types";
import { v4 as uuidv4 } from 'uuid';
import { supabase } from "@/integrations/supabase/client";

/**
 * Processes photos from services, uploading them and returning the URLs
 * @param services The services to process
 * @param uploadPhoto The function to upload the photo
 * @returns An array of processed photo URLs
 */
export const processServicePhotos = async (services: Service[], uploadPhoto: (file: File, folder?: string) => Promise<string>): Promise<string[]> => {
  const photoUrls: string[] = [];

  for (const service of services) {
    if (service.photos) {
      for (const photo of service.photos) {
        if (typeof photo === 'object' && photo.file) {
          try {
            const url = await uploadPhoto(photo.file, 'service-photos');
            photoUrls.push(url);
          } catch (uploadError) {
            console.error("Error uploading photo:", uploadError);
            throw uploadError;
          }
        }
      }
    }
  }

  return photoUrls;
};

/**
 * Updates the status and metadata of a sector in Supabase
 * @param sectorId The ID of the sector to update
 * @param data The sector data to update
 */
export const updateSectorStatusAndMetadata = async (sectorId: string, data: Partial<Sector>): Promise<void> => {
  try {
    console.log(`Atualizando status do setor ${sectorId} para 'emExecucao'`);
    
    // Obter dados da sessão para registrar quem fez a alteração
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      console.warn("Sem sessão de usuário ao atualizar status");
      return;
    }
    
    // Atualizar o setor diretamente no Supabase
    const { error } = await supabase
      .from('sectors')
      .update({
        current_status: 'emExecucao' as SectorStatus,
        updated_by: session.user.id,
        updated_at: new Date().toISOString(),
        // Adicionar campos extras se existirem
        nf_entrada: data.entryInvoice || data.nf_entrada, // Usar ambas as fontes
        data_entrada: data.entryDate ? new Date(data.entryDate).toISOString() : new Date().toISOString()
      })
      .eq('id', sectorId);
      
    if (error) {
      console.error("Erro ao atualizar status do setor:", error);
      throw error;
    }
    
    console.log(`Status do setor ${sectorId} atualizado com sucesso para 'emExecucao'`);
  } catch (error) {
    console.error("Erro ao atualizar status do setor:", error);
    throw error;
  }
};

/**
 * Prepares sector data for submission, ensuring required fields are present
 * @param data The sector data to prepare
 * @param isEditing Whether this is an edit or a new sector
 * @param sectorId The ID of the sector (for editing)
 * @param status The status of the sector
 * @param processedPhotos The processed photo URLs
 * @param cycleCount The cycle count for the sector
 * @returns The prepared sector data
 */
export const prepareSectorData = (
  data: Partial<Sector>, 
  isEditing: boolean, 
  sectorId: string | undefined, 
  status: string, 
  processedPhotos: string[],
  cycleCount: number
): Partial<Sector> => {
  const now = new Date().toISOString();

  // Ensure the invoice fields are set correctly
  const invoiceNumber = data.entryInvoice || '';

  const sectorData: Partial<Sector> = {
    tagNumber: data.tagNumber || '',
    entryInvoice: invoiceNumber,
    entryDate: data.entryDate || now,
    peritagemDate: data.peritagemDate || now,
    services: data.services || [],
    beforePhotos: data.beforePhotos || [],
    afterPhotos: data.afterPhotos || [],
    productionCompleted: data.productionCompleted || false,
    status: status as SectorStatus,
    outcome: data.outcome || 'EmAndamento',
    cycleCount: cycleCount,
    tagPhotoUrl: data.tagPhotoUrl,
    entryObservations: data.entryObservations,
    updated_at: now,
    nf_entrada: invoiceNumber, // Explicitly set nf_entrada to match entryInvoice
    data_entrada: data.entryDate ? new Date(data.entryDate).toISOString() : new Date().toISOString()
  };

  if (isEditing && sectorId) {
    sectorData.id = sectorId;
  }

  return sectorData;
};
