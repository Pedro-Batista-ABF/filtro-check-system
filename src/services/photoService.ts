
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
      
      // Preparar arrays para as fotos
      const updatedBeforePhotos = type === 'before' 
        ? [...(sector.beforePhotos || []), newPhoto]
        : [...(sector.beforePhotos || [])];
        
      const updatedAfterPhotos = type === 'after'
        ? [...(sector.afterPhotos || []), newPhoto]
        : [...(sector.afterPhotos || [])];
      
      // Garantir que scrapPhotos existe
      const scrapPhotos = sector.scrapPhotos || [];
      
      // Preparar objeto simplificado para atualização com tipos corretos
      const updateData = {
        id: sector.id,
        tagNumber: sector.tagNumber,
        entryInvoice: sector.entryInvoice,
        entryDate: sector.entryDate,
        beforePhotos: updatedBeforePhotos,
        afterPhotos: updatedAfterPhotos,
        scrapPhotos: scrapPhotos,
        services: sector.services || [],
        status: sector.status,
        productionCompleted: sector.productionCompleted || false,
        outcome: sector.outcome || 'EmAndamento',
        cycleCount: sector.cycleCount || 1,
        peritagemDate: sector.peritagemDate
      };
      
      // Tenta atualizar o setor
      await api.updateSector(updateData);
      
      // Adicionar a foto diretamente na tabela photos com metadados
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // Buscar o ciclo atual
          const { data: cycleData } = await supabase
            .from('cycles')
            .select('id')
            .eq('sector_id', sectorId)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
            
          if (cycleData) {
            // Adicionar a foto na tabela photos
            const { error } = await supabase
              .from('photos')
              .insert({
                cycle_id: cycleData.id,
                service_id: serviceId,
                url: photoUrl,
                type,
                created_by: user.id,
                metadata: {
                  sector_id: sectorId,
                  service_id: serviceId,
                  stage: type === 'before' ? 'peritagem' : 'checagem',
                  type: 'servico'
                }
              });
              
            if (error) {
              console.error("Erro ao adicionar foto na tabela photos:", error);
            } else {
              console.log("Foto adicionada com sucesso na tabela photos:", {
                service_id: serviceId,
                type,
                stage: type === 'before' ? 'peritagem' : 'checagem'
              });
            }
          } else {
            console.warn("Ciclo não encontrado para o setor:", sectorId);
          }
        }
      } catch (directError) {
        console.error("Erro ao adicionar foto diretamente:", directError);
      }
      
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
