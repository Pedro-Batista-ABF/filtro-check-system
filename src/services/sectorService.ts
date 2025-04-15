
import { Sector, Service, Photo, SectorStatus, CycleOutcome, ServiceType } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Busca todos os setores
 */
export const getAllSectors = async (): Promise<Sector[]> => {
  try {
    const { data, error } = await supabase
      .from('sectors')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Mapear os resultados para o formato esperado
    const sectors: Sector[] = await Promise.all(data.map(async (item) => {
      // Buscar serviços associados a este setor
      const { data: servicesData, error: servicesError } = await supabase
        .from('sector_services')
        .select('*, service_types(*)')
        .eq('sector_id', item.id);
      
      // Serviços
      const services: Service[] = (servicesData || []).map(service => ({
        id: service.service_id,
        name: service.service_types?.name || service.service_id,
        type: service.service_id as unknown as ServiceType,
        quantity: service.quantity || 1,
        selected: service.selected || false,
        completed: false,
        photos: []
      }));
      
      // Buscar fotos associadas
      const { data: photosData, error: photosError } = await supabase
        .from('photos')
        .select('*')
        .in('metadata->sector_id', [item.id]);
      
      // Separar fotos por tipo
      const beforePhotos: Photo[] = [];
      const afterPhotos: Photo[] = [];
      const scrapPhotos: Photo[] = [];
      
      (photosData || []).forEach(photo => {
        const newPhoto: Photo = {
          id: photo.id,
          url: photo.url,
          type: photo.type as any,
          serviceId: photo.service_id
        };
        
        if (photo.type === 'before') {
          beforePhotos.push(newPhoto);
        } else if (photo.type === 'after') {
          afterPhotos.push(newPhoto);
        } else if (photo.type === 'scrap') {
          scrapPhotos.push(newPhoto);
        }
      });
      
      return {
        id: item.id,
        tagNumber: item.tag_number,
        tagPhotoUrl: item.tag_photo_url,
        entryInvoice: item.nf_entrada,
        entryDate: item.data_entrada ? new Date(item.data_entrada).toISOString().split('T')[0] : '',
        peritagemDate: '',
        services,
        beforePhotos,
        afterPhotos,
        scrapPhotos, // Garantir que scrapPhotos está presente
        productionCompleted: false,
        status: item.current_status as SectorStatus,
        outcome: item.current_outcome as CycleOutcome || 'EmAndamento',
        cycleCount: item.cycle_count || 1,
        updated_at: item.updated_at,
        data_entrada: item.data_entrada ? new Date(item.data_entrada).toISOString().split('T')[0] : ''
      };
    }));
    
    return sectors;
  } catch (error) {
    console.error('Erro ao buscar setores:', error);
    toast.error('Erro ao carregar setores');
    return [];
  }
};

/**
 * Busca um setor pelo ID
 */
