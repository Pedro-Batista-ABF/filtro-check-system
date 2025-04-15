
import { Sector, Service, Photo } from "@/types";
import { serviceTypeService } from "./serviceTypeService";
import { photoService } from "./photoService";
import { sectorService } from "./sectorService";

/**
 * Serviço para operações com o Supabase
 */
export const supabaseService = {
  /**
   * Busca todos os setores
   */
  getAllSectors: sectorService.getAllSectors,
  
  /**
   * Busca um setor pelo ID
   */
  getSectorById: sectorService.getSectorById,
  
  /**
   * Busca setores pela TAG
   */
  getSectorsByTag: sectorService.getSectorsByTag,
  
  /**
   * Cria um novo setor
   */
  addSector: sectorService.addSector,
  
  /**
   * Atualiza um setor existente
   */
  updateSector: sectorService.updateSector,
  
  /**
   * Remove um setor
   */
  deleteSector: sectorService.deleteSector,
  
  /**
   * Busca os serviços disponíveis
   */
  getServiceTypes: serviceTypeService.getServiceTypes,
  
  /**
   * Faz upload de uma foto para o bucket do Storage
   */
  uploadPhoto: photoService.uploadPhoto
};

export * from "./photoService";
export * from "./serviceTypeService";
export * from "./sectorService";
export * from "./mappers";
