
import { Sector, Photo, PhotoWithFile, ServiceType } from '@/types';
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
      // Certifique-se de que todos os serviços tenham o campo 'type' definido corretamente
      if (sectorData.services) {
        sectorData.services = sectorData.services.map(service => ({
          ...service,
          type: service.id as ServiceType // Garantir que type é igual ao id
        }));
      }

      // Processar arquivos de foto para garantir que sejam enviados corretamente
      if (sectorData.beforePhotos && sectorData.beforePhotos.length > 0) {
        const processedPhotos: Photo[] = [];
        
        for (const photo of sectorData.beforePhotos) {
          // Verificar se é uma PhotoWithFile com propriedade file
          const photoWithFile = photo as PhotoWithFile;
          
          if (photoWithFile.file) {
            try {
              // Fazer upload da imagem e obter URL
              const photoUrl = await api.uploadPhoto(photoWithFile.file, 'before');
              processedPhotos.push({
                id: photoWithFile.id,
                url: photoUrl,
                type: photoWithFile.type,
                serviceId: photoWithFile.serviceId
              });
            } catch (uploadError) {
              console.error('Erro ao fazer upload de foto:', uploadError);
              throw new Error('Não foi possível fazer o upload das fotos. Verifique sua conexão.');
            }
          } else if (photo.url) {
            // Se já é uma URL válida, apenas adicionar
            processedPhotos.push(photo);
          }
        }
        
        sectorData.beforePhotos = processedPhotos;
      }

      const newSector = await api.createSector(sectorData);
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
      // Primeiro, busca o setor atual
      const currentSector = await api.getSectorById(id);
      if (!currentSector) {
        throw new Error("Setor não encontrado");
      }

      // Certifique-se de que todos os serviços atualizados tenham o campo 'type' definido corretamente
      if (updates.services) {
        updates.services = updates.services.map(service => ({
          ...service,
          type: service.id as ServiceType // Garantir que type é igual ao id
        }));
      }

      // Processar arquivos de foto para garantir que sejam enviados corretamente
      if (updates.beforePhotos && updates.beforePhotos.length > 0) {
        const processedPhotos: Photo[] = [];
        
        for (const photo of updates.beforePhotos) {
          // Verificar se é uma PhotoWithFile com propriedade file
          const photoWithFile = photo as PhotoWithFile;
          
          if (photoWithFile.file) {
            try {
              // Fazer upload da imagem e obter URL
              const photoUrl = await api.uploadPhoto(photoWithFile.file, 'before');
              processedPhotos.push({
                id: photoWithFile.id,
                url: photoUrl,
                type: photoWithFile.type,
                serviceId: photoWithFile.serviceId
              });
            } catch (uploadError) {
              console.error('Erro ao fazer upload de foto:', uploadError);
              throw new Error('Não foi possível fazer o upload das fotos. Verifique sua conexão.');
            }
          } else if (photo.url) {
            // Se já é uma URL válida, apenas adicionar
            processedPhotos.push(photo);
          }
        }
        
        updates.beforePhotos = processedPhotos;
      }

      // Combina os dados atuais com as atualizações
      const updatedSector: Sector = {
        ...currentSector,
        ...updates
      };

      // Atualiza o setor
      await api.updateSector(updatedSector);
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
