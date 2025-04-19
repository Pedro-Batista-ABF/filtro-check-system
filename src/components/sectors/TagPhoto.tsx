
import { Sector } from "@/types";
import { useEffect, useState } from "react";
import { addNoCacheParam, fixDuplicatedStoragePath, isDataUrl } from "@/utils/photoUtils";
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
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;
  
  // Função para preparar URL da imagem
  const prepareImageUrl = (url?: string): string => {
    if (!url) return "";
    
    // Se for URL de dados, retornar diretamente
    if (isDataUrl(url)) return url;
    
    // Corrigir possíveis problemas e adicionar anti-cache
    const fixedUrl = fixDuplicatedStoragePath(url);
    return addNoCacheParam(fixedUrl);
  };
  
  useEffect(() => {
    // Reset states when sector changes
    setImgError(false);
    setIsLoading(true);
    setRetryCount(0);
    
    // Carregar imagem diretamente
    if (sector.tagPhotoUrl) {
      setImgUrl(prepareImageUrl(sector.tagPhotoUrl));
    } else {
      setImgUrl("");
    }
    
    setIsLoading(false);
  }, [sector.tagPhotoUrl, sector.id]);

  const handleImageError = async () => {
    console.warn("Erro ao carregar imagem diretamente:", imgUrl);
    
    // Se já tentamos muitas vezes, desistir
    if (retryCount >= maxRetries) {
      console.warn(`Excedido número máximo de tentativas (${maxRetries})`);
      setImgError(true);
      return;
    }
    
    setRetryCount(prev => prev + 1);
    
    // Tentar alternativas automaticamente
    if (sector.tagPhotoUrl) {
      try {
        // Tentar regenerar URL
        const regeneratedUrl = photoService.regeneratePublicUrl(sector.tagPhotoUrl);
        if (regeneratedUrl && regeneratedUrl !== sector.tagPhotoUrl) {
          console.log("Tentando URL regenerada:", regeneratedUrl);
          setImgUrl(addNoCacheParam(regeneratedUrl));
          // Não resetar o erro até que a imagem carregue com sucesso
          return;
        }
        
        // Se regeneração falhou, tentar download direto
        const downloadUrl = await photoService.downloadPhoto(sector.tagPhotoUrl);
        if (downloadUrl) {
          console.log("Usando URL de download direto como fallback");
          setImgUrl(downloadUrl);
          setImgError(false);
          return;
        }
        
        setImgError(true);
      } catch (error) {
        console.error("Falha no fallback da foto da TAG:", error);
        setImgError(true);
      }
    } else {
      setImgError(true);
    }
  };
  
  const handleRefresh = async () => {
    if (!sector.tagPhotoUrl) return;
    
    setIsRefreshing(true);
    setImgError(false);
    setRetryCount(0);
    
    try {
      // Se for URL de dados, não precisa recarregar
      if (isDataUrl(sector.tagPhotoUrl)) {
        setImgUrl(sector.tagPhotoUrl);
        setImgError(false);
        toast.success("Imagem atualizada com sucesso");
        return;
      }
      
      // Corrigir possíveis problemas na URL
      const fixedUrl = fixDuplicatedStoragePath(sector.tagPhotoUrl);
      
      // Verificar se a URL é acessível diretamente
      const isAccessible = await photoService.verifyPhotoUrl(fixedUrl);
      
      if (isAccessible) {
        setImgUrl(addNoCacheParam(fixedUrl));
        setImgError(false);
        toast.success("Imagem atualizada com sucesso");
        return;
      }
      
      // Tentar regenerar URL
      const regeneratedUrl = photoService.regeneratePublicUrl(fixedUrl);
      if (regeneratedUrl) {
        setImgUrl(addNoCacheParam(regeneratedUrl));
        setImgError(false);
        toast.success("Imagem atualizada com sucesso");
        return;
      }
      
      // Tentar download direto como último recurso
      const downloadUrl = await photoService.downloadPhoto(fixedUrl);
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
