
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Sector, Service } from '@/types';
import { supabaseService } from '@/services/supabaseService';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';

// Make sure to export this type
export interface ApiContextType {
  sectors: Sector[];
  loading: boolean;
  error: string | null;
  getSectorById: (id: string) => Promise<Sector | undefined>;
  getSectorsByTag: (tagNumber: string) => Promise<Sector[]>;
  createSector: (sector: Omit<Sector, 'id'>) => Promise<Sector>;
  updateSector: (sector: Sector) => Promise<Sector>;
  deleteSector: (id: string) => Promise<void>;
  getDefaultServices: () => Promise<Service[]>;
  uploadPhoto: (file: File, folder?: string) => Promise<string>;
}

const ApiContext = createContext<ApiContextType | undefined>(undefined);

export const ApiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const auth = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      if (!auth.isAuthenticated) {
        setSectors([]);
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const data = await supabaseService.getAllSectors();
        setSectors(data);
        setError(null);
      } catch (err) {
        setError('Erro ao carregar dados dos setores');
        console.error(err);
        toast.error('Não foi possível carregar os setores');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [auth.isAuthenticated]);

  const getSectorById = async (id: string): Promise<Sector | undefined> => {
    try {
      return await supabaseService.getSectorById(id);
    } catch (err) {
      console.error('Erro ao buscar setor por ID:', err);
      return undefined;
    }
  };

  const getSectorsByTag = async (tagNumber: string): Promise<Sector[]> => {
    try {
      return await supabaseService.getSectorsByTag(tagNumber);
    } catch (err) {
      console.error('Erro ao buscar setores por TAG:', err);
      return [];
    }
  };

  const createSector = async (sector: Omit<Sector, 'id'>): Promise<Sector> => {
    try {
      setLoading(true);
      const newSector = await supabaseService.addSector(sector);
      
      // Atualiza a lista de setores
      setSectors(prevSectors => [...prevSectors, newSector]);
      
      toast.success(sector.status === 'sucateadoPendente' 
        ? 'Setor registrado como sucateado com sucesso!' 
        : 'Setor cadastrado com sucesso!');
        
      return newSector;
    } catch (err) {
      console.error('Erro ao cadastrar setor:', err);
      
      // Verificar se é um erro de recursão infinita (problema comum com políticas RLS)
      if (err instanceof Error && err.message.includes("infinite recursion")) {
        const errorMsg = 'Erro de configuração do banco de dados: problema com as políticas de acesso';
        setError(errorMsg);
        throw new Error(errorMsg);
      }
      
      const errorMsg = 'Erro ao cadastrar setor';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const updateSector = async (sector: Sector): Promise<Sector> => {
    try {
      setLoading(true);
      const updatedSector = await supabaseService.updateSector(sector);
      
      // Atualiza a lista de setores
      setSectors(prevSectors => 
        prevSectors.map(s => s.id === sector.id ? updatedSector : s)
      );
      
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
        setError(errorMsg);
        throw new Error(errorMsg);
      }
      
      const errorMsg = 'Erro ao atualizar setor';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const deleteSector = async (id: string): Promise<void> => {
    try {
      setLoading(true);
      await supabaseService.deleteSector(id);
      setSectors(prevSectors => prevSectors.filter(sector => sector.id !== id));
      toast.success('Setor removido com sucesso!');
    } catch (err) {
      const errorMsg = 'Erro ao remover setor';
      setError(errorMsg);
      toast.error(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const getDefaultServices = async (): Promise<Service[]> => {
    try {
      return await supabaseService.getServiceTypes();
    } catch (err) {
      console.error('Erro ao buscar serviços:', err);
      toast.error('Não foi possível carregar os serviços disponíveis');
      return [];
    }
  };
  
  const uploadPhoto = async (file: File, folder?: string): Promise<string> => {
    try {
      return await supabaseService.uploadPhoto(file, folder);
    } catch (err) {
      console.error('Erro ao fazer upload de foto:', err);
      toast.error('Não foi possível fazer upload da foto');
      throw err;
    }
  };

  const contextValue: ApiContextType = {
    sectors,
    loading,
    error,
    getSectorById,
    getSectorsByTag,
    createSector,
    updateSector,
    deleteSector,
    getDefaultServices,
    uploadPhoto
  };

  return (
    <ApiContext.Provider value={contextValue}>
      {children}
    </ApiContext.Provider>
  );
};

// Rename to useApiOriginal and export properly
export const useApiOriginal = (): ApiContextType => {
  const context = useContext(ApiContext);
  if (context === undefined) {
    throw new Error('useApiOriginal must be used within an ApiProvider');
  }
  return context;
};

// Add a standard useApi export to maintain compatibility
export const useApi = useApiOriginal;
