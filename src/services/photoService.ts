
import { Photo, PhotoWithFile } from '@/types';
import { toast } from 'sonner';
import { handleDatabaseError } from '@/utils/errorHandlers';
import { useApiOriginal } from '@/contexts/ApiContext';
import { supabase } from '@/integrations/supabase/client';

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
      // Verificar autenticação
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Não autenticado", {
          description: "Você precisa estar logado para realizar esta operação"
        });
        throw new Error("Não autenticado");
      }

      // Primeiro, busca o setor atual
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
      
      // Cria cópias simples das listas de fotos para evitar referências circulares
      let updatedBeforePhotos = [...(sector.beforePhotos || [])];
      let updatedAfterPhotos = [...(sector.afterPhotos || [])];
      
      // Adiciona a nova foto à lista apropriada
      if (type === 'before') {
        updatedBeforePhotos = [...updatedBeforePhotos, newPhoto];
      } else {
        updatedAfterPhotos = [...updatedAfterPhotos, newPhoto];
      }
      
      // Prepara um objeto simples para atualização, minimizando propriedades
      const updateData = {
        id: sector.id,
        tagNumber: sector.tagNumber,
        entryInvoice: sector.entryInvoice,
        entryDate: sector.entryDate,
        beforePhotos: updatedBeforePhotos,
        afterPhotos: updatedAfterPhotos,
        services: sector.services,
        status: sector.status,
        productionCompleted: sector.productionCompleted || false,
        outcome: sector.outcome || 'EmAndamento',
        cycleCount: sector.cycleCount || 1,
        peritagemDate: sector.peritagemDate
      };
      
      // Tenta atualizar o setor com um objeto simplificado
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
