
import React, { useState, useEffect } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Camera, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Image } from "@/components/ui/image";

interface TagPhotoFieldProps {
  tagPhotoUrl?: string;
  onPhotoUpload: (files: FileList) => Promise<string | undefined>;
  onCameraCapture: (e: React.MouseEvent) => void;
  error?: boolean;
  required?: boolean;
  disabled?: boolean;
}

export function TagPhotoField({
  tagPhotoUrl,
  onPhotoUpload,
  onCameraCapture,
  error = false,
  required = false,
  disabled = false
}: TagPhotoFieldProps) {
  const [uploading, setUploading] = useState(false);
  const [localPhotoUrl, setLocalPhotoUrl] = useState<string | undefined>(tagPhotoUrl);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Update local URL when prop changes
  useEffect(() => {
    if (tagPhotoUrl !== localPhotoUrl) {
      console.log("TagPhotoField: tagPhotoUrl changed:", tagPhotoUrl);
      setLocalPhotoUrl(tagPhotoUrl);
    }
  }, [tagPhotoUrl]);
  
  // Simular progresso de upload para feedback visual
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (uploading) {
      setUploadProgress(0);
      
      timer = setInterval(() => {
        setUploadProgress(prev => {
          // Limite o progresso a 95% até que o upload seja confirmado
          if (prev < 95) {
            return prev + 5;
          }
          return prev;
        });
      }, 200);
    } else if (uploadProgress > 0) {
      setUploadProgress(100);
      timer = setTimeout(() => {
        setUploadProgress(0);
      }, 800);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [uploading]);
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setUploading(true);
    try {
      console.log("Iniciando upload da foto da TAG...");
      
      // Verificar tamanho do arquivo (10MB max)
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Arquivo muito grande", {
          description: "O tamanho máximo permitido é 10MB"
        });
        return;
      }
      
      // Chamar a função de upload passada via props
      const result = await onPhotoUpload(e.target.files);
      
      // Verificar se temos um resultado válido
      if (!result) {
        throw new Error("Nenhuma URL retornada pelo upload");
      }
      
      setLocalPhotoUrl(result);
      console.log("Upload concluído com sucesso, URL:", result);
      toast.success("Foto da TAG carregada com sucesso");
    } catch (error) {
      console.error('Erro ao fazer upload da foto da TAG:', error);
      toast.error("Erro ao fazer upload da foto da TAG");
    } finally {
      setUploading(false);
    }
  };

  const handleImageLoadSuccess = () => {
    console.log("Imagem da TAG carregada com sucesso");
  };

  const handleImageLoadError = (error: any) => {
    console.error("Erro ao carregar imagem da TAG:", error);
    toast.error("Erro ao carregar imagem da TAG");
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="tagPhoto" className={error ? "text-red-500" : ""}>
        Foto da TAG
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <div className="flex space-x-2">
        <div className="relative flex-1">
          <Input
            id="tagPhoto"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className={`flex-1 ${error ? "border-red-500" : ""}`}
            disabled={uploading || disabled}
          />
          {uploading && uploadProgress > 0 && (
            <div className="absolute bottom-0 left-0 w-full bg-gray-200 h-1">
              <div 
                className="bg-primary h-1 transition-all" 
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}
        </div>
        <Button 
          variant="outline" 
          size="icon"
          onClick={onCameraCapture}
          title="Usar câmera"
          disabled={uploading || disabled}
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
        </Button>
      </div>
      
      {uploading && (
        <div className="flex items-center text-sm text-muted-foreground">
          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
          <span>Fazendo upload... {uploadProgress}%</span>
        </div>
      )}
      
      {(localPhotoUrl || tagPhotoUrl) && !uploading && (
        <div className="mt-2">
          <Image 
            src={localPhotoUrl || tagPhotoUrl} 
            alt="TAG do Setor" 
            className="w-32 h-32 object-cover rounded-md border"
            fallbackSrc="/placeholder-image.png"
            showRefresh={true}
            onLoadSuccess={handleImageLoadSuccess}
            onLoadError={handleImageLoadError}
          />
        </div>
      )}
      
      {error && !tagPhotoUrl && !localPhotoUrl && (
        <p className="text-xs text-red-500">Foto da TAG é obrigatória</p>
      )}
    </div>
  );
}
