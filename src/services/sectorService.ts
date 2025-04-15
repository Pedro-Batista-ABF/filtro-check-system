
import { supabaseService } from '@/services/supabase';
import { Sector } from '@/types';
import { toast } from 'sonner';

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
      // First, get the complete sector information
      const existingSector = await supabaseService.getSectorById(sectorId);
      
      if (!existingSector) {
        toast.error('Setor não encontrado');
        return false;
      }
      
      // Merge existing data with updates
      const updatedSector: Sector = {
        ...existingSector,
        ...sectorData,
        id: sectorId // Ensure ID doesn't change
      };
      
      // Update the sector
      await supabaseService.updateSector(updatedSector);
      
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
