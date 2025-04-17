
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
}
