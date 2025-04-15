
import { Photo, PhotoWithFile } from "@/types";
import { useState } from "react";
import { toast } from "sonner";
import { useApi } from "@/contexts/ApiContextExtended";
import { supabase } from "@/integrations/supabase/client";

export function usePhotosManagement(cycleId?: string) {
  const [photos, setPhotos] = useState<PhotoWithFile[]>([]);
  const { refreshData } = useApi();

  const handlePhotosUpdate = async (photos: Photo[], type: 'before' | 'after' | 'scrap') => {
    if (!cycleId) return [];
    
    try {
      const { data: existingPhotos } = await supabase
        .from('photos')
        .select('url')
        .eq('cycle_id', cycleId)
        .eq('type', type);
        
      const existingUrls = (existingPhotos || []).map(p => p.url);
      const newPhotos = photos.filter(photo => !existingUrls.includes(photo.url));
      
      return newPhotos;
    } catch (error) {
      console.error(`Error updating ${type} photos:`, error);
      toast.error(`Error updating ${type} photos`);
      return [];
    }
  };

  return {
    photos,
    setPhotos,
    handlePhotosUpdate
  };
}
