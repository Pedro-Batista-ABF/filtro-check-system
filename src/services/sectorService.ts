
import { Sector, Photo, ServiceType, SectorStatus, CycleOutcome } from '@/types';
import { toast } from 'sonner';
import { handleDatabaseError } from '@/utils/errorHandlers';
import { useApi } from '@/contexts/ApiContextExtended';

/**
 * Service for sector operations
 */
export const useSectorService = () => {
  const api = useApi();

  const addSector = async (sectorData: Omit<Sector, 'id'>): Promise<string | Sector> => {
    try {
      // Garantir que os tipos estejam corretos
      const status: SectorStatus = sectorData.status || 'peritagemPendente';
      const outcome: CycleOutcome = sectorData.outcome || 'EmAndamento';

      // Verificar se a foto da TAG está presente
      if (!sectorData.tagPhotoUrl) {
        console.error("Erro: Tentativa de cadastrar setor sem foto da TAG");
        throw new Error("A foto da TAG é obrigatória");
      }

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

      // Verificar se a foto da TAG está em formato blob
      const tagPhotoUrl = sectorData.tagPhotoUrl;
      if (tagPhotoUrl && tagPhotoUrl.startsWith('blob:')) {
        console.error("Erro: A foto da TAG ainda está em formato blob:", tagPhotoUrl);
        throw new Error("A foto da TAG precisa ser processada antes de salvar o setor");
      }

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
        entryObservations: sectorData.entryObservations || ''
      };

      console.log('Enviando dados de setor:', completeData);
      const result = await api.addSector(completeData);
      toast.success("Setor cadastrado com sucesso!");
      
      // Retornar o resultado diretamente, sem tentar converter
      return result;
    } catch (error) {
      const processedError = handleDatabaseError(error, "Não foi possível adicionar o setor");
      toast.error(processedError.message);
      throw processedError;
    }
  };

  const updateSector = async (id: string, updates: Partial<Sector>): Promise<boolean> => {
    try {
      // Verificar se existem fotos com formato blob que precisam ser processadas
      if (updates.tagPhotoUrl && updates.tagPhotoUrl.startsWith('blob:')) {
        console.error("Erro: Foto da TAG em formato blob no updateSector:", updates.tagPhotoUrl);
        throw new Error("A foto da TAG precisa ser processada antes de atualizar o setor");
      }

      // Usando a versão atualizada do updateSector que aceita id e updates separadamente
      await api.updateSector(id, updates);
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
