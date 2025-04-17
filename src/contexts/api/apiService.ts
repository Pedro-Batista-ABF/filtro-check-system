
import { Sector, Service } from '@/types';
import { supabaseService } from '@/services/supabase';
import { toast } from 'sonner';

/**
 * Core API service functions for sector operations
 */
export const apiService = {
  /**
   * Fetch all sectors
   */
  getAllSectors: async (): Promise<Sector[]> => {
    try {
      return await supabaseService.getAllSectors();
    } catch (err) {
      console.error('Error fetching sectors:', err);
      toast.error('Não foi possível carregar os setores');
      return [];
    }
  },

  /**
   * Get sector by ID
   */
  getSectorById: async (id: string): Promise<Sector | undefined> => {
    try {
      return await supabaseService.getSectorById(id);
    } catch (err) {
      console.error('Erro ao buscar setor por ID:', err);
      return undefined;
    }
  },

  /**
   * Get sectors by tag
   */
  getSectorsByTag: async (tagNumber: string): Promise<Sector[]> => {
    try {
      if (supabaseService.getSectorsByTag) {
        return await supabaseService.getSectorsByTag(tagNumber);
      } else {
        console.error('Método getSectorsByTag não implementado');
        return [];
      }
    } catch (err) {
      console.error('Erro ao buscar setores por TAG:', err);
      return [];
    }
  },

  /**
   * Create a new sector
   */
  createSector: async (sector: Omit<Sector, 'id'>): Promise<Sector> => {
    try {
      const newSector = await supabaseService.addSector(sector);
      
      toast.success(sector.status === 'sucateadoPendente' 
        ? 'Setor registrado como sucateado com sucesso!' 
        : 'Setor cadastrado com sucesso!');
        
      return newSector;
    } catch (err) {
      console.error('Erro ao cadastrar setor:', err);
      
      // Verificar se é um erro de recursão infinita (problema comum com políticas RLS)
      if (err instanceof Error && err.message.includes("infinite recursion")) {
        const errorMsg = 'Erro de configuração do banco de dados: problema com as políticas de acesso';
        throw new Error(errorMsg);
      }
      
      const errorMsg = 'Erro ao cadastrar setor';
      throw new Error(errorMsg);
    }
  },

  /**
   * Update an existing sector
   */
  updateSector: async (sector: Sector): Promise<Sector> => {
    try {
      const updatedSector = await supabaseService.updateSector(sector);
      
      let successMessage = 'Setor atualizado com sucesso!';
      if (sector.status === 'concluido') {
        successMessage = 'Setor finalizado com sucesso!';
      } else if (sector.status === 'sucateado') {
        successMessage = 'Sucateamento validado com sucesso!';
      } else if (sector.status === 'sucateadoPendente') {
        successMessage = 'Setor marcado como sucateado com sucesso!';
      }
      
      toast.success(successMessage);
      return updatedSector;
    } catch (err) {
      console.error('Erro ao atualizar setor:', err);
      
      // Verificar se é um erro de recursão infinita (problema comum com políticas RLS)
      if (err instanceof Error && err.message.includes("infinite recursion")) {
        const errorMsg = 'Erro de configuração do banco de dados: problema com as políticas de acesso';
        throw new Error(errorMsg);
      }
      
      const errorMsg = 'Erro ao atualizar setor';
      throw new Error(errorMsg);
    }
  },

  /**
   * Delete a sector
   */
  deleteSector: async (id: string): Promise<void> => {
    try {
      await supabaseService.deleteSector(id);
      toast.success('Setor removido com sucesso!');
    } catch (err) {
      const errorMsg = 'Erro ao remover setor';
      toast.error(errorMsg);
      throw new Error(errorMsg);
    }
  },

  /**
   * Get default service types
   */
  getDefaultServices: async (): Promise<Service[]> => {
    try {
      if (supabaseService.getServiceTypes) {
        return await supabaseService.getServiceTypes();
      } else {
        console.error('Método getServiceTypes não implementado');
        toast.error('Não foi possível carregar os serviços disponíveis');
        return [];
      }
    } catch (err) {
      console.error('Erro ao buscar serviços:', err);
      toast.error('Não foi possível carregar os serviços disponíveis');
      return [];
    }
  },
  
  /**
   * Upload a photo
   */
  uploadPhoto: async (file: File, folder?: string): Promise<string> => {
    try {
      if (supabaseService.uploadPhoto) {
        return await supabaseService.uploadPhoto(file, folder);
      } else {
        console.error('Método uploadPhoto não implementado');
        toast.error('Não foi possível fazer upload da foto');
        throw new Error('Método uploadPhoto não implementado');
      }
    } catch (err) {
      console.error('Erro ao fazer upload de foto:', err);
      toast.error('Não foi possível fazer upload da foto');
      throw err;
    }
  }
};
