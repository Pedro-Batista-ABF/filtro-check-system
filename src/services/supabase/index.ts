
import { sectorService } from './sectorService';
import { serviceTypeService } from './serviceTypeService';
import { photoService } from './photoService';

// Implementação da função getSectorsByTag
const getSectorsByTag = async (tagNumber: string) => {
  try {
    console.log("Searching for sectors with tag:", tagNumber);
    // Utiliza a função getAllSectors para buscar todos os setores
    // e filtra pelo número da TAG
    const allSectors = await sectorService.getAllSectors();
    console.log("Total sectors found:", allSectors.length);
    
    const filteredSectors = allSectors.filter(sector => 
      sector.tagNumber.toLowerCase().includes(tagNumber.toLowerCase())
    );
    
    console.log("Filtered sectors:", filteredSectors.length);
    return filteredSectors;
  } catch (error) {
    console.error("Erro ao buscar setores por TAG:", error);
    return [];
  }
};

// Export all the services
export const supabaseService = {
  ...sectorService,
  ...serviceTypeService,
  ...photoService,
  getSectorsByTag // Adiciona o método getSectorsByTag
};
