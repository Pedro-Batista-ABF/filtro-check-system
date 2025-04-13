
import { supabase } from "@/integrations/supabase/client";
import { Sector, Photo } from "@/types";
import { toast } from "sonner";
import { handleDatabaseError } from "@/utils/errorHandlers";

export const usePhotoService = () => {
  // Método para atualizar as fotos de um serviço específico
  const updateServicePhotos = async (
    sectorId: string,
    serviceId: string,
    photoUrl: string,
    type: 'before' | 'after'
  ): Promise<boolean> => {
    try {
      // Primeiro, vamos obter o ID do ciclo atual para este setor
      const { data: cycleData, error: cycleError } = await supabase
        .from('cycles')
        .select('id')
        .eq('sector_id', sectorId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (cycleError) {
        throw cycleError;
      }

      const cycleId = cycleData.id;

      // Agora, inserimos a foto no banco de dados
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("Usuário não autenticado");
      }

      const { data: photoData, error: photoError } = await supabase
        .from('photos')
        .insert({
          cycle_id: cycleId,
          service_id: serviceId,
          url: photoUrl,
          type: type,
          created_by: user.id
        })
        .select()
        .single();

      if (photoError) {
        console.error("Erro ao inserir foto:", photoError);
        throw photoError;
      }

      return true;
    } catch (error) {
      const processedError = handleDatabaseError(
        error,
        "Não foi possível atualizar as fotos do serviço"
      );
      console.error(processedError);
      toast.error(processedError.message);
      return false;
    }
  };

  return {
    updateServicePhotos
  };
};
