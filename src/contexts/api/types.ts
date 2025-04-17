
import { Sector, Service } from "@/types";
import { ApiContextType } from "../ApiContext";

/**
 * Extended API context that includes additional methods for sector management
 */
export interface ApiContextExtendedType extends Omit<ApiContextType, 'updateSector'> {
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
