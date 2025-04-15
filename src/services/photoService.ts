
import { supabase } from "@/integrations/supabase/client";
import { Photo } from "@/types";
import { toast } from "sonner";

/**
 * Service to manage photos for sectors
 */
export const photoService = {
  /**
   * Updates photos for a specific service
   */
  updateServicePhotos: async (
    sectorId: string,
    serviceId: string,
    photoUrl: string,
    type: 'before' | 'after'
  ): Promise<boolean> => {
    try {
      // First get the current user
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        console.error("Error getting user for photo:", userError);
        return false;
      }

      // Find the current cycle for this sector
      const { data: cycleData, error: cycleError } = await supabase
        .from('cycles')
        .select('id')
        .eq('sector_id', sectorId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
        
      if (cycleError) {
        console.error("Error finding cycle for photo:", cycleError);
        return false;
      }
      
      // Then insert the photo with service association and user ID
      const { data: photoData, error: photoError } = await supabase
        .from('photos')
        .insert({
          cycle_id: cycleData.id,
          service_id: serviceId,
          url: photoUrl,
          type,
          created_by: userData.user.id, // Add the required created_by field
          metadata: {
            sector_id: sectorId,
            service_id: serviceId,
            type
          }
        });
        
      if (photoError) {
        console.error("Error inserting service photo:", photoError);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Error in updateServicePhotos:", error);
      return false;
    }
  },
  
  /**
   * Upload a photo to storage
   */
  uploadPhoto: async (file: File, folder: string = 'general'): Promise<string> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;
      
      const { data, error } = await supabase.storage
        .from('photos')
        .upload(filePath, file);
        
      if (error) throw error;
      
      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('photos')
        .getPublicUrl(filePath);
        
      return urlData.publicUrl;
    } catch (error) {
      console.error("Error uploading photo:", error);
      toast.error("Erro ao fazer upload da foto", {
        description: "Verifique se o arquivo é uma imagem válida."
      });
      throw error;
    }
  }
};

/**
 * Hook to use the photo service
 */
export function usePhotoService() {
  return photoService;
}
