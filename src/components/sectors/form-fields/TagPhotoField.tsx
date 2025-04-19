
import React, { useState, useEffect } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Camera, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { photoService } from "@/services/photoService";
import { isValidUrl, addNoCacheParam } from "@/utils/photoUtils";

interface TagPhotoFieldProps {
  tagPhotoUrl?: string;
  onPhotoUpload: (files: FileList) => Promise<string | undefined>;
  onCameraCapture: (e: React.MouseEvent) => void;
  error?: boolean;
  required?: boolean;
}

export function TagPhotoField({
  tagPhotoUrl,
  onPhotoUpload,
  onCameraCapture,
  error = false,
  required = false
}: TagPhotoFieldProps) {
  const [uploading, setUploading] = useState(false);
  const [previewError, setPreviewError] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(tagPhotoUrl);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    // Quando a URL muda, atualizar a preview diretamente sem verificações demoradas
    if (tagPhotoUrl) {
      try {
        // Simplesmente definir a URL com cache-busting para evitar cache
        setPreviewUrl(addNoCacheParam(tagPhotoUrl));
        setPreviewError(false);
      } catch (error) {
        console.error("Erro ao processar URL da tag:", error);
        setPreviewError(true);
      }
    } else {
      setPreviewUrl(undefined);
      setPreviewError(false);
    }
  }, [tagPhotoUrl]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setUploading(true);
    try {
      // Chamar a função de upload passada via props
      const result = await onPhotoUpload(e.target.files);
      
      // Verificar se temos um resultado válido
      if (!result) {
        throw new Error("Nenhuma URL retornada pelo upload");
      }
      
      // Atualizar a preview com a nova URL
      setPreviewUrl(addNoCacheParam(result));
      setPreviewError(false);
    } catch (error) {
      console.error('Erro ao fazer upload da foto da TAG:', error);
      toast.error("Erro ao fazer upload da foto da TAG");
      setPreviewError(true);
    } finally {
      setUploading(false);
    }
  };

  const handleImageError = async () => {
    setPreviewError(true);
    
    // Tentar carregar a imagem diretamente como fallback
    if (tagPhotoUrl) {
      try {
        // Tentar regenerar a URL e tentar novamente
        const regeneratedUrl = photoService.regeneratePublicUrl(tagPhotoUrl);
        if (regeneratedUrl) {
          console.log("URL regenerada:", regeneratedUrl);
          setPreviewUrl(addNoCacheParam(regeneratedUrl));
          return; // Tentar carregar novamente com a URL regenerada
        }
        
        // Se não conseguir regenerar, tentar download direto
        const directUrl = await photoService.downloadPhoto(tagPhotoUrl);
        if (directUrl) {
          setPreviewUrl(directUrl);
          setPreviewError(false);
        }
      } catch (error) {
        console.error("Erro ao carregar imagem como fallback:", error);
      }
    }
  };
  
  const handleRefreshPreview = async () => {
    if (!tagPhotoUrl) return;
    
    setVerifying(true);
    setPreviewError(false);
    
    try {
      // Tentar regenerar URL primeiro
      const regeneratedUrl = photoService.regeneratePublicUrl(tagPhotoUrl);
      
      if (regeneratedUrl) {
        setPreviewUrl(addNoCacheParam(regeneratedUrl));
        setPreviewError(false);
        toast.success("Imagem recarregada com sucesso");
        return;
      }
      
      // Se não conseguir regenerar, tentar download direto
      const directUrl = await photoService.downloadPhoto(tagPhotoUrl);
      
      if (directUrl) {
        setPreviewUrl(directUrl);
        setPreviewError(false);
        toast.success("Imagem carregada via download direto");
      } else {
        setPreviewError(true);
        toast.error("Não foi possível carregar a imagem");
      }
    } catch (error) {
      console.error("Erro ao recarregar preview:", error);
      setPreviewError(true);
      toast.error("Erro ao recarregar imagem");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="tagPhoto" className={error ? "text-red-500" : ""}>
        Foto do TAG
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <div className="flex space-x-2">
        <Input
          id="tagPhoto"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className={`flex-1 ${error ? "border-red-500" : ""}`}
          disabled={uploading || verifying}
        />
        <Button 
          variant="outline" 
          size="icon"
          onClick={onCameraCapture}
          title="Usar câmera"
          disabled={uploading || verifying}
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
        </Button>
      </div>
      
      {previewUrl && !previewError && (
        <div className="mt-2 relative">
          <img 
            src={previewUrl} 
            alt="TAG do Setor" 
            className="w-32 h-32 object-cover rounded-md border"
            onError={handleImageError}
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-1 right-1 bg-white/80 hover:bg-white"
            onClick={handleRefreshPreview}
            disabled={verifying}
            title="Recarregar imagem"
          >
            <RefreshCw className={`h-4 w-4 ${verifying ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      )}
      
      {verifying && (
        <div className="mt-2 flex items-center text-sm text-gray-500">
          <Loader2 className="h-3 w-3 mr-2 animate-spin" />
          Verificando imagem...
        </div>
      )}
      
      {previewError && (
        <div className="mt-2">
          <div className="text-sm text-red-500 mb-2">
            Não foi possível carregar a prévia da imagem.
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshPreview}
            disabled={verifying}
            className="w-full"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${verifying ? 'animate-spin' : ''}`} />
            Tentar recarregar
          </Button>
        </div>
      )}
      
      {error && !previewError && (
        <p className="text-xs text-red-500">Foto do TAG é obrigatória</p>
      )}
    </div>
  );
}
