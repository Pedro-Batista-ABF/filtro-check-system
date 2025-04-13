
import { toast } from 'sonner';
import { Photo } from '@/types';
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
      // Busca o setor atual
      const sector = await api.getSectorById(sectorId);
      if (!sector) {
        throw new Error("Setor não encontrado");
      }

      // Cria uma cópia do setor para modificar
      const updatedSector = { ...sector };

      // Encontra o serviço
      const serviceIndex = updatedSector.services.findIndex(s => s.id === serviceId);
      if (serviceIndex === -1) {
        throw new Error("Serviço não encontrado");
      }

      // Inicializa o array de fotos do serviço se necessário
      if (!updatedSector.services[serviceIndex].photos) {
        updatedSector.services[serviceIndex].photos = [];
      }

      // Adiciona a nova foto
      const newPhoto: Photo = {
        id: `photo-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        url: photoUrl,
        type,
        serviceId
      };

      // Adiciona a foto ao array apropriado dependendo do tipo
      if (type === 'before') {
        updatedSector.beforePhotos = [...(updatedSector.beforePhotos || []), newPhoto];
      } else {
        updatedSector.afterPhotos = [...(updatedSector.afterPhotos || []), newPhoto];
      }

      // Atualiza o setor
      await api.updateSector(updatedSector);
      return true;
    } catch (error) {
      const processedError = handleDatabaseError(error, "Não foi possível atualizar as fotos do serviço");
      toast.error(processedError.message);
      throw processedError;
    }
  };

  return {
    updateServicePhotos
  };
};
