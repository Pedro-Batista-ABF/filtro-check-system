
import React, { useState, useEffect } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Camera, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { photoService } from "@/services/photoService";
import { isValidUrl } from "@/utils/photoUtils";

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
    // Verificar se a URL da foto é válida quando o componente monta ou a URL muda
    if (tagPhotoUrl) {
      setVerifying(true);
      
      const verifyPhoto = async () => {
        if (!isValidUrl(tagPhotoUrl)) {
          setPreviewError(true);
          setVerifying(false);
          return;
        }
        
        try {
          const isAccessible = await photoService.verifyPhotoUrl(tagPhotoUrl);
          
          if (isAccessible) {
            setPreviewUrl(tagPhotoUrl);
            setPreviewError(false);
          } else {
            // Tentar regenerar URL
            const regeneratedUrl = photoService.regeneratePublicUrl(tagPhotoUrl);
            if (regeneratedUrl) {
              setPreviewUrl(regeneratedUrl);
              setPreviewError(false);
            } else {
              setPreviewError(true);
            }
          }
        } catch (error) {
          console.error("Erro ao verificar URL da foto da TAG:", error);
          setPreviewError(true);
        } finally {
          setVerifying(false);
        }
      };
      
      verifyPhoto();
    } else {
      setPreviewUrl(undefined);
      setPreviewError(false);
    }
  }, [tagPhotoUrl]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setUploading(true);
    try {
      const newUrl = await onPhotoUpload(e.target.files);
      if (newUrl) {
        setPreviewUrl(newUrl);
        setPreviewError(false);
      } else {
        throw new Error("Erro ao obter URL da foto");
      }
    } catch (error) {
      console.error('Erro ao fazer upload da foto da TAG:', error);
      toast.error("Erro ao fazer upload da foto da TAG");
      setPreviewError(true);
    } finally {
      setUploading(false);
    }
  };

  const handleImageError = async () => {
    if (previewUrl) {
      setPreviewError(true);
      
      // Tentar carregar a imagem diretamente como fallback
      try {
        const directUrl = await photoService.downloadPhoto(previewUrl);
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
      // Tentar regenerar URL
      const regeneratedUrl = photoService.regeneratePublicUrl(tagPhotoUrl);
      
      if (regeneratedUrl) {
        const isAccessible = await photoService.verifyPhotoUrl(regeneratedUrl);
        
        if (isAccessible) {
          setPreviewUrl(regeneratedUrl);
          setPreviewError(false);
          toast.success("Imagem recarregada com sucesso");
        } else {
          // Tentar download direto
          const directUrl = await photoService.downloadPhoto(tagPhotoUrl);
          
          if (directUrl) {
            setPreviewUrl(directUrl);
            setPreviewError(false);
            toast.success("Imagem carregada via download direto");
          } else {
            setPreviewError(true);
            toast.error("Não foi possível carregar a imagem");
          }
        }
      } else {
        setPreviewError(true);
        toast.error("Não foi possível regenerar a URL da imagem");
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
