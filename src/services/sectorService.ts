
import { supabaseService } from '@/services/supabase';
import { Sector } from '@/types';
import { toast } from 'sonner';
import { supabase } from "@/integrations/supabase/client";

/**
 * Helper service for sector data operations
 */
export const sectorService = {
  /**
   * Add a new sector
   */
  addSector: async (sectorData: Omit<Sector, 'id'>): Promise<string> => {
    try {
      // Map sector data to the format expected by supabaseService
      const result = await supabaseService.addSector(sectorData);
      
      // Return the ID of the new sector
      if (typeof result === 'string') {
        // Handle case where we just got an ID back
        return result;
      } else if (result && 'id' in result) {
        // Handle case where we got a full sector object back
        return result.id;
      } else {
        throw new Error('Failed to add sector');
      }
    } catch (error) {
      console.error('Error in sectorService.addSector:', error);
      toast.error('Erro ao adicionar setor', {
        description: error instanceof Error ? error.message : 'Erro desconhecido'
      });
      throw error;
    }
  },
  
  /**
   * Update an existing sector - returns a boolean
   */
  updateSector: async (sectorId: string, sectorData: Partial<Sector>): Promise<boolean> => {
    try {
      if (!sectorId) {
        throw new Error('ID do setor não informado');
      }
      
      console.log(`updateSector iniciado para setor ${sectorId}`, sectorData);
      
      // First, get the complete sector information
      const existingSector = await supabaseService.getSectorById(sectorId);
      
      if (!existingSector) {
        toast.error('Setor não encontrado');
        return false;
      }
      
      // Log dos dados atuais para diagnóstico
      console.log("Dados atuais do setor:", existingSector);
      
      // Verificar se é uma operação de sucateamento
      const isScrapOperation = sectorData.status === 'sucateado';
      
      // Se for sucateamento, validar campos específicos
      if (isScrapOperation) {
        if (!sectorData.scrapObservations) {
          console.error("Campo obrigatório ausente: scrapObservations");
          throw new Error('Observações de sucateamento são obrigatórias');
        }
        
        if (!sectorData.scrapReturnInvoice) {
          console.error("Campo obrigatório ausente: scrapReturnInvoice");
          throw new Error('Nota fiscal de devolução é obrigatória');
        }
        
        if (!sectorData.scrapReturnDate) {
          console.error("Campo obrigatório ausente: scrapReturnDate");
          throw new Error('Data de devolução é obrigatória');
        }
        
        // Verificar fotos para operações de sucateamento
        if (!sectorData.scrapPhotos || sectorData.scrapPhotos.length === 0) {
          console.error("Campo obrigatório ausente: scrapPhotos");
          throw new Error('Fotos de sucateamento são obrigatórias');
        }
      }
      
      // Merge existing data with updates
      const updatedSector: Sector = {
        ...existingSector,
        ...sectorData,
        id: sectorId // Ensure ID doesn't change
      };
      
      console.log("Dados finais para atualização:", updatedSector);
      
      // Tenta fazer a atualização diretamente no supabase para diagnóstico
      if (isScrapOperation) {
        try {
          const { data: rawUpdateResult, error: rawUpdateError } = await supabase
            .from('sectors')
            .update({
              current_status: 'sucateado',
              current_outcome: 'Sucateado',
              updated_at: new Date().toISOString(),
              scrap_observations: sectorData.scrapObservations
            })
            .eq('id', sectorId)
            .select();
            
          if (rawUpdateError) {
            console.error("Erro na atualização direta do setor:", rawUpdateError);
          } else {
            console.log("Resultado da atualização direta:", rawUpdateResult);
          }
        } catch (directError) {
          console.error("Exceção na atualização direta:", directError);
        }
      }
      
      // Update the sector using supabaseService
      await supabaseService.updateSector(updatedSector);
      
      // Verificar se a atualização foi bem-sucedida
      if (isScrapOperation) {
        const { data: checkResult } = await supabase
          .from('sectors')
          .select('current_status, current_outcome')
          .eq('id', sectorId)
          .single();
          
        console.log("Status após atualização:", checkResult);
        
        if (checkResult && checkResult.current_status !== 'sucateado') {
          console.warn("Status não foi atualizado corretamente. Tentando atualização forçada...");
          
          const { error: forceError } = await supabase
            .from('sectors')
            .update({
              current_status: 'sucateado',
              current_outcome: 'Sucateado',
              updated_at: new Date().toISOString()
            })
            .eq('id', sectorId);
            
          if (forceError) {
            console.error("Erro na atualização forçada:", forceError);
          }
        }
      }
      
      toast.success('Setor atualizado com sucesso');
      return true;
    } catch (error) {
      console.error('Error in sectorService.updateSector:', error);
      toast.error('Erro ao atualizar setor', {
        description: error instanceof Error ? error.message : 'Erro desconhecido'
      });
      return false;
    }
  }
};

/**
 * Hook to use the sector service
 */
export function useSectorService() {
  return sectorService;
}
