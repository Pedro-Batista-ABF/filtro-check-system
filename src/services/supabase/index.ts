
import { sectorService } from './sectorService';
import { serviceTypeService } from './serviceTypeService';
import { photoService } from './photoService';

// Implementação da função getSectorsByTag
const getSectorsByTag = async (tagNumber: string) => {
  try {
    // Utiliza a função getAllSectors para buscar todos os setores
    // e filtra pelo número da TAG
    const allSectors = await sectorService.getAllSectors();
    return allSectors.filter(sector => 
      sector.tagNumber.toLowerCase().includes(tagNumber.toLowerCase())
    );
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
