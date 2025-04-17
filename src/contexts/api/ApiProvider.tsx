
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { ApiContext } from './ApiContext';
import { ApiContextType } from './types';
import { apiService } from './apiService';
import { Sector } from '@/types';
import { useAuth } from '../AuthContext';
import { toast } from 'sonner';

/**
 * Provider component for the API context
 */
export const ApiProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
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
        const data = await apiService.getAllSectors();
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
    return await apiService.getSectorById(id);
  };

  const getSectorsByTag = async (tagNumber: string): Promise<Sector[]> => {
    return await apiService.getSectorsByTag(tagNumber);
  };

  const createSector = async (sector: Omit<Sector, 'id'>): Promise<Sector> => {
    try {
      setLoading(true);
      const newSector = await apiService.createSector(sector);
      
      // Atualiza a lista de setores
      setSectors(prevSectors => [...prevSectors, newSector]);
      
      return newSector;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro ao cadastrar setor';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const updateSector = async (sector: Sector): Promise<Sector> => {
    try {
      setLoading(true);
      const updatedSector = await apiService.updateSector(sector);
      
      // Atualiza a lista de setores
      setSectors(prevSectors => 
        prevSectors.map(s => s.id === sector.id ? updatedSector : s)
      );
      
      return updatedSector;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro ao atualizar setor';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const deleteSector = async (id: string): Promise<void> => {
    try {
      setLoading(true);
      await apiService.deleteSector(id);
      setSectors(prevSectors => prevSectors.filter(sector => sector.id !== id));
    } catch (err) {
      const errorMsg = 'Erro ao remover setor';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const getDefaultServices = async () => {
    return await apiService.getDefaultServices();
  };
  
  const uploadPhoto = async (file: File, folder?: string): Promise<string> => {
    return await apiService.uploadPhoto(file, folder);
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
