
import { Photo, Service, Sector, SectorStatus, CycleOutcome } from "@/types";
import { supabase } from "@/integrations/supabase/client";

/**
 * Interface para representar os serviços do ciclo no formato do banco de dados
 */
export interface CycleServiceDB {
  id: string;
  cycle_id: string;
  service_id: string;
  selected: boolean | null;
  quantity: number | null;
  observations: string | null;
  completed: boolean | null;
}

/**
 * Interface para representar ciclo no formato do banco de dados
 */
export interface CycleDB {
  id: string;
  sector_id: string;
  tag_number: string;
  entry_invoice: string;
  entry_date: string;
  peritagem_date: string | null;
  entry_observations: string | null;
  production_completed: boolean | null;
  exit_date: string | null;
  exit_invoice: string | null;
  checagem_date: string | null;
  exit_observations: string | null;
  scrap_observations: string | null;
  scrap_validated: boolean | null;
  scrap_return_date: string | null;
  scrap_return_invoice: string | null;
  status: string;
  outcome: string | null;
}

/**
 * Interface para representar fotos no formato do banco de dados
 */
export interface PhotoDB {
  id: string;
  cycle_id: string;
  service_id: string | null;
  url: string;
  type: string;
  metadata?: any;
}

/**
 * Interface para representar setores no formato do banco de dados
 */
export interface SectorDB {
  id: string;
  tag_number: string;
  tag_photo_url: string | null;
  cycle_count: number;
  current_status: string;
  current_outcome: string | null;
}

/**
 * Interface para representar serviços no formato do banco de dados
 */
export interface ServiceTypeDB {
  id: string;
  name: string;
  description: string | null;
}

/**
 * Converte um serviço do formato do banco para o formato da aplicação
 */
export const mapServiceFromDB = (
  serviceType: ServiceTypeDB, 
  cycleService?: CycleServiceDB,
  photos?: PhotoDB[]
): Service => {
  return {
    id: serviceType.id as any,
    name: serviceType.name,
    selected: cycleService?.selected || false,
    type: serviceType.id as any, // Add the type field using serviceType.id
    quantity: cycleService?.quantity || undefined,
    observations: cycleService?.observations || undefined,
    photos: photos?.map(mapPhotoFromDB) || []
  };
};

/**
 * Converte uma foto do formato do banco para o formato da aplicação
 */
export const mapPhotoFromDB = (photo: PhotoDB): Photo => {
  let photoType = photo.type;
  
  // Verifica se há metadata e se tem o campo type
  if (photo.metadata && typeof photo.metadata === 'object' && 'type' in photo.metadata) {
    // Se o type estiver no metadata, usa ele
    photoType = photo.metadata.type;
  }
  
  return {
    id: photo.id,
    url: photo.url,
    type: photoType as 'before' | 'after',
    serviceId: photo.service_id as any || undefined
  };
};

/**
 * Converte um setor com seu ciclo atual do formato do banco para o formato da aplicação
 */
export const mapSectorFromDB = (
  sector: SectorDB,
  cycle: CycleDB,
  services: Service[],
  beforePhotos: Photo[],
  afterPhotos: Photo[],
  scrapPhotos: Photo[]
): Sector => {
  return {
    id: sector.id,
    tagNumber: sector.tag_number,
    tagPhotoUrl: sector.tag_photo_url || undefined,
    entryInvoice: cycle.entry_invoice,
    entryDate: cycle.entry_date,
    peritagemDate: cycle.peritagem_date || '',
    services,
    beforePhotos,
    entryObservations: cycle.entry_observations || undefined,
    productionCompleted: cycle.production_completed || false,
    exitDate: cycle.exit_date || undefined,
    exitInvoice: cycle.exit_invoice || undefined,
    checagemDate: cycle.checagem_date || undefined,
    afterPhotos,
    exitObservations: cycle.exit_observations || undefined,
    scrapObservations: cycle.scrap_observations || undefined,
    scrapPhotos,
    scrapValidated: cycle.scrap_validated || false,
    scrapReturnDate: cycle.scrap_return_date || undefined,
    scrapReturnInvoice: cycle.scrap_return_invoice || undefined,
    status: cycle.status as SectorStatus,
    outcome: cycle.outcome as CycleOutcome || undefined,
    cycleCount: sector.cycle_count,
    previousCycles: undefined, // A ser implementado quando necessário
    updated_at: new Date().toISOString() // Adicionado para compatibilidade
  };
};
