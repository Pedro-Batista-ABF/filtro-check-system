
import { createContext, useContext } from 'react';
import { supabaseServices } from "@/services/supabase";
import { Sector, Photo } from '@/types';

// Define the API service type explicitly
export type ApiServiceType = {
  getAllSectors: () => Promise<Sector[]>;
  getSectorById: (id: string) => Promise<Sector | undefined>;
  addSector: (sectorData: Omit<Sector, 'id'>) => Promise<Sector>;
  updateSector: (sectorId: string, sectorData: Partial<Sector>) => Promise<Sector>;
  deleteSector: (id: string) => Promise<void>;
  getDefaultServices: () => Promise<any[]>;
  uploadPhoto: (file: File, folder: string) => Promise<string>;
  refreshData: () => Promise<void>;
  // Add other methods as needed
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
  const api = supabaseServices as ApiServiceType;
  
  return (
    <ApiContext.Provider value={api}>
      {children}
    </ApiContext.Provider>
  );
};
