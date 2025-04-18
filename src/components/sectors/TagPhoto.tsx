
import { Sector } from "@/types";
import { useEffect, useState } from "react";
import { photoService } from "@/services/photoService";
import { isValidUrl, addNoCacheParam } from "@/utils/photoUtils";
import { Loader2, RefreshCw, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface TagPhotoProps {
  sector: Sector;
}

export default function TagPhoto({ sector }: TagPhotoProps) {
  const [imgError, setImgError] = useState(false);
  const [imgUrl, setImgUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
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
        // Add a cache-busting parameter
        const noCacheUrl = addNoCacheParam(sector.tagPhotoUrl);
        
        // Verify if the URL is accessible
        const isAccessible = await photoService.verifyPhotoUrl(noCacheUrl);
        
        if (isAccessible) {
          setImgUrl(noCacheUrl);
          setImgError(false);
        } else {
          console.warn("URL da foto da TAG não é acessível, tentando regenerar...");
          
          // Try to regenerate URL
          const regeneratedUrl = photoService.regeneratePublicUrl(sector.tagPhotoUrl);
          
          if (regeneratedUrl) {
            console.log("URL regenerada:", regeneratedUrl);
            
            // Verify the regenerated URL
            const isRegeneratedAccessible = await photoService.verifyPhotoUrl(regeneratedUrl);
            
            if (isRegeneratedAccessible) {
              setImgUrl(regeneratedUrl);
              setImgError(false);
            } else {
              setImgError(true);
            }
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
        // Try to regenerate the URL first
        const regeneratedUrl = photoService.regeneratePublicUrl(sector.tagPhotoUrl);
        if (regeneratedUrl && regeneratedUrl !== sector.tagPhotoUrl) {
          const isValid = await photoService.verifyPhotoUrl(regeneratedUrl);
          if (isValid) {
            console.log("URL regenerada com sucesso:", regeneratedUrl);
            setImgUrl(regeneratedUrl);
            setImgError(false);
            setIsLoading(false);
            return;
          }
        }
        
        // If regeneration didn't work, try direct download
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
  
  const handleRefresh = async () => {
    if (!sector.tagPhotoUrl) return;
    
    setIsRefreshing(true);
    
    try {
      // Try to regenerate URL
      const regeneratedUrl = photoService.regeneratePublicUrl(sector.tagPhotoUrl);
      if (regeneratedUrl) {
        const isValid = await photoService.verifyPhotoUrl(regeneratedUrl);
        
        if (isValid) {
          setImgUrl(regeneratedUrl);
          setImgError(false);
          toast.success("Imagem atualizada com sucesso");
          return;
        }
      }
      
      // Try direct download as a fallback
      const downloadUrl = await photoService.downloadPhoto(sector.tagPhotoUrl);
      
      if (downloadUrl) {
        setImgUrl(downloadUrl);
        setImgError(false);
        toast.success("Imagem recuperada do armazenamento");
      } else {
        toast.error("Não foi possível recuperar a imagem");
      }
    } catch (error) {
      console.error("Erro ao atualizar imagem:", error);
      toast.error("Erro ao atualizar imagem");
    } finally {
      setIsRefreshing(false);
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
      <div className="bg-gray-100 border rounded-md flex flex-col items-center justify-center h-40">
        <AlertTriangle className="h-6 w-6 text-amber-500 mb-2" />
        <p className="text-gray-500 text-sm mb-2">
          {!sector.tagPhotoUrl ? "Sem foto da TAG" : "Erro ao carregar foto"}
        </p>
        {sector.tagPhotoUrl && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Tentar novamente
          </Button>
        )}
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
