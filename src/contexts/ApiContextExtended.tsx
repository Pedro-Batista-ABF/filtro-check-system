
import { useContext, useState, createContext, ReactNode, useEffect } from "react";
import { Sector } from "@/types";
import { useApiOriginal, ApiContextType } from "./ApiContext";
import { supabaseService } from "@/services/supabase";
import { useSectorService } from "@/services/sectorService";
import { photoService } from "@/services/photoService";
import { toast } from "sonner";

/**
 * Extended API context that includes additional methods for sector management
 */
interface ApiContextExtendedType extends Omit<ApiContextType, 'updateSector'> {
  isLoading: boolean;
  error: string | null;
  sectors: Sector[];
  pendingSectors: Sector[];
  inProgressSectors: Sector[];
  qualityCheckSectors: Sector[];
  completedSectors: Sector[];
  addSector: (sectorData: Omit<Sector, 'id'>) => Promise<string>;
  updateSector: (sectorId: string, sectorData: Partial<Sector>) => Promise<boolean>;
  getSectorById: (id: string) => Promise<Sector | undefined>;
  getSectorsByTag: (tagNumber: string) => Promise<Sector[]>;
  uploadPhoto: (file: File, folder?: string) => Promise<string>;
  updateServicePhotos: (sectorId: string, serviceId: string, photoUrl: string, type: 'before' | 'after') => Promise<boolean>;
  refreshData: () => Promise<void>;
}

/**
 * Default context values
 */
const defaultContext: ApiContextExtendedType = {
  isLoading: false,
  error: null,
  loading: false, 
  sectors: [],
  pendingSectors: [],
  inProgressSectors: [],
  qualityCheckSectors: [],
  completedSectors: [],
  addSector: async () => "",
  updateSector: async () => false,
  getSectorById: async () => undefined,
  getSectorsByTag: async () => [],
  uploadPhoto: async () => "",
  updateServicePhotos: async () => false,
  refreshData: async () => {},
  
  // Add these from ApiContextType
  createSector: async () => ({} as Sector),
  deleteSector: async () => {},
  getDefaultServices: async () => []
};

/**
 * Create the context
 */
const ApiContextExtended = createContext<ApiContextExtendedType>(defaultContext);

/**
 * Provider component for the extended API context
 */
export function ApiContextExtendedProvider({ children }: { children: ReactNode }) {
  const originalApi = useApiOriginal();
  const sectorService = useSectorService();
  // Use photoService directly instead of usePhotoService
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sectors, setSectors] = useState<Sector[]>([]);

  /**
   * Fetch all sectors from the API
   */
  const refreshData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log("Fetching all sectors...");
      const result = await supabaseService.getAllSectors();
      console.log("Fetched sectors:", result);
      setSectors(result || []);
    } catch (err) {
      console.error("Error fetching sectors:", err);
      setError(err instanceof Error ? err.message : "Unknown error fetching sectors");
      toast.error("Error loading sectors", {
        description: err instanceof Error ? err.message : "Unknown error"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Initial data load
  useEffect(() => {
    console.log("ApiContextExtended: Initializing and fetching data");
    refreshData();
  }, []);

  // Filter sectors by status
  const pendingSectors = sectors.filter(s => s.status === 'peritagemPendente');
  const inProgressSectors = sectors.filter(s => s.status === 'emExecucao');
  const qualityCheckSectors = sectors.filter(s => s.status === 'checagemFinalPendente');
  const completedSectors = sectors.filter(s => s.status === 'concluido');

  // Get sector by ID
  const getSectorById = async (id: string): Promise<Sector | undefined> => {
    try {
      return await supabaseService.getSectorById(id);
    } catch (error) {
      console.error(`Error fetching sector ${id}:`, error);
      return undefined;
    }
  };

  // Get sectors by tag number
  const getSectorsByTag = async (tagNumber: string): Promise<Sector[]> => {
    try {
      if (supabaseService.getSectorsByTag) {
        return await supabaseService.getSectorsByTag(tagNumber);
      } else {
        console.error('Método getSectorsByTag não implementado');
        return [];
      }
    } catch (error) {
      console.error(`Error fetching sectors with tag ${tagNumber}:`, error);
      return [];
    }
  };

  // Upload a photo
  const uploadPhoto = async (file: File, folder: string = 'general'): Promise<string> => {
    try {
      if (photoService.uploadPhoto) {
        return await photoService.uploadPhoto(file, folder);
      } else {
        console.error('Método uploadPhoto não implementado');
        throw new Error('Método uploadPhoto não implementado');
      }
    } catch (error) {
      console.error("Error uploading photo:", error);
      throw error;
    }
  };

  // Update service photos
  const updateServicePhotos = async (
    sectorId: string,
    serviceId: string,
    photoUrl: string,
    type: 'before' | 'after'
  ): Promise<boolean> => {
    try {
      return await photoService.updateServicePhotos?.(sectorId, serviceId, photoUrl, type) || false;
    } catch (error) {
      console.error("Error updating service photos:", error);
      return false;
    }
  };

  // Add a new sector
  const addSector = async (sectorData: Omit<Sector, 'id'>): Promise<string> => {
    try {
      const result = await sectorService.addSector(sectorData);
      await refreshData();
      return result;
    } catch (error) {
      console.error("Error adding sector:", error);
      throw error;
    }
  };

  // Update sector - uses our implementation that returns boolean
  const updateSector = async (sectorId: string, sectorData: Partial<Sector>): Promise<boolean> => {
    try {
      if (!sectorId) {
        throw new Error("Sector ID is required for updates");
      }
      
      const result = await sectorService.updateSector(sectorId, sectorData);
      await refreshData();
      return result;
    } catch (error) {
      console.error("Error updating sector:", error);
      throw error;
    }
  };

  return (
    <ApiContextExtended.Provider
      value={{
        isLoading,
        error,
        loading: originalApi.loading, // Pass through original loading
        sectors,
        pendingSectors,
        inProgressSectors,
        qualityCheckSectors,
        completedSectors,
        addSector,
        updateSector,
        getSectorById,
        getSectorsByTag,
        uploadPhoto,
        updateServicePhotos,
        refreshData,
        
        // Pass through methods from the original context
        createSector: originalApi.createSector,
        deleteSector: originalApi.deleteSector,
        getDefaultServices: originalApi.getDefaultServices
      }}
    >
      {children}
    </ApiContextExtended.Provider>
  );
}

/**
 * Hook to use the extended API context
 */
export function useApi() {
  return useContext(ApiContextExtended);
}

// Export the context
export { ApiContextExtended };
