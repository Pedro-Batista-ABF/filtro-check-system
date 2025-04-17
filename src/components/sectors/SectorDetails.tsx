
import { supabase } from '@/integrations/supabase/client';

/**
 * Recupera os serviços do ciclo especificado
 * @param cycleId ID do ciclo
 * @returns Serviços do ciclo
 */
export async function getCycleServices(cycleId: string) {
  try {
    // Consulta com validação de tipo
    const { data } = await supabase
      .from('cycle_services')
      .select('*')
      .eq('cycle_id', cycleId);
      
    return data || [];
  } catch (error) {
    console.error("Erro ao recuperar serviços do ciclo:", error);
    return [];
  }
}
