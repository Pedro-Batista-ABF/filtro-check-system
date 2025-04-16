
import { Sector, SectorStatus, CycleOutcome } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useSectorStatus() {
  const updateSectorStatus = async (sectorId: string, data: Partial<Sector>, status: SectorStatus) => {
    try {
      console.log(`Atualizando status do setor ${sectorId} para ${status}`);
      
      // Garantir que a string do ID do setor é válida para evitar erros
      if (!sectorId || typeof sectorId !== 'string') {
        throw new Error("ID do setor inválido");
      }

      const updateData = {
        current_status: status,
        current_outcome: data.outcome || 'EmAndamento',
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('sectors')
        .update(updateData)
        .eq('id', sectorId);
        
      if (error) {
        console.error(`Erro ao atualizar tabela sectors para o setor ${sectorId}:`, error);
        throw error;
      }
      
      // Buscar o ciclo mais recente para este setor
      const { data: cycleData, error: cycleQueryError } = await supabase
        .from('cycles')
        .select('id')
        .eq('sector_id', sectorId)
        .order('created_at', { ascending: false })
        .limit(1);
        
      if (cycleQueryError) {
        console.error(`Erro ao buscar ciclo para o setor ${sectorId}:`, cycleQueryError);
        throw cycleQueryError;
      }
      
      if (!cycleData || cycleData.length === 0) {
        console.error(`Nenhum ciclo encontrado para o setor ${sectorId}`);
        throw new Error("Ciclo não encontrado");
      }
      
      const cycleId = cycleData[0].id;
      
      const cycleUpdateData = {
        status: status,
        outcome: data.outcome || 'EmAndamento',
        updated_at: new Date().toISOString(),
        entry_invoice: data.entryInvoice,
        tag_number: data.tagNumber,
        peritagem_date: data.peritagemDate
      };

      const { error: cycleError } = await supabase
        .from('cycles')
        .update(cycleUpdateData)
        .eq('id', cycleId);
        
      if (cycleError) {
        console.error(`Erro ao atualizar ciclo ${cycleId} para o setor ${sectorId}:`, cycleError);
        throw cycleError;
      }
      
      if (status === 'sucateadoPendente') {
        await verifyScrapStatus(sectorId);
      }
      
      return true;
    } catch (error) {
      console.error(`Error updating sector ${sectorId} status:`, error);
      toast.error(`Erro ao atualizar status do setor: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      throw error;
    }
  };

  const verifyScrapStatus = async (sectorId: string) => {
    try {
      const { data: checkData, error: checkError } = await supabase
        .from('sectors')
        .select('current_status')
        .eq('id', sectorId)
        .single();
        
      if (checkError) {
        console.error("Erro ao verificar status:", checkError);
        return;
      }

      // Verificar se o resultado possui a propriedade current_status
      if (!checkData || !('current_status' in checkData)) {
        console.error("Resposta inválida ao verificar status");
        return;
      }

      if (checkData.current_status !== 'sucateadoPendente') {
        const forceUpdateData = {
          current_status: 'sucateadoPendente' as SectorStatus,
          updated_at: new Date().toISOString()
        };

        const { error: forceError } = await supabase
          .from('sectors')
          .update(forceUpdateData)
          .eq('id', sectorId);
          
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
