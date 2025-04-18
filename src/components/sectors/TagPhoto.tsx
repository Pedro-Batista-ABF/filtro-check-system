
import { Sector } from "@/types";
import { useEffect, useState } from "react";
import { photoService } from "@/services/photoService";
import { isValidUrl } from "@/utils/photoUtils";
import { Loader2 } from "lucide-react";

interface TagPhotoProps {
  sector: Sector;
}

export default function TagPhoto({ sector }: TagPhotoProps) {
  const [imgError, setImgError] = useState(false);
  const [imgUrl, setImgUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [fallbackAttempted, setFallbackAttempted] = useState(false);
  
  useEffect(() => {
    // Reset states when sector changes
    setImgError(false);
    setIsLoading(true);
    setFallbackAttempted(false);
    
    async function loadImage() {
      if (!sector.tagPhotoUrl) {
        setIsLoading(false);
        return;
      }
      
      // Validate URL format
      if (!isValidUrl(sector.tagPhotoUrl)) {
        console.error("URL da foto da TAG é inválida:", sector.tagPhotoUrl);
        setImgError(true);
        setIsLoading(false);
        return;
      }
      
      try {
        // Verify if the URL is accessible
        const isAccessible = await photoService.verifyPhotoUrl(sector.tagPhotoUrl);
        
        if (isAccessible) {
          setImgUrl(sector.tagPhotoUrl);
          setImgError(false);
        } else {
          console.warn("URL da foto da TAG não é acessível, tentando regenerar...");
          
          // Try to regenerate URL
          const regeneratedUrl = photoService.regeneratePublicUrl(sector.tagPhotoUrl);
          
          if (regeneratedUrl) {
            console.log("URL regenerada:", regeneratedUrl);
            setImgUrl(regeneratedUrl);
            setImgError(false);
          } else {
            setImgError(true);
          }
        }
      } catch (error) {
        console.error("Erro ao verificar URL da foto da TAG:", error);
        setImgError(true);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadImage();
  }, [sector.tagPhotoUrl, sector.id]);

  const handleImageError = async () => {
    console.log("Erro ao carregar foto da TAG:", imgUrl);
    
    // Only attempt fallback once to prevent infinite loops
    if (!fallbackAttempted && sector.tagPhotoUrl) {
      setFallbackAttempted(true);
      setIsLoading(true);
      
      try {
        // Try direct download as a fallback
        const downloadUrl = await photoService.downloadPhoto(sector.tagPhotoUrl);
        
        if (downloadUrl) {
          console.log("Usando URL de download direto como fallback");
          setImgUrl(downloadUrl);
          setImgError(false);
        } else {
          setImgError(true);
        }
      } catch (error) {
        console.error("Falha no fallback da foto da TAG:", error);
        setImgError(true);
      } finally {
        setIsLoading(false);
      }
    } else {
      setImgError(true);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-gray-100 border rounded-md flex items-center justify-center h-40">
        <Loader2 className="h-6 w-6 text-gray-400 animate-spin" />
      </div>
    );
  }

  if (!sector.tagPhotoUrl || imgError) {
    return (
      <div className="bg-gray-100 border rounded-md flex items-center justify-center h-40">
        <p className="text-gray-500 text-sm">Sem foto da TAG</p>
      </div>
    );
  }

  return (
    <div className="rounded-md overflow-hidden border">
      <img
        src={imgUrl}
        alt={`Foto da TAG ${sector.tagNumber}`}
        className="w-full h-auto max-h-40 object-contain bg-gray-50"
        onError={handleImageError}
      />
    </div>
  );
}
