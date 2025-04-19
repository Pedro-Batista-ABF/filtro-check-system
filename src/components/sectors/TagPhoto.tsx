
import { Sector } from "@/types";
import { useEffect, useState } from "react";
import { addNoCacheParam } from "@/utils/photoUtils";
import { Loader2, RefreshCw, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { photoService } from "@/services/photoService";

interface TagPhotoProps {
  sector: Sector;
}

export default function TagPhoto({ sector }: TagPhotoProps) {
  const [imgError, setImgError] = useState(false);
  const [imgUrl, setImgUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  useEffect(() => {
    // Reset states when sector changes
    setImgError(false);
    setIsLoading(true);
    
    // Carregar imagem diretamente
    if (sector.tagPhotoUrl) {
      // Adicionar parâmetro para evitar cache
      const noCacheUrl = addNoCacheParam(sector.tagPhotoUrl);
      setImgUrl(noCacheUrl);
    }
    
    setIsLoading(false);
  }, [sector.tagPhotoUrl, sector.id]);

  const handleImageError = async () => {
    console.warn("Erro ao carregar imagem diretamente:", imgUrl);
    setImgError(true);
    
    // Tentar alternativas automaticamente
    if (sector.tagPhotoUrl) {
      try {
        // Tentar regenerar URL
        const regeneratedUrl = photoService.regeneratePublicUrl(sector.tagPhotoUrl);
        if (regeneratedUrl && regeneratedUrl !== sector.tagPhotoUrl) {
          console.log("Tentando URL regenerada:", regeneratedUrl);
          setImgUrl(addNoCacheParam(regeneratedUrl));
          setImgError(false);
          return;
        }
        
        // Se regeneração falhou, tentar download direto
        const downloadUrl = await photoService.downloadPhoto(sector.tagPhotoUrl);
        if (downloadUrl) {
          console.log("Usando URL de download direto como fallback");
          setImgUrl(downloadUrl);
          setImgError(false);
        }
      } catch (error) {
        console.error("Falha no fallback da foto da TAG:", error);
      }
    }
  };
  
  const handleRefresh = async () => {
    if (!sector.tagPhotoUrl) return;
    
    setIsRefreshing(true);
    setImgError(false);
    
    try {
      // Tentar URL direta com parâmetro de cache
      const directUrl = addNoCacheParam(sector.tagPhotoUrl);
      setImgUrl(directUrl);
      
      // Tentar regenerar URL
      const regeneratedUrl = photoService.regeneratePublicUrl(sector.tagPhotoUrl);
      if (regeneratedUrl) {
        setImgUrl(addNoCacheParam(regeneratedUrl));
        toast.success("Imagem atualizada com sucesso");
        return;
      }
      
      // Tentar download direto como último recurso
      const downloadUrl = await photoService.downloadPhoto(sector.tagPhotoUrl);
      if (downloadUrl) {
        setImgUrl(downloadUrl);
        setImgError(false);
        toast.success("Imagem recuperada do armazenamento");
      } else {
        toast.error("Não foi possível recuperar a imagem");
        setImgError(true);
      }
    } catch (error) {
      console.error("Erro ao atualizar imagem:", error);
      toast.error("Erro ao atualizar imagem");
      setImgError(true);
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
    <div className="rounded-md overflow-hidden border relative group">
      <img
        src={imgUrl}
        alt={`Foto da TAG ${sector.tagNumber}`}
        className="w-full h-auto max-h-40 object-contain bg-gray-50"
        onError={handleImageError}
      />
      <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button 
          variant="outline" 
          size="icon" 
          className="h-8 w-8 bg-white/90 hover:bg-white"
          onClick={handleRefresh}
          disabled={isRefreshing}
          title="Recarregar imagem"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </Button>
      </div>
    </div>
  );
}
