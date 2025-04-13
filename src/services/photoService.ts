
import { Photo } from '@/types';
import { toast } from 'sonner';
import { handleDatabaseError } from '@/utils/errorHandlers';
import { useApiOriginal } from '@/contexts/ApiContext';

/**
 * Service for photo operations
 */
export const usePhotoService = () => {
  const api = useApiOriginal();

  const updateServicePhotos = async (
    sectorId: string,
    serviceId: string,
    photoUrl: string,
    type: 'before' | 'after'
  ): Promise<boolean> => {
    try {
      // First, busca o setor atual
      const sector = await api.getSectorById(sectorId);
      if (!sector) {
        throw new Error("Setor não encontrado");
      }
      
      // Criar um novo objeto Photo sem propriedades que possam causar recursão
      const newPhoto: Photo = {
        id: `${serviceId}-${Date.now()}`,
        url: photoUrl,
        type,
        serviceId
      };
      
      // Preparar arrays para as fotos
      const updatedBeforePhotos = type === 'before' 
        ? [...(sector.beforePhotos || []), newPhoto]
        : [...(sector.beforePhotos || [])];
        
      const updatedAfterPhotos = type === 'after'
        ? [...(sector.afterPhotos || []), newPhoto]
        : [...(sector.afterPhotos || [])];
      
      // Preparar objeto simplificado para atualização com tipos corretos
      const updateData = {
        id: sector.id,
        tagNumber: sector.tagNumber,
        entryInvoice: sector.entryInvoice,
        entryDate: sector.entryDate,
        beforePhotos: updatedBeforePhotos,
        afterPhotos: updatedAfterPhotos,
        services: sector.services || [],
        status: sector.status,
        productionCompleted: sector.productionCompleted || false,
        outcome: sector.outcome || 'EmAndamento',
        cycleCount: sector.cycleCount || 1,
        peritagemDate: sector.peritagemDate
      };
      
      // Tenta atualizar o setor
      await api.updateSector(updateData);
      
      toast.success("Foto adicionada");
      return true;
    } catch (error) {
      console.error("Erro ao adicionar foto:", error);
      const processedError = handleDatabaseError(error, "Não foi possível adicionar a foto");
      toast.error(processedError.message);
      throw processedError;
    }
  };

  return {
    updateServicePhotos
  };
};
