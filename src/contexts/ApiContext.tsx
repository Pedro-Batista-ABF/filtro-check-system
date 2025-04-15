
import { createContext, useContext, useState, useEffect } from 'react';
import { supabaseServices } from "@/services/supabase";
import { Sector, Photo, Service } from '@/types';

// Define the API service type explicitly
export type ApiServiceType = {
  getAllSectors: () => Promise<Sector[]>;
  getSectorById: (id: string) => Promise<Sector | undefined>;
  addSector: (sectorData: Omit<Sector, 'id'>) => Promise<Sector>;
  updateSector: (sectorId: string, sectorData: Partial<Sector>) => Promise<Sector>;
  deleteSector: (id: string) => Promise<void>;
  getDefaultServices: () => Promise<Service[]>;
  uploadPhoto: (file: File, folder: string) => Promise<string>;
  refreshData: () => Promise<void>;
  sectors: Sector[];
  isLoading: boolean;
};

// Create a context for the API functionality
export const ApiContext = createContext<ApiServiceType | null>(null);

// This hook allows components to access the API functions
export const useApi = () => {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error('useApi must be used within an ApiProvider');
  }
  return context;
};

// The provider component
export const ApiProvider = ({ children }: { children: React.ReactNode }) => {
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Define the refreshData function
  const refreshData = async () => {
    setIsLoading(true);
    try {
      const data = await supabaseServices.getAllSectors();
      setSectors(data);
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load initial data
  useEffect(() => {
    refreshData();
  }, []);

  // Get default services implementation
  const getDefaultServices = async (): Promise<Service[]> => {
    try {
      return supabaseServices.getDefaultServices();
    } catch (error) {
      console.error("Error getting default services:", error);
      return [];
    }
  };
  
  const api: ApiServiceType = {
    ...supabaseServices,
    getDefaultServices,
    refreshData,
    sectors,
    isLoading
  };
  
  return (
    <ApiContext.Provider value={api}>
      {children}
    </ApiContext.Provider>
  );
};
