
import { Sector, Photo, ServiceType, SectorStatus, CycleOutcome } from '@/types';
import { toast } from 'sonner';
import { handleDatabaseError } from '@/utils/errorHandlers';
import { useApiOriginal } from '@/contexts/ApiContext';

/**
 * Service for sector operations
 */
export const useSectorService = () => {
  const api = useApiOriginal();

  const addSector = async (sectorData: Omit<Sector, 'id'>): Promise<string> => {
    try {
      // Authentication check removed

      // Garantir que os tipos estejam corretos
      const status: SectorStatus = sectorData.status || 'peritagemPendente';
      const outcome: CycleOutcome = sectorData.outcome || 'EmAndamento';

      // Certifique-se de que todos os serviços tenham o campo 'type' definido corretamente
      const processedServices = sectorData.services?.map(service => ({
        ...service,
        type: service.id as ServiceType,
        // Remover a propriedade 'file' dos photos dentro dos serviços para evitar recursão
        photos: service.photos?.map(photo => ({
          id: photo.id,
          url: photo.url,
          type: photo.type,
          serviceId: photo.serviceId
        })) || []
      })) || [];

      // Garantir que as fotos estejam no formato correto sem propriedades extras
      const processedBeforePhotos = (sectorData.beforePhotos || []).map(photo => ({
        id: photo.id,
        url: photo.url,
        type: photo.type,
        serviceId: photo.serviceId
      }));

      // Garantir que todos os campos obrigatórios estejam presentes e no formato correto
      const completeData = {
        tagNumber: sectorData.tagNumber,
        entryInvoice: sectorData.entryInvoice,
        entryDate: sectorData.entryDate,
        peritagemDate: sectorData.peritagemDate || '',
        services: processedServices,
        beforePhotos: processedBeforePhotos,
        afterPhotos: sectorData.afterPhotos || [],
        productionCompleted: sectorData.productionCompleted || false,
        status,
        outcome,
        cycleCount: sectorData.cycleCount || 1,
        tagPhotoUrl: sectorData.tagPhotoUrl,
        entryObservations: sectorData.entryObservations
      };

      const newSector = await api.createSector(completeData);
      toast.success("Setor cadastrado com sucesso!");
      return newSector.id;
    } catch (error) {
      const processedError = handleDatabaseError(error, "Não foi possível adicionar o setor");
      toast.error(processedError.message);
      throw processedError;
    }
  };

  const updateSector = async (id: string, updates: Partial<Sector>): Promise<boolean> => {
    try {
      // Authentication check removed

      // Primeiro, busca o setor atual
      const currentSector = await api.getSectorById(id);
      if (!currentSector) {
        throw new Error("Setor não encontrado");
      }

      // Garantir tipagem correta
      const status: SectorStatus = (updates.status as SectorStatus) || currentSector.status;
      const outcome: CycleOutcome = (updates.outcome as CycleOutcome) || currentSector.outcome || 'EmAndamento';

      // Certifique-se de que todos os serviços atualizados tenham o campo 'type' definido corretamente
      const processedServices = updates.services?.map(service => ({
        ...service,
        type: service.id as ServiceType,
        // Remover a propriedade 'file' dos photos dentro dos serviços para evitar recursão
        photos: service.photos?.map(photo => ({
          id: photo.id,
          url: photo.url,
          type: photo.type,
          serviceId: photo.serviceId
        })) || []
      })) || currentSector.services;

      // Garantir que as fotos estejam no formato correto sem propriedades extras
      const processedBeforePhotos = (updates.beforePhotos || currentSector.beforePhotos || []).map(photo => ({
        id: photo.id,
        url: photo.url,
        type: photo.type,
        serviceId: photo.serviceId
      }));

      const processedAfterPhotos = (updates.afterPhotos || currentSector.afterPhotos || []).map(photo => ({
        id: photo.id,
        url: photo.url,
        type: photo.type,
        serviceId: photo.serviceId
      }));

      // Garantir que apenas os campos necessários sejam modificados (para reduzir problemas com RLS)
      const safeUpdateData: Sector = {
        id: currentSector.id,
        tagNumber: updates.tagNumber || currentSector.tagNumber,
        entryInvoice: updates.entryInvoice || currentSector.entryInvoice,
        entryDate: updates.entryDate || currentSector.entryDate,
        peritagemDate: updates.peritagemDate || currentSector.peritagemDate,
        services: processedServices,
        status: status,
        beforePhotos: processedBeforePhotos,
        afterPhotos: processedAfterPhotos,
        productionCompleted: updates.productionCompleted !== undefined ? updates.productionCompleted : currentSector.productionCompleted || false,
        outcome: outcome,
        cycleCount: updates.cycleCount || currentSector.cycleCount || 1,
        tagPhotoUrl: updates.tagPhotoUrl || currentSector.tagPhotoUrl
      };

      // Atualiza o setor
      await api.updateSector(safeUpdateData);
      toast.success("Setor atualizado com sucesso!");
      return true;
    } catch (error) {
      const processedError = handleDatabaseError(error, "Não foi possível atualizar o setor");
      toast.error(processedError.message);
      throw processedError;
    }
  };

  return {
    addSector,
    updateSector
  };
};