export const getSectorById = async (id: string): Promise<Sector | null> => {
  try {
    // Buscar o setor
    const { data, error } = await supabase
      .from('sectors')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    // Buscar ciclo atual
    const { data: cycleData, error: cycleError } = await supabase
      .from('cycles')
      .select('*')
      .eq('sector_id', id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    // Buscar serviços
    const { data: servicesData, error: servicesError } = await supabase
      .from('sector_services')
      .select('*, service_types(*)')
      .eq('sector_id', id);
    
    // Mapear serviços
    const services: Service[] = (servicesData || []).map(service => ({
      id: service.service_id,
      name: service.service_types?.name || service.service_id,
      type: service.service_id as unknown as ServiceType,
      quantity: service.quantity || 1,
      selected: service.selected || false,
      completed: false,
      photos: []
    }));
    
    // Buscar fotos associadas
    const { data: photosData, error: photosError } = await supabase
      .from('photos')
      .select('*')
      .in('metadata->sector_id', [id]);
    
    // Separar fotos por tipo
    const beforePhotos: Photo[] = [];
    const afterPhotos: Photo[] = [];
    const scrapPhotos: Photo[] = [];
    
    (photosData || []).forEach(photo => {
      const newPhoto: Photo = {
        id: photo.id,
        url: photo.url,
        type: photo.type as any,
        serviceId: photo.service_id
      };
      
      if (photo.type === 'before') {
        beforePhotos.push(newPhoto);
      } else if (photo.type === 'after') {
        afterPhotos.push(newPhoto);
      } else if (photo.type === 'scrap') {
        scrapPhotos.push(newPhoto);
      }
    });
    
    // Retornar o setor completo
    return {
      id: data.id,
      tagNumber: data.tag_number,
      tagPhotoUrl: data.tag_photo_url,
      entryInvoice: data.nf_entrada,
      entryDate: data.data_entrada ? new Date(data.data_entrada).toISOString().split('T')[0] : '',
      peritagemDate: cycleData?.peritagem_date ? new Date(cycleData.peritagem_date).toISOString().split('T')[0] : '',
      exitDate: data.data_saida ? new Date(data.data_saida).toISOString().split('T')[0] : '',
      exitInvoice: data.nf_saida,
      services,
      beforePhotos,
      afterPhotos,
      scrapPhotos, // Garantir que scrapPhotos está presente
      productionCompleted: cycleData?.production_completed || false,
      status: data.current_status as SectorStatus,
      outcome: data.current_outcome as CycleOutcome || 'EmAndamento',
      cycleCount: data.cycle_count || 1,
      entryObservations: cycleData?.entry_observations || '',
      exitObservations: cycleData?.exit_observations || '',
      checagemDate: cycleData?.checagem_date ? new Date(cycleData.checagem_date).toISOString().split('T')[0] : '',
      scrapObservations: data.scrap_observations || '',
      scrapReturnDate: cycleData?.scrap_return_date ? new Date(cycleData.scrap_return_date).toISOString().split('T')[0] : '',
      scrapReturnInvoice: cycleData?.scrap_return_invoice || '',
      scrapValidated: cycleData?.scrap_validated || false,
      updated_at: data.updated_at
    };
  } catch (error) {
    console.error(`Erro ao buscar setor ${id}:`, error);
    toast.error('Erro ao carregar setor');
    return null;
  }
};

/**
 * Adiciona um novo setor
 */
export const addSector = async (data: Omit<Sector, 'id'>): Promise<string | null> => {
  try {
    // 1. Inserir o setor
    const { data: sectorData, error: sectorError } = await supabase
      .from('sectors')
      .insert({
        tag_number: data.tagNumber,
        tag_photo_url: data.tagPhotoUrl,
        current_status: data.status,
        current_outcome: data.outcome,
        nf_entrada: data.entryInvoice,
        data_entrada: data.entryDate,
        updated_at: new Date().toISOString(),
        scrap_observations: data.scrapObservations || null
      })
      .select()
      .single();
    
    if (sectorError) throw sectorError;
    
    // 2. Inserir o ciclo
    const { data: cycleData, error: cycleError } = await supabase
      .from('cycles')
      .insert({
        sector_id: sectorData.id,
        tag_number: data.tagNumber,
        entry_invoice: data.entryInvoice,
        entry_date: data.entryDate,
        entry_observations: data.entryObservations,
        peritagem_date: data.peritagemDate,
        status: data.status,
        outcome: data.outcome,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (cycleError) throw cycleError;
    
    // 3. Inserir os serviços
    const selectedServices = data.services.filter(s => s.selected);
    for (const service of selectedServices) {
      const { error: serviceError } = await supabase
        .from('sector_services')
        .insert({
          sector_id: sectorData.id,
          service_id: service.id,
          quantity: service.quantity || 1,
          selected: true,
          stage: 'peritagem'
        });
      
      if (serviceError) console.error(`Erro ao inserir serviço ${service.id}:`, serviceError);
      
      // Inserir na tabela cycle_services também
      const { error: cycleServiceError } = await supabase
        .from('cycle_services')
        .insert({
          cycle_id: cycleData.id,
          service_id: service.id,
          quantity: service.quantity || 1,
          selected: true
        });
      
      if (cycleServiceError) console.error(`Erro ao inserir serviço ${service.id} no ciclo:`, cycleServiceError);
    }
    
    // 4. Inserir as fotos
    const { data: { user } } = await supabase.auth.getUser();
    
    // Primeiramente, garantir que as fotos antes, depois e scrap estão definidas
    const beforePhotos = data.beforePhotos || [];
    const afterPhotos = data.afterPhotos || [];
    const scrapPhotos = data.scrapPhotos || [];
    
    // 4.1 Fotos de antes
    for (const photo of beforePhotos) {
      if (!photo.url) continue;
      
      const { error: photoError } = await supabase
        .from('photos')
        .insert({
          cycle_id: cycleData.id,
          service_id: photo.serviceId || null,
          url: photo.url,
          type: 'before',
          created_by: user?.id,
          metadata: {
            sector_id: sectorData.id,
            stage: 'peritagem',
            type: photo.serviceId ? 'servico' : 'geral',
            service_id: photo.serviceId
          }
        });
      
      if (photoError) console.error(`Erro ao inserir foto:`, photoError);
    }
    
    // 4.2 Foto da TAG
    if (data.tagPhotoUrl) {
      const { error: tagPhotoError } = await supabase
        .from('photos')
        .insert({
          cycle_id: cycleData.id,
          service_id: null,
          url: data.tagPhotoUrl,
          type: 'tag',
          created_by: user?.id,
          metadata: {
            sector_id: sectorData.id,
            stage: 'peritagem',
            type: 'tag'
          }
        });
      
      if (tagPhotoError) console.error(`Erro ao inserir foto da TAG:`, tagPhotoError);
    }
    
    return sectorData.id;
  } catch (error) {
    console.error('Erro ao adicionar setor:', error);
    toast.error('Erro ao adicionar setor');
    return null;
  }
};

/**
 * Atualiza um setor existente
 */
export const updateSector = async (data: Partial<Sector>): Promise<boolean> => {
  try {
    if (!data.id) {
      throw new Error('ID do setor não fornecido');
    }
    
    // 1. Atualizar o setor
    const { error: sectorError } = await supabase
      .from('sectors')
      .update({
        tag_number: data.tagNumber,
        tag_photo_url: data.tagPhotoUrl,
        current_status: data.status,
        current_outcome: data.outcome,
        nf_entrada: data.entryInvoice,
        nf_saida: data.exitInvoice,
        data_entrada: data.entryDate,
        data_saida: data.exitDate,
        scrap_observations: data.scrapObservations,
        updated_at: new Date().toISOString()
      })
      .eq('id', data.id);
    
    if (sectorError) throw sectorError;
    
    // 2. Buscar o ciclo atual
    const { data: cycleData, error: cycleError } = await supabase
      .from('cycles')
      .select('id')
      .eq('sector_id', data.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (cycleError || !cycleData) {
      throw new Error('Ciclo não encontrado');
    }
    
    // 3. Atualizar o ciclo
    const { error: updateCycleError } = await supabase
      .from('cycles')
      .update({
        tag_number: data.tagNumber,
        entry_invoice: data.entryInvoice,
        entry_date: data.entryDate,
        entry_observations: data.entryObservations,
        exit_invoice: data.exitInvoice,
        exit_date: data.exitDate,
        exit_observations: data.exitObservations,
        peritagem_date: data.peritagemDate,
        checagem_date: data.checagemDate,
        status: data.status,
        outcome: data.outcome,
        production_completed: data.productionCompleted,
        scrap_observations: data.scrapObservations,
        scrap_return_date: data.scrapReturnDate,
        scrap_return_invoice: data.scrapReturnInvoice,
        scrap_validated: data.scrapValidated,
        updated_at: new Date().toISOString()
      })
      .eq('id', cycleData.id);
    
    if (updateCycleError) throw updateCycleError;
    
    // 4. Se há serviços, atualizar
    if (data.services && data.services.length > 0) {
      // 4.1 Remover serviços existentes
      await supabase
        .from('sector_services')
        .delete()
        .eq('sector_id', data.id);
      
      await supabase
        .from('cycle_services')
        .delete()
        .eq('cycle_id', cycleData.id);
      
      // 4.2 Inserir serviços atualizados
      const selectedServices = data.services.filter(s => s.selected);
      for (const service of selectedServices) {
        const { error: serviceError } = await supabase
          .from('sector_services')
          .insert({
            sector_id: data.id,
            service_id: service.id,
            quantity: service.quantity || 1,
            selected: true,
            stage: 'peritagem'
          });
        
        const { error: cycleServiceError } = await supabase
          .from('cycle_services')
          .insert({
            cycle_id: cycleData.id,
            service_id: service.id,
            quantity: service.quantity || 1,
            selected: true,
            completed: service.completed || false
          });
      }
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao atualizar setor:', error);
    toast.error('Erro ao atualizar setor');
    return false;
  }
};

/**
 * Exclui um setor
 */
export const deleteSector = async (id: string): Promise<boolean> => {
  try {
    // 1. Excluir o setor (as constraints de FK devem garantir a exclusão em cascata)
    const { error } = await supabase
      .from('sectors')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    toast.success('Setor excluído com sucesso');
    return true;
  } catch (error) {
    console.error('Erro ao excluir setor:', error);
    toast.error('Erro ao excluir setor');
    return false;
  }
};
