
import { Sector, Service } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { sectorService } from "./sectorService";
import { photoService } from "@/services/supabase/photoService";

export const supabaseServices = {
  // Sectors
  getAllSectors: sectorService.getAllSectors,
  getSectorById: sectorService.getSectorById,
  addSector: sectorService.addSector,
  updateSector: sectorService.updateSector,
  deleteSector: sectorService.deleteSector,
  
  // Get default services
  getDefaultServices: async (): Promise<Service[]> => {
    try {
      const { data, error } = await supabase
        .from('service_types')
        .select('*')
        .order('name');
        
      if (error) throw error;
      
      return data.map(service => ({
        id: service.id,
        name: service.name,
        selected: false,
        type: service.id,
        description: service.description
      }));
    } catch (error) {
      console.error("Error getting default services:", error);
      return [];
    }
  },
  
  // Add getSectorsByTag function
  getSectorsByTag: async (tagNumber: string): Promise<Sector[]> => {
    try {
      const { data, error } = await supabase
        .from('sectors')
        .select('*')
        .ilike('tag_number', `%${tagNumber}%`)
        .order('tag_number');
        
      if (error) throw error;
      
      // Process each sector to get complete data
      const sectors: Sector[] = [];
      for (const sector of data) {
        try {
          const completeData = await sectorService.getSectorById(sector.id);
          if (completeData) {
            sectors.push(completeData);
          }
        } catch (err) {
          console.error(`Error getting complete data for sector ${sector.id}:`, err);
        }
      }
      
      return sectors;
    } catch (error) {
      console.error("Error searching sectors by tag:", error);
      return [];
    }
  },
  
  // Photos
  uploadPhoto: photoService.uploadPhoto
};
