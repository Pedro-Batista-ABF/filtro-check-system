
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

      // Prepara os dados para a atualização
      const updateData = {
        current_status: status,
        current_outcome: data.outcome || 'EmAndamento',
        updated_at: new Date().toISOString()
      };
      
      console.log("Dados para atualização do setor:", updateData);

      // Usa any para contornar verificação de tipagem do TypeScript
      const { data: updateResult, error } = await supabase
        .from('sectors')
        .update(updateData)
        .eq('id', sectorId)
        .select();
        
      if (error) {
        console.error(`Erro ao atualizar tabela sectors para o setor ${sectorId}:`, error);
        throw error;
      }
      
      console.log("Resultado da atualização do setor:", updateResult);
      
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
      
      // Prepara os dados para a atualização do ciclo
      const cycleUpdateData = {
        status: status,
        outcome: data.outcome || 'EmAndamento',
        updated_at: new Date().toISOString(),
        entry_invoice: data.entryInvoice,
        tag_number: data.tagNumber,
        peritagem_date: data.peritagemDate,
        scrap_validated: status === 'sucateado' ? true : false,
        scrap_observations: data.scrapObservations,
        scrap_return_date: data.scrapReturnDate,
        scrap_return_invoice: data.scrapReturnInvoice
      };
      
      console.log("Dados para atualização do ciclo:", cycleUpdateData);
      
      // Atualizar o ciclo
      const { data: cycleUpdateResult, error: cycleError } = await supabase
        .from('cycles')
        .update(cycleUpdateData)
        .eq('id', cycleId)
        .select();
        
      if (cycleError) {
        console.error(`Erro ao atualizar ciclo ${cycleId} para o setor ${sectorId}:`, cycleError);
        throw cycleError;
      }
      
      console.log("Resultado da atualização do ciclo:", cycleUpdateResult);
      
      if (status === 'sucateadoPendente' || status === 'sucateado') {
        await verifyScrapStatus(sectorId, status);
      }
      
      return true;
    } catch (error) {
      console.error(`Error updating sector ${sectorId} status:`, error);
      toast.error(`Erro ao atualizar status do setor: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      throw error;
    }
  };

  const verifyScrapStatus = async (sectorId: string, targetStatus: SectorStatus) => {
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

      if (checkData.current_status !== targetStatus) {
        console.log(`Status atual (${checkData.current_status}) é diferente do desejado (${targetStatus}). Forçando atualização...`);
        
        const { data: forceResult, error: forceError } = await supabase
          .from('sectors')
          .update({
            current_status: targetStatus,
            updated_at: new Date().toISOString()
          })
          .eq('id', sectorId)
          .select();
          
        if (forceError) {
          console.error("Erro ao forçar status:", forceError);
        } else {
          console.log("Status forçado com sucesso:", forceResult);
        }
      }
    } catch (error) {
      console.error("Erro ao verificar status de sucateamento:", error);
    }
  };

  return { updateSectorStatus };
}
