
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

// Renamed to ApiContextProvider to be consistent with export name
export const ApiContextProvider: React.FC<ApiProviderProps> = ({ children }) => {
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { session } = useAuth(); // Changed from token to session

  const fetchSectors = async () => {
    setLoading(true);
    setError(null);
  
    try {
      // Using session?.access_token instead of token
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

  useEffect(() => {
    if (session?.access_token) { // Changed from token to session.access_token
      fetchSectors();
    }
  }, [session]); // Changed dependency from token to session

  return (
    <ApiContext.Provider value={{ sectors, loading, error, fetchSectors }}>
      {children}
    </ApiContext.Provider>
  );
};

const useApi = (): ApiContextType => {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error("useApi deve ser usado dentro de um ApiContextProvider");
  }
  return context;
};

// Export with the correct name that matches imports in other files
export { useApi };
