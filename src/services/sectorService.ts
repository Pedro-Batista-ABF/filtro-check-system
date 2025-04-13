
import { Sector, Photo, PhotoWithFile, ServiceType } from '@/types';
import { toast } from 'sonner';
import { handleDatabaseError } from '@/utils/errorHandlers';
import { useApiOriginal } from '@/contexts/ApiContext';
import { supabase } from '@/integrations/supabase/client';

/**
 * Service for sector operations
 */
export const useSectorService = () => {
  const api = useApiOriginal();

  const addSector = async (sectorData: Omit<Sector, 'id'>): Promise<string> => {
    try {
      // Verificar autenticação primeiro
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Não autenticado", {
          description: "Você precisa estar logado para realizar esta operação"
        });
        throw new Error("Não autenticado");
      }

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
            processedPhotos.push({
              id: photo.id,
              url: photo.url,
              type: photo.type,
              serviceId: photo.serviceId
            });
          }
        }
        
        // Substituir as fotos originais pelas processadas
        sectorData.beforePhotos = processedPhotos;
      }

      // Garantir que todos os campos obrigatórios estejam presentes
      const completeData = {
        ...sectorData,
        afterPhotos: sectorData.afterPhotos || [],
        productionCompleted: sectorData.productionCompleted || false
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
      // Verificar autenticação primeiro
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Não autenticado", {
          description: "Você precisa estar logado para realizar esta operação"
        });
        throw new Error("Não autenticado");
      }

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
            processedPhotos.push({
              id: photo.id,
              url: photo.url,
              type: photo.type,
              serviceId: photo.serviceId
            });
          }
        }
        
        // Substituir as fotos originais pelas processadas
        updates.beforePhotos = processedPhotos;
      }

      // Garantir que apenas os campos básicos sejam modificados (para reduzir problemas com RLS)
      const safeUpdateData: Sector = {
        id: currentSector.id,
        tagNumber: updates.tagNumber || currentSector.tagNumber,
        entryInvoice: updates.entryInvoice || currentSector.entryInvoice,
        entryDate: updates.entryDate || currentSector.entryDate,
        peritagemDate: updates.peritagemDate || currentSector.peritagemDate,
        services: updates.services || currentSector.services,
        status: updates.status || currentSector.status,
        beforePhotos: updates.beforePhotos || currentSector.beforePhotos || [],
        afterPhotos: updates.afterPhotos || currentSector.afterPhotos || [],
        productionCompleted: updates.productionCompleted !== undefined ? updates.productionCompleted : currentSector.productionCompleted || false,
        outcome: updates.outcome || currentSector.outcome || 'EmAndamento',
        cycleCount: updates.cycleCount || currentSector.cycleCount || 1
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
