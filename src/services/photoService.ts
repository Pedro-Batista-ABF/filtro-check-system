
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
      
      // Implementar lógica sem recursão para adicionar fotos
      // Para fotos "before", adiciona à lista de beforePhotos
      if (type === 'before') {
        const newPhoto: Photo = {
          id: `${serviceId}-${Date.now()}`,
          url: photoUrl,
          type: 'before',
          serviceId
        };
        
        const beforePhotos = sector.beforePhotos || [];
        const updatedBeforePhotos = [...beforePhotos, newPhoto];
        
        // Crie um objeto separado para a atualização para evitar problemas de recursão
        const updateData = {
          id: sector.id,
          beforePhotos: updatedBeforePhotos
        };
        
        await api.updateSector(updateData);
      }
      // Para fotos "after", adiciona à lista de afterPhotos
      else if (type === 'after') {
        const newPhoto: Photo = {
          id: `${serviceId}-${Date.now()}`,
          url: photoUrl,
          type: 'after',
          serviceId
        };
        
        const afterPhotos = sector.afterPhotos || [];
        const updatedAfterPhotos = [...afterPhotos, newPhoto];
        
        // Crie um objeto separado para a atualização para evitar problemas de recursão
        const updateData = {
          id: sector.id,
          afterPhotos: updatedAfterPhotos
        };
        
        await api.updateSector(updateData);
      }
      
      toast.success("Foto adicionada");
      return true;
    } catch (error) {
      const processedError = handleDatabaseError(error, "Não foi possível adicionar a foto");
      toast.error(processedError.message);
      throw processedError;
    }
  };

  return {
    updateServicePhotos
  };
};
