import { supabase } from "@/integrations/supabase/client";
import { Sector, Service, Photo, CycleOutcome, SectorStatus, ServiceType } from "@/types";
import { toast } from "sonner";

/**
 * Interface para representar os serviços do ciclo no formato do banco de dados
 */
interface CycleServiceDB {
  id: string;
  cycle_id: string;
  service_id: string;
  selected: boolean;
  quantity: number | null;
  observations: string | null;
  completed: boolean | null;
}

/**
 * Interface para representar ciclo no formato do banco de dados
 */
interface CycleDB {
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
interface PhotoDB {
  id: string;
  cycle_id: string;
  service_id: string | null;
  url: string;
  type: string;
}

/**
 * Interface para representar setores no formato do banco de dados
 */
interface SectorDB {
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
interface ServiceTypeDB {
  id: string;
  name: string;
  description: string | null;
}

/**
 * Converte um serviço do formato do banco para o formato da aplicação
 */
const mapServiceFromDB = (
  serviceType: ServiceTypeDB, 
  cycleService?: CycleServiceDB,
  photos?: PhotoDB[]
): Service => {
  return {
    id: serviceType.id as any,
    name: serviceType.name,
    selected: cycleService?.selected || false,
    type: serviceType.id as ServiceType, // Add the type field using serviceType.id
    quantity: cycleService?.quantity || undefined,
    observations: cycleService?.observations || undefined,
    photos: photos?.map(mapPhotoFromDB) || []
  };
};

/**
 * Converte uma foto do formato do banco para o formato da aplicação
 */
const mapPhotoFromDB = (photo: PhotoDB): Photo => {
  return {
    id: photo.id,
    url: photo.url,
    type: photo.type as 'before' | 'after',
    serviceId: photo.service_id as any || undefined
  };
};

/**
 * Converte um setor com seu ciclo atual do formato do banco para o formato da aplicação
 */
const mapSectorFromDB = (
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

/**
 * Serviço para operações com o Supabase
 */
export const supabaseService = {
  /**
   * Busca todos os setores
   */
  getAllSectors: async (): Promise<Sector[]> => {
    try {
      console.log("Iniciando busca de todos os setores");
      
      // 1. Busca todos os setores
      const { data: sectorsData, error: sectorsError } = await supabase
        .from('sectors')
        .select('*')
        .order('tag_number');

      if (sectorsError) {
        console.error("Erro ao buscar setores:", sectorsError);
        throw sectorsError;
      }
      
      console.log(`Encontrados ${sectorsData?.length || 0} setores no banco de dados`);
      console.log("Status dos setores encontrados:", sectorsData?.map(s => s.current_status));
      
      // 2. Para cada setor, busca seu ciclo atual
      const sectors: Sector[] = [];
      
      for (const sector of sectorsData || []) {
        console.log(`Buscando ciclo para o setor ${sector.id} (TAG: ${sector.tag_number}, Status: ${sector.current_status})`);
        
        try {
          // Verifica o status atual do setor
          console.log(`Status atual do setor ${sector.tag_number}: ${sector.current_status}`);
          
          const { data: cyclesData, error: cyclesError } = await supabase
            .from('cycles')
            .select('*')
            .eq('sector_id', sector.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();
            
          if (cyclesError) {
            console.error(`Erro ao buscar ciclo para o setor ${sector.id}:`, cyclesError);
            // Em vez de pular este setor, vamos tentar criar um ciclo básico
            console.log("Buscando todos os ciclos para este setor para diagnóstico...");
            
            const { data: allCycles } = await supabase
              .from('cycles')
              .select('*')
              .eq('sector_id', sector.id);
              
            console.log(`Ciclos encontrados para o setor ${sector.id}:`, allCycles?.length || 0);
            
            // Tentar criar um setor mínimo com base nos dados da tabela sectors
            if (sector.current_status === 'peritagemPendente' || sector.current_status === 'emExecucao') {
              console.log(`Criando setor mínimo para ${sector.tag_number} com status ${sector.current_status}`);
              
              // Cria um setor básico com status do banco
              const minimalSector: Sector = {
                id: sector.id,
                tagNumber: sector.tag_number,
                tagPhotoUrl: sector.tag_photo_url || undefined,
                entryInvoice: "Pendente",
                entryDate: new Date().toISOString().split('T')[0],
                peritagemDate: "",
                services: [],
                beforePhotos: [],
                afterPhotos: [],
                productionCompleted: false,
                status: sector.current_status as SectorStatus,
                outcome: sector.current_outcome as CycleOutcome || 'EmAndamento',
                cycleCount: sector.cycle_count,
                updated_at: sector.updated_at
              };
              
              console.log(`Adicionando setor mínimo à lista: ${sector.tag_number} com status ${minimalSector.status}`);
              sectors.push(minimalSector);
            }
            
            // Continua para o próximo setor
            continue;
          }
          
          console.log(`Ciclo encontrado para o setor ${sector.id}:`, cyclesData.id);
          console.log(`Status do ciclo: ${cyclesData.status}`);
          
          // 3. Busca os serviços associados ao ciclo
          const { data: serviceTypesData } = await supabase
            .from('service_types')
            .select('*');
            
          const { data: cycleServicesData } = await supabase
            .from('cycle_services')
            .select('*')
            .eq('cycle_id', cyclesData.id);
            
          // 4. Busca as fotos associadas ao ciclo
          const { data: photosData } = await supabase
            .from('photos')
            .select('*')
            .eq('cycle_id', cyclesData.id);
            
          const beforePhotos = (photosData || [])
            .filter(photo => photo.type === 'before')
            .map(mapPhotoFromDB);
            
          const afterPhotos = (photosData || [])
            .filter(photo => photo.type === 'after')
            .map(mapPhotoFromDB);
            
          const scrapPhotos = (photosData || [])
            .filter(photo => photo.type === 'scrap')
            .map(mapPhotoFromDB);
            
          // Busca foto da TAG com metadata
          const tagPhoto = (photosData || [])
            .find(photo => photo.type === 'tag' || 
                  (photo.metadata && photo.metadata.type === 'tag'));
          
          // 5. Monta os serviços com suas fotos
          const services = (serviceTypesData || []).map(serviceType => {
            const cycleService = (cycleServicesData || []).find(
              cs => cs.service_id === serviceType.id
            );
            
            const servicePhotos = (photosData || []).filter(
              photo => photo.service_id === serviceType.id
            );
            
            return mapServiceFromDB(serviceType, cycleService, servicePhotos);
          });
          
          // 6. Adiciona o setor completo à lista
          const mappedSector = mapSectorFromDB(
            sector, 
            cyclesData, 
            services, 
            beforePhotos, 
            afterPhotos, 
            scrapPhotos
          );
          
          // Adiciona a foto da TAG se encontrada
          if (tagPhoto) {
            mappedSector.tagPhotoUrl = tagPhoto.url;
          }
          
          console.log(`Setor ${sector.id} adicionado à lista com status: ${mappedSector.status}`);
          sectors.push(mappedSector);
        } catch (error) {
          console.error(`Erro ao processar o setor ${sector.id}:`, error);
        }
      }
      
      console.log(`Retornando ${sectors.length} setores processados`);
      console.log("Setores por status:", sectors.reduce((acc, sector) => {
        acc[sector.status] = (acc[sector.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>));
      
      return sectors;
    } catch (error) {
      console.error("Erro ao buscar setores:", error);
      throw error;
    }
  },
  
  /**
   * Busca um setor pelo ID
   */
  getSectorById: async (id: string): Promise<Sector | undefined> => {
    try {
      // 1. Busca o setor
      const { data: sectorData, error: sectorError } = await supabase
        .from('sectors')
        .select('*')
        .eq('id', id)
        .single();
        
      if (sectorError) throw sectorError;
      
      // 2. Busca o ciclo atual
      const { data: cycleData, error: cycleError } = await supabase
        .from('cycles')
        .select('*')
        .eq('sector_id', id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
        
      if (cycleError) throw cycleError;
      
      // 3. Busca os serviços
      const { data: serviceTypesData } = await supabase
        .from('service_types')
        .select('*');
        
      const { data: cycleServicesData } = await supabase
        .from('cycle_services')
        .select('*')
        .eq('cycle_id', cycleData.id);
        
      // 4. Busca as fotos
      const { data: photosData } = await supabase
        .from('photos')
        .select('*')
        .eq('cycle_id', cycleData.id);
        
      const beforePhotos = (photosData || [])
        .filter(photo => photo.type === 'before')
        .map(mapPhotoFromDB);
        
      const afterPhotos = (photosData || [])
        .filter(photo => photo.type === 'after')
        .map(mapPhotoFromDB);
        
      const scrapPhotos = (photosData || [])
        .filter(photo => photo.type === 'scrap')
        .map(mapPhotoFromDB);
      
      // 5. Monta os serviços
      const services = (serviceTypesData || []).map(serviceType => {
        const cycleService = (cycleServicesData || []).find(
          cs => cs.service_id === serviceType.id
        );
        
        const servicePhotos = (photosData || []).filter(
          photo => photo.service_id === serviceType.id
        );
        
        return mapServiceFromDB(serviceType, cycleService, servicePhotos);
      });
      
      // 6. Retorna o setor completo
      return mapSectorFromDB(
        sectorData, 
        cycleData, 
        services, 
        beforePhotos, 
        afterPhotos, 
        scrapPhotos
      );
    } catch (error) {
      console.error(`Erro ao buscar setor com ID ${id}:`, error);
      return undefined;
    }
  },
  
  /**
   * Busca setores pela TAG
   */
  getSectorsByTag: async (tagNumber: string): Promise<Sector[]> => {
    try {
      // 1. Busca os setores com a TAG especificada
      const { data: sectorsData, error: sectorsError } = await supabase
        .from('sectors')
        .select('*')
        .ilike('tag_number', `%${tagNumber}%`);
        
      if (sectorsError) throw sectorsError;
      
      // 2. Para cada setor, busca seu ciclo completo
      const sectors: Sector[] = [];
      
      for (const sector of sectorsData || []) {
        const { data: cycleData, error: cycleError } = await supabase
          .from('cycles')
          .select('*')
          .eq('sector_id', sector.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
          
        if (cycleError) {
          console.error(`Erro ao buscar ciclo para o setor ${sector.id}:`, cycleError);
          continue;
        }
        
        // 3. Busca os serviços e fotos
        const { data: serviceTypesData } = await supabase
          .from('service_types')
          .select('*');
          
        const { data: cycleServicesData } = await supabase
          .from('cycle_services')
          .select('*')
          .eq('cycle_id', cycleData.id);
          
        const { data: photosData } = await supabase
          .from('photos')
          .select('*')
          .eq('cycle_id', cycleData.id);
          
        // 4. Organiza as fotos
        const beforePhotos = (photosData || [])
          .filter(photo => photo.type === 'before')
          .map(mapPhotoFromDB);
          
        const afterPhotos = (photosData || [])
          .filter(photo => photo.type === 'after')
          .map(mapPhotoFromDB);
          
        const scrapPhotos = (photosData || [])
          .filter(photo => photo.type === 'scrap')
          .map(mapPhotoFromDB);
        
        // 5. Monta os serviços
        const services = (serviceTypesData || []).map(serviceType => {
          const cycleService = (cycleServicesData || []).find(
            cs => cs.service_id === serviceType.id
          );
          
          const servicePhotos = (photosData || []).filter(
            photo => photo.service_id === serviceType.id
          );
          
          return mapServiceFromDB(serviceType, cycleService, servicePhotos);
        });
        
        // 6. Adiciona o setor à lista
        sectors.push(
          mapSectorFromDB(
            sector, 
            cycleData, 
            services, 
            beforePhotos, 
            afterPhotos, 
            scrapPhotos
          )
        );
      }
      
      return sectors;
    } catch (error) {
      console.error(`Erro ao buscar setores com TAG ${tagNumber}:`, error);
      return [];
    }
  },
  
  /**
   * Cria um novo setor
   */
  addSector: async (sectorData: Omit<Sector, 'id'>): Promise<Sector> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');
      
      console.log("Adicionando novo setor:", sectorData.tagNumber);
      
      // 1. Insere o setor
      const { data: newSector, error: sectorError } = await supabase
        .from('sectors')
        .insert({
          tag_number: sectorData.tagNumber,
          tag_photo_url: sectorData.tagPhotoUrl,
          current_status: sectorData.status,
          current_outcome: sectorData.outcome || 'EmAndamento',
          created_by: user.id,
          updated_by: user.id,
          updated_at: new Date().toISOString() // Adicionar updated_at explicitamente
        })
        .select()
        .single();
        
      if (sectorError) {
        console.error("Erro ao inserir setor:", sectorError);
        throw sectorError;
      }
      
      console.log("Setor inserido com sucesso:", newSector.id);
      
      // 2. Insere o ciclo
      const { data: newCycle, error: cycleError } = await supabase
        .from('cycles')
        .insert({
          sector_id: newSector.id,
          tag_number: sectorData.tagNumber,
          entry_invoice: sectorData.entryInvoice,
          entry_date: sectorData.entryDate,
          peritagem_date: sectorData.peritagemDate || null,
          entry_observations: sectorData.entryObservations || null,
          production_completed: sectorData.productionCompleted || false,
          exit_date: sectorData.exitDate || null,
          exit_invoice: sectorData.exitInvoice || null,
          checagem_date: sectorData.checagemDate || null,
          exit_observations: sectorData.exitObservations || null,
          scrap_observations: sectorData.scrapObservations || null,
          scrap_validated: sectorData.scrapValidated || false,
          scrap_return_date: sectorData.scrapReturnDate || null,
          scrap_return_invoice: sectorData.scrapReturnInvoice || null,
          status: sectorData.status,
          outcome: sectorData.outcome || 'EmAndamento',
          created_by: user.id,
          updated_by: user.id,
          updated_at: new Date().toISOString() // Adicionar updated_at explicitamente
        })
        .select()
        .single();
        
      if (cycleError) {
        console.error("Erro ao inserir ciclo:", cycleError);
        
        // Remover o setor criado para não deixar órfão
        await supabase.from('sectors').delete().eq('id', newSector.id);
        
        throw cycleError;
      }
      
      console.log("Ciclo inserido com sucesso:", newCycle.id);
      
      // 3. Insere os serviços selecionados
      const selectedServices = sectorData.services.filter(service => service.selected);
      console.log("Serviços selecionados:", selectedServices.length);
      
      // Inserir em cycle_services e sector_services
      try {
        for (const service of selectedServices) {
          // Inserir em cycle_services
          const { error: serviceError } = await supabase
            .from('cycle_services')
            .insert({
              cycle_id: newCycle.id,
              service_id: service.id,
              selected: true,
              quantity: service.quantity || 1,
              observations: service.observations || null,
              completed: false
            });
            
          if (serviceError) {
            console.error(`Erro ao inserir serviço ${service.id} em cycle_services:`, serviceError);
          }
          
          // Inserir em sector_services
          const { error: sectorServiceError } = await supabase
            .from('sector_services')
            .insert({
              sector_id: newSector.id,
              service_id: service.id,
              quantity: service.quantity || 1,
              stage: 'peritagem',
              selected: true
            });
            
          if (sectorServiceError) {
            console.error(`Erro ao inserir serviço ${service.id} em sector_services:`, sectorServiceError);
          }
        }
      } catch (servicesError) {
        console.error("Erro ao inserir serviços:", servicesError);
      }
      
      // 4. Insere as fotos (se houver)
      if (sectorData.beforePhotos && sectorData.beforePhotos.length > 0) {
        try {
          for (const photo of sectorData.beforePhotos) {
            const { error: photoError } = await supabase
              .from('photos')
              .insert({
                cycle_id: newCycle.id,
                service_id: photo.serviceId || null,
                url: photo.url,
                type: 'before',
                created_by: user.id,
                metadata: {
                  sector_id: newSector.id,
                  type: 'before',
                  stage: 'peritagem',
                  service_id: photo.serviceId
                }
              });
              
            if (photoError) {
              console.error('Erro ao inserir foto:', photoError);
            }
          }
        } catch (photosError) {
          console.error("Erro ao inserir fotos:", photosError);
        }
      }
      
      // 5. Insere a foto do TAG com metadados
      if (sectorData.tagPhotoUrl) {
        try {
          const { error: tagPhotoError } = await supabase
            .from('photos')
            .insert({
              cycle_id: newCycle.id,
              service_id: null,
              url: sectorData.tagPhotoUrl,
              type: 'tag',
              created_by: user.id,
              metadata: {
                sector_id: newSector.id,
                type: 'tag',
                stage: 'peritagem'
              }
            });
            
          if (tagPhotoError) {
            console.error('Erro ao inserir foto da TAG:', tagPhotoError);
          } else {
            console.log("Foto da TAG inserida com sucesso");
          }
        } catch (tagPhotoError) {
          console.error("Erro ao inserir foto da TAG:", tagPhotoError);
        }
      }
      
      // 6. Retorna o setor criado
      return {
        ...sectorData,
        id: newSector.id,
        cycleCount: 1
      } as Sector;
    } catch (error) {
      console.error("Erro ao adicionar setor:", error);
      throw error;
    }
  },
  
  /**
   * Atualiza um setor existente
   */
  updateSector: async (sectorData: Sector): Promise<Sector> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');
      
      // 1. Busca o ciclo atual do setor
      const { data: cycleData, error: cycleError } = await supabase
        .from('cycles')
        .select('*')
        .eq('sector_id', sectorData.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
        
      if (cycleError) throw cycleError;
      
      // 2. Atualiza o setor
      const { error: sectorError } = await supabase
        .from('sectors')
        .update({
          tag_number: sectorData.tagNumber,
          tag_photo_url: sectorData.tagPhotoUrl,
          current_status: sectorData.status,
          current_outcome: sectorData.outcome || 'EmAndamento',
          updated_by: user.id,
          updated_at: new Date().toISOString() // Adicionar updated_at explicitamente
        })
        .eq('id', sectorData.id);
        
      if (sectorError) {
        console.error("Erro ao atualizar setor:", sectorError);
        throw sectorError;
      }
      
      // 3. Atualiza o ciclo
      const { error: updateCycleError } = await supabase
        .from('cycles')
        .update({
          tag_number: sectorData.tagNumber,
          entry_invoice: sectorData.entryInvoice,
          entry_date: sectorData.entryDate,
          peritagem_date: sectorData.peritagemDate || null,
          entry_observations: sectorData.entryObservations || null,
          production_completed: sectorData.productionCompleted || false,
          exit_date: sectorData.exitDate || null,
          exit_invoice: sectorData.exitInvoice || null,
          checagem_date: sectorData.checagemDate || null,
          exit_observations: sectorData.exitObservations || null,
          scrap_observations: sectorData.scrapObservations || null,
          scrap_validated: sectorData.scrapValidated || false,
          scrap_return_date: sectorData.scrapReturnDate || null,
          scrap_return_invoice: sectorData.scrapReturnInvoice || null,
          status: sectorData.status,
          outcome: sectorData.outcome || 'EmAndamento',
          updated_by: user.id,
          updated_at: new Date().toISOString() // Adicionar updated_at explicitamente
        })
        .eq('id', cycleData.id);
        
      if (updateCycleError) {
        console.error("Erro ao atualizar ciclo:", updateCycleError);
        throw updateCycleError;
      }
      
      // 4. Atualiza os serviços do ciclo
      // 4.1 Limpa os serviços existentes
      await supabase
        .from('cycle_services')
        .delete()
        .eq('cycle_id', cycleData.id);
        
      // Também limpa os serviços do setor
      await supabase
        .from('sector_services')
        .delete()
        .eq('sector_id', sectorData.id);
        
      // 4.2 Insere os serviços atualizados
      const selectedServices = sectorData.services.filter(service => service.selected);
      
      for (const service of selectedServices) {
        try {
          // Adiciona em cycle_services
          const { error: serviceError } = await supabase
            .from('cycle_services')
            .insert({
              cycle_id: cycleData.id,
              service_id: service.id,
              selected: true,
              quantity: service.quantity || 1,
              observations: service.observations || null,
              completed: false
            });
            
          if (serviceError) {
            console.error(`Erro ao atualizar serviço ${service.id} em cycle_services:`, serviceError);
          }
          
          // Adiciona em sector_services
          const { error: sectorServiceError } = await supabase
            .from('sector_services')
            .insert({
              sector_id: sectorData.id,
              service_id: service.id,
              quantity: service.quantity || 1,
              stage: 'peritagem',
              selected: true
            });
            
          if (sectorServiceError) {
            console.error(`Erro ao atualizar serviço ${service.id} em sector_services:`, sectorServiceError);
          }
        } catch (serviceError) {
          console.error(`Erro ao processar serviço ${service.id}:`, serviceError);
        }
      }
      
      // 5. Atualiza fotos se novas foram adicionadas
      if (sectorData.afterPhotos && sectorData.afterPhotos.length > 0) {
        // Busca fotos existentes para não duplicar
        const { data: existingPhotos } = await supabase
          .from('photos')
          .select('url')
          .eq('cycle_id', cycleData.id)
          .eq('type', 'after');
          
        const existingUrls = (existingPhotos || []).map(p => p.url);
        
        // Adiciona apenas fotos novas
        for (const photo of sectorData.afterPhotos) {
          if (!existingUrls.includes(photo.url)) {
            const { error: photoError } = await supabase
              .from('photos')
              .insert({
                cycle_id: cycleData.id,
                service_id: photo.serviceId || null,
                url: photo.url,
                type: 'after',
                created_by: user.id,
                metadata: {
                  sector_id: sectorData.id,
                  type: 'after',
                  stage: 'checagem'
                }
              });
              
            if (photoError) {
              console.error('Erro ao inserir foto após:', photoError);
            }
          }
        }
      }
      
      if (sectorData.scrapPhotos && sectorData.scrapPhotos.length > 0) {
        // Busca fotos existentes para não duplicar
        const { data: existingPhotos } = await supabase
          .from('photos')
          .select('url')
          .eq('cycle_id', cycleData.id)
          .eq('type', 'scrap');
          
        const existingUrls = (existingPhotos || []).map(p => p.url);
        
        // Adiciona apenas fotos novas
        for (const photo of sectorData.scrapPhotos) {
          if (!existingUrls.includes(photo.url)) {
            const { error: photoError } = await supabase
              .from('photos')
              .insert({
                cycle_id: cycleData.id,
                service_id: photo.serviceId || null,
                url: photo.url,
                type: 'scrap',
                created_by: user.id,
                metadata: {
                  sector_id: sectorData.id,
                  type: 'scrap',
                  stage: 'sucateamento'
                }
              });
              
            if (photoError) {
              console.error('Erro ao inserir foto de sucata:', photoError);
            }
          }
        }
      }
      
      // 6. Retorna o setor atualizado
      return await supabaseService.getSectorById(sectorData.id) as Sector;
    } catch (error) {
      console.error(`Erro ao atualizar setor ${sectorData.id}:`, error);
      throw error;
    }
  },
  
  /**
   * Remove um setor
   */
  deleteSector: async (id: string): Promise<void> => {
    try {
      // Como temos ON DELETE CASCADE nas relações, 
      // basta excluir o setor para remover todos os dados relacionados
      const { error } = await supabase
        .from('sectors')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
    } catch (error) {
      console.error(`Erro ao excluir setor ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Busca os serviços disponíveis
   */
  getServiceTypes: async (): Promise<Service[]> => {
    try {
      const { data, error } = await supabase
        .from('service_types')
        .select('*')
        .order('name');
        
      if (error) throw error;
      
      return (data || []).map(serviceType => ({
        id: serviceType.id as any,
        name: serviceType.name,
        selected: false,
        type: serviceType.id as ServiceType // Add the type field
      }));
    } catch (error) {
      console.error('Erro ao buscar tipos de serviços:', error);
      throw error;
    }
  },
  
  /**
   * Faz upload de uma foto para o bucket do Storage
   */
  uploadPhoto: async (file: File, folder: string = 'general'): Promise<string> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${folder}/${Date.now()}.${fileExt}`;
      
      const { error } = await supabase.storage
        .from('sector_photos')
        .upload(fileName, file);
        
      if (error) throw error;
      
      const { data } = supabase.storage
        .from('sector_photos')
        .getPublicUrl(fileName);
        
      return data.publicUrl;
    } catch (error) {
      console.error('Erro ao fazer upload de foto:', error);
      throw error;
    }
  }
};
