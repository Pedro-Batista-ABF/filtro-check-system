
import { supabase } from '@/integrations/supabase/client';
import { Sector, Service, SectorStatus } from '@/types';

/**
 * Obter setor pelo ID com serviços e fotos
 */
export const getSectorById = async (sectorId: string): Promise<Sector | null> => {
  try {
    // Buscar o setor
    const { data: sector, error } = await supabase
      .from('sectors')
      .select('*')
      .eq('id', sectorId)
      .single();
      
    if (error) {
      console.error('Erro ao buscar setor:', error);
      return null;
    }
    
    if (!sector) {
      console.error('Setor não encontrado:', sectorId);
      return null;
    }
    
    // Buscar serviços do setor
    const { data: sectorServices, error: servicesError } = await supabase
      .from('sector_services')
      .select('*')
      .eq('sector_id', sectorId);
      
    if (servicesError) {
      console.error('Erro ao buscar serviços do setor:', servicesError);
    }
    
    // Mapear serviços
    const services: Service[] = [];
    
    if (sectorServices && sectorServices.length > 0) {
      // Buscar todos os tipos de serviço
      const { data: serviceTypes } = await supabase
        .from('service_types')
        .select('*');
        
      const serviceTypesMap = new Map();
      if (serviceTypes) {
        serviceTypes.forEach(type => {
          serviceTypesMap.set(type.id, type);
        });
      }
      
      // Para cada serviço, buscar suas fotos
      for (const sectorService of sectorServices) {
        const serviceType = serviceTypesMap.get(sectorService.service_id);
        
        if (serviceType) {
          // Buscar fotos do serviço
          const { data: photos } = await supabase
            .from('photos')
            .select('*')
            .eq('service_id', sectorService.service_id)
            .eq('cycle_id', sector.cycle_id);
          
          services.push({
            id: serviceType.id,
            name: serviceType.name,
            description: serviceType.description,
            selected: sectorService.selected,
            quantity: sectorService.quantity || 1,
            observations: sectorService.observations,
            photos: photos || [],
            completed: sectorService.completed,
          });
        }
      }
    }
    
    return {
      id: sector.id,
      tagNumber: sector.tag_number,
      tagPhotoUrl: sector.tag_photo_url,
      entryInvoice: sector.nf_entrada,
      entryDate: sector.data_entrada,
      services,
      status: sector.current_status as SectorStatus,
      outcome: sector.current_outcome,
      cycleCount: sector.cycle_count,
      updated_at: sector.updated_at
    };
  } catch (error) {
    console.error('Erro ao obter setor por ID:', error);
    return null;
  }
};

/**
 * Obter setores pelo status
 */
export const getSectorsByStatus = async (status: SectorStatus): Promise<Sector[]> => {
  try {
    const { data: sectors, error } = await supabase
      .from('sectors')
      .select('*')
      .eq('current_status', status);
      
    if (error) {
      console.error(`Erro ao buscar setores com status ${status}:`, error);
      return [];
    }
    
    if (!sectors || sectors.length === 0) {
      return [];
    }
    
    // Mapear setores para o formato esperado
    return Promise.all(sectors.map(async (sector) => {
      // Aqui você pode decidir se quer carregar os serviços e fotos imediatamente
      // ou fazer isso de forma assíncrona posteriormente
      return {
        id: sector.id,
        tagNumber: sector.tag_number,
        tagPhotoUrl: sector.tag_photo_url,
        entryInvoice: sector.nf_entrada,
        entryDate: sector.data_entrada,
        services: [], // Pode carregar assincronamente depois se necessário
        status: sector.current_status as SectorStatus,
        outcome: sector.current_outcome,
        cycleCount: sector.cycle_count,
        updated_at: sector.updated_at
      };
    }));
  } catch (error) {
    console.error(`Erro ao obter setores por status ${status}:`, error);
    return [];
  }
};

/**
 * Atualizar status do setor
 */
export const updateSectorStatus = async (
  sectorId: string, 
  status: SectorStatus, 
  userId: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('sectors')
      .update({ 
        current_status: status,
        updated_at: new Date().toISOString(),
        updated_by: userId
      })
      .eq('id', sectorId);
      
    if (error) {
      console.error(`Erro ao atualizar status do setor para ${status}:`, error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error(`Erro ao atualizar status do setor para ${status}:`, error);
    return false;
  }
};
