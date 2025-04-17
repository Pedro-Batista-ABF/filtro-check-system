import React, { createContext, useContext, useState, useEffect } from 'react';
import { Sector } from '@/types';
import { useAuth } from './AuthContext';

interface ApiContextType {
  sectors: Sector[];
  loading: boolean;
  error: string | null;
  fetchSectors: () => Promise<void>;
}

const ApiContext = createContext<ApiContextType | undefined>(undefined);

interface ApiProviderProps {
  children: React.ReactNode;
}

const ApiContextExtendedProvider: React.FC<ApiProviderProps> = ({ children }) => {
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  const fetchSectors = async () => {
    setLoading(true);
    setError(null);
  
    try {
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

  useEffect(() => {
    if (token) {
      fetchSectors();
    }
  }, [token]);

  return (
    <ApiContext.Provider value={{ sectors, loading, error, fetchSectors }}>
      {children}
    </ApiContext.Provider>
  );
};

const useApi = (): ApiContextType => {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error("useApi deve ser usado dentro de um ApiContextExtendedProvider");
  }
  return context;
};

// Modify the export to match the import in App.tsx
export { ApiContextExtendedProvider as ApiContextProvider, useApi };
