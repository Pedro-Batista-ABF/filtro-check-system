
import { createContext, useState, useEffect, ReactNode } from "react";
import { ApiContextExtendedType } from "./types";
import { extendedApiService } from "./extendedApiService";
import { useApiOriginal } from "../ApiContext";
import { Sector } from "@/types";
import { useSectorService } from "@/services/sectorService";
import { toast } from "sonner";

// Create the context
export const ApiContextExtended = createContext<ApiContextExtendedType | null>(null);

/**
 * Provider component for the extended API context
 */
export function ApiContextExtendedProvider({ children }: { children: ReactNode }) {
  const originalApi = useApiOriginal();
  const sectorService = useSectorService();
  
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
      
      const result = await extendedApiService.getAllSectors();
      setSectors(result);
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

  // Update sector
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
        loading: originalApi.loading,
        sectors,
        pendingSectors,
        inProgressSectors,
        qualityCheckSectors,
        completedSectors,
        addSector,
        updateSector,
        getSectorById: extendedApiService.getSectorById,
        getSectorsByTag: extendedApiService.getSectorsByTag,
        uploadPhoto: extendedApiService.uploadPhoto,
        updateServicePhotos: extendedApiService.updateServicePhotos,
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
