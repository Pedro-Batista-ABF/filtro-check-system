
import { supabaseService } from "@/services/supabase";
import { photoService } from "@/services/photoService";
import { Sector } from "@/types";

/**
 * Service functions for the extended API context
 */
export const extendedApiService = {
  /**
   * Get sector by ID
   */
  getSectorById: async (id: string): Promise<Sector | undefined> => {
    try {
      return await supabaseService.getSectorById(id);
    } catch (error) {
      console.error(`Error fetching sector ${id}:`, error);
      return undefined;
    }
  },

  /**
   * Get sectors by tag number
   */
  getSectorsByTag: async (tagNumber: string): Promise<Sector[]> => {
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
  },

  /**
   * Upload a photo
   */
  uploadPhoto: async (file: File, folder: string = 'general'): Promise<string> => {
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
  },

  /**
   * Update service photos
   */
  updateServicePhotos: async (
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
  },

  /**
   * Fetch all sectors
   */
  getAllSectors: async (): Promise<Sector[]> => {
    try {
      console.log("Fetching all sectors...");
      const result = await supabaseService.getAllSectors();
      console.log("Fetched sectors:", result);
      return result || [];
    } catch (error) {
      console.error("Error fetching sectors:", error);
      throw error;
    }
  }
};
