
import { supabase } from "@/integrations/supabase/client";

export const insertServicePhoto = async ({
  cycleId,
  serviceId,
  sectorId,
  url,
  type,
  userId
}: {
  cycleId: string;
  serviceId: string;
  sectorId: string;
  url: string;
  type?: string;
  userId: string;
}) => {
  // Make sure we have a userId
  if (!userId) {
    console.error("No userId provided for photo insertion");
    throw new Error("User ID is required for inserting photos");
  }

  const { error } = await supabase
    .from('photos')
    .insert({
      cycle_id: cycleId,
      service_id: serviceId,
      url: url,
      type: type || 'before',
      created_by: userId, // Make sure this is provided
      metadata: {
        sector_id: sectorId,
        service_id: serviceId,
        stage: 'peritagem',
        type: type || 'servico'
      }
    });
    
  if (error) {
    console.error(`Erro ao inserir foto para serviço ${serviceId}:`, error);
    throw error;
  }
};
