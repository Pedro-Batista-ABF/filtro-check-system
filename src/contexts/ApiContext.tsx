
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Sector, Service } from '@/types';
import { mockDataService, serviceOptions } from '@/services/mockData';
import { toast } from 'sonner';

interface ApiContextType {
  sectors: Sector[];
  loading: boolean;
  error: string | null;
  getSectorById: (id: string) => Sector | undefined;
  createSector: (sector: Omit<Sector, 'id'>) => Promise<Sector>;
  updateSector: (sector: Sector) => Promise<Sector>;
  deleteSector: (id: string) => Promise<void>;
  getDefaultServices: () => Service[];
}

const ApiContext = createContext<ApiContextType | undefined>(undefined);

export const ApiProvider = ({ children }: { children: React.ReactNode }) => {
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

  const createSector = async (sector: Omit<Sector, 'id'>): Promise<Sector> => {
    try {
      setLoading(true);
      const newSector = mockDataService.addSector(sector);
      setSectors(prevSectors => [...prevSectors, newSector]);
      toast.success('Setor cadastrado com sucesso!');
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
      toast.success('Setor atualizado com sucesso!');
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
