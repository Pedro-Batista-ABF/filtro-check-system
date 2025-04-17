
import { Sector, Service } from '@/types';

/**
 * Original API context interface with standard sector operations
 */
export interface ApiContextType {
  sectors: Sector[];
  loading: boolean;
  error: string | null;
  getSectorById: (id: string) => Promise<Sector | undefined>;
  getSectorsByTag: (tagNumber: string) => Promise<Sector[]>;
  createSector: (sector: Omit<Sector, 'id'>) => Promise<Sector>;
  updateSector: (sector: Sector) => Promise<Sector>;
  deleteSector: (id: string) => Promise<void>;
  getDefaultServices: () => Promise<Service[]>;
  uploadPhoto: (file: File, folder?: string) => Promise<string>;
  refreshData?: () => Promise<void>; 
  addSector?: (sectorData: Omit<Sector, 'id'>) => Promise<string>;
  updateServicePhotos?: (sectorId: string, serviceId: string, photoUrl: string, type: 'before' | 'after') => Promise<boolean>;
}

/**
 * Extended API context interface with additional functionality
 */
export interface ApiContextExtendedType {
  isLoading: boolean;
  error: string | null;
  sectors: Sector[];
  loading: boolean;
  pendingSectors: Sector[];
  inProgressSectors: Sector[];
  qualityCheckSectors: Sector[];
  completedSectors: Sector[];
  refreshData: () => Promise<void>;
  
  // Métodos específicos para setores
  addSector: (sectorData: Omit<Sector, 'id'>) => Promise<string>;
  updateSector: (sectorId: string, sectorData: Partial<Sector>) => Promise<boolean>;
  getSectorById: (id: string) => Promise<Sector | undefined>;
  getSectorsByTag: (tagNumber: string) => Promise<Sector[]>;
  createSector: (sector: Omit<Sector, 'id'>) => Promise<Sector>;
  deleteSector: (id: string) => Promise<void>;
  
  // Métodos para uploads e serviços
  uploadPhoto: (file: File, folder?: string) => Promise<string>;
  updateServicePhotos: (sectorId: string, serviceId: string, photoUrl: string, type: 'before' | 'after') => Promise<boolean>;
  getDefaultServices: () => Promise<Service[]>;
}
