
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Sector, Service, Cycle } from '@/types';
import { mockDataService, serviceOptions } from '@/services/mockData';
import { toast } from 'sonner';

interface ApiContextType {
  sectors: Sector[];
  loading: boolean;
  error: string | null;
  getSectorById: (id: string) => Sector | undefined;
  getSectorsByTag: (tagNumber: string) => Sector[];
  createSector: (sector: Omit<Sector, 'id'>) => Promise<Sector>;
  updateSector: (sector: Sector) => Promise<Sector>;
  deleteSector: (id: string) => Promise<void>;
  getDefaultServices: () => Service[];
}

const ApiContext = createContext<ApiContextType | undefined>(undefined);

export const ApiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate API fetch
    const fetchData = () => {
      try {
        setLoading(true);
        const data = mockDataService.getAllSectors();
        setSectors(data);
        setError(null);
      } catch (err) {
        setError('Erro ao carregar dados dos setores');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getSectorById = (id: string): Sector | undefined => {
    return mockDataService.getSectorById(id);
  };

  const getSectorsByTag = (tagNumber: string): Sector[] => {
    return mockDataService.getSectorsByTag(tagNumber);
  };

  const createSector = async (sector: Omit<Sector, 'id'>): Promise<Sector> => {
    try {
      setLoading(true);
      // Garantir que um novo ID único seja gerado
      const newSector = mockDataService.addSector(sector);
      
      // Verificar se já existe um setor com o mesmo ID antes de adicionar
      const existingIndex = sectors.findIndex(s => s.id === newSector.id);
      if (existingIndex >= 0) {
        console.warn(`ID duplicado detectado: ${newSector.id}. Gerando novo ID.`);
        // Gerar um novo ID no caso de colisão
        newSector.id = Date.now().toString() + Math.random().toString(36).substr(2, 5);
      }
      
      setSectors(prevSectors => [...prevSectors, newSector]);
      toast.success(sector.status === 'sucateadoPendente' 
        ? 'Setor registrado como sucateado com sucesso!' 
        : 'Setor cadastrado com sucesso!');
      return newSector;
    } catch (err) {
      const errorMsg = 'Erro ao cadastrar setor';
      setError(errorMsg);
      toast.error(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const updateSector = async (sector: Sector): Promise<Sector> => {
    try {
      setLoading(true);
      const updatedSector = mockDataService.updateSector(sector);
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
      const errorMsg = 'Erro ao atualizar setor';
      setError(errorMsg);
      toast.error(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const deleteSector = async (id: string): Promise<void> => {
    try {
      setLoading(true);
      mockDataService.deleteSector(id);
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

  const getDefaultServices = (): Service[] => {
    return JSON.parse(JSON.stringify(serviceOptions));
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
    getDefaultServices
  };

  return (
    <ApiContext.Provider value={contextValue}>
      {children}
    </ApiContext.Provider>
  );
};

export const useApi = (): ApiContextType => {
  const context = useContext(ApiContext);
  if (context === undefined) {
    throw new Error('useApi must be used within an ApiProvider');
  }
  return context;
};
