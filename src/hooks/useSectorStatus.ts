
import { Sector, SectorStatus, CycleOutcome } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useSectorStatus() {
  const updateSectorStatus = async (sectorId: string, data: Partial<Sector>, status: SectorStatus) => {
    try {
      console.log(`Atualizando status do setor ${sectorId} para ${status}`);
      
      const { error } = await supabase
        .from('sectors')
        .update({
          current_status: status,
          current_outcome: data.outcome || 'EmAndamento',
          updated_at: new Date().toISOString()
        } as any)
        .eq('id', sectorId as any);
        
      if (error) throw error;
      
      const { error: cycleError } = await supabase
        .from('cycles')
        .update({
          status: status,
          outcome: data.outcome || 'EmAndamento',
          updated_at: new Date().toISOString(),
          entry_invoice: data.entryInvoice,
          tag_number: data.tagNumber,
          peritagem_date: data.peritagemDate
        } as any)
        .eq('sector_id', sectorId as any)
        .order('created_at', { ascending: false })
        .limit(1);
        
      if (cycleError) throw cycleError;
      
      if (status === 'sucateadoPendente') {
        await verifyScrapStatus(sectorId);
      }
      
      return true;
    } catch (error) {
      console.error(`Error updating sector ${sectorId} status:`, error);
      throw error;
    }
  };

  const verifyScrapStatus = async (sectorId: string) => {
    try {
      const { data: checkData, error: checkError } = await supabase
        .from('sectors')
        .select('current_status')
        .eq('id', sectorId as any)
        .single();
        
      if (checkError) {
        console.error("Erro ao verificar status:", checkError);
        return;
      }

      if (!checkData || checkData.current_status !== 'sucateadoPendente') {
        const { error: forceError } = await supabase
          .from('sectors')
          .update({
            current_status: 'sucateadoPendente' as SectorStatus,
            updated_at: new Date().toISOString()
          } as any)
          .eq('id', sectorId as any);
          
        if (forceError) {
          console.error("Erro ao forçar status:", forceError);
        }
      }
    } catch (error) {
      console.error("Erro ao verificar status de sucateamento:", error);
    }
  };

  return { updateSectorStatus };
}
