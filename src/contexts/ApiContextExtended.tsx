
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Sector } from '@/types';
import { useAuth } from './AuthContext';

interface ApiContextType {
  sectors: Sector[];
  loading: boolean;
  error: string | null;
  fetchSectors: () => Promise<void>;
  refreshData: () => Promise<void>;
  getSectorById: (id: string) => Promise<Sector | null>;
  updateSector: (id: string, data: Partial<Sector>) => Promise<boolean>;
  addSector: (data: Omit<Sector, 'id'>) => Promise<string | false>;
  uploadPhoto: (file: File, folder?: string) => Promise<string | null>;
}

const ApiContext = createContext<ApiContextType | undefined>(undefined);

interface ApiProviderProps {
  children: React.ReactNode;
}

export const ApiContextProvider: React.FC<ApiProviderProps> = ({ children }) => {
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { session } = useAuth();

  const fetchSectors = async () => {
    setLoading(true);
    setError(null);
  
    try {
      const token = session?.access_token;
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sectors`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) {
        throw new Error(`Erro ao buscar setores: ${response.status} - ${response.statusText}`);
      }
  
      const data = await response.json();
      setSectors(data);
    } catch (err: any) {
      setError(err.message || 'Erro ao buscar os setores');
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    await fetchSectors();
  };

  const getSectorById = async (id: string): Promise<Sector | null> => {
    try {
      // Primeiro verificar se o setor já está no estado
      const existingSector = sectors.find((s) => s.id === id);
      if (existingSector) return existingSector;

      // Se não estiver, buscar da API
      const token = session?.access_token;
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sectors/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erro ao buscar setor: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      console.error('Erro ao buscar setor por ID:', err);
      return null;
    }
  };

  const updateSector = async (id: string, data: Partial<Sector>): Promise<boolean> => {
    try {
      const token = session?.access_token;
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sectors/${id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Erro ao atualizar setor: ${response.status} - ${response.statusText}`);
      }

      // Atualizar o estado local após sucesso
      setSectors((prevSectors) =>
        prevSectors.map((sector) => (sector.id === id ? { ...sector, ...data } : sector))
      );

      return true;
    } catch (err) {
      console.error('Erro ao atualizar setor:', err);
      return false;
    }
  };

  const addSector = async (data: Omit<Sector, 'id'>): Promise<string | false> => {
    try {
      const token = session?.access_token;
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sectors`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Erro ao adicionar setor: ${response.status} - ${response.statusText}`);
      }

      const result = await response.json();
      const newId = result.id;

      // Adicionar o novo setor ao estado local
      setSectors((prevSectors) => [...prevSectors, { ...data, id: newId }]);

      return newId;
    } catch (err) {
      console.error('Erro ao adicionar setor:', err);
      return false;
    }
  };

  const uploadPhoto = async (file: File, folder: string = 'general'): Promise<string | null> => {
    try {
      const token = session?.access_token;
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Erro ao fazer upload: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      return data.url;
    } catch (err) {
      console.error('Erro ao fazer upload de arquivo:', err);
      return null;
    }
  };

  useEffect(() => {
    if (session?.access_token) {
      fetchSectors();
    }
  }, [session]);

  return (
    <ApiContext.Provider 
      value={{ 
        sectors, 
        loading, 
        error, 
        fetchSectors, 
        refreshData, 
        getSectorById, 
        updateSector, 
        addSector, 
        uploadPhoto 
      }}
    >
      {children}
    </ApiContext.Provider>
  );
};

export const useApi = (): ApiContextType => {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error("useApi deve ser usado dentro de um ApiContextProvider");
  }
  return context;
};
