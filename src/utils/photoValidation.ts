
import { Photo } from "@/types";
import { supabase } from "@/integrations/supabase/client";

export const checkPhotoExists = async (url: string): Promise<boolean> => {
  const { data: existingPhoto } = await supabase
    .from('photos')
    .select('id')
    .eq('url', url)
    .maybeSingle();
    
  return !!existingPhoto;
};

export const getServicePhotos = (services: any[] = []): Photo[] => {
  return services
    .filter(service => service.selected)
    .flatMap(service => service.photos || [])
    .filter(photo => photo.url);
};
