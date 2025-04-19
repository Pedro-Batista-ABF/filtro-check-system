
import React, { useState, useRef, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { CameraIcon, RefreshCw, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { photoService } from '@/services/photoService';

interface TagPhotoFieldProps {
  tagPhotoUrl?: string;
  onPhotoChange: (url: string) => void;
  error?: boolean;
  disabled?: boolean;
  onCameraCapture?: () => void;
}

export default function TagPhotoField({
  tagPhotoUrl,
  onPhotoChange,
  error = false,
  disabled = false,
  onCameraCapture
}: TagPhotoFieldProps) {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (tagPhotoUrl) {
      setImageUrl(tagPhotoUrl);
      setHasError(false);
    } else {
      setImageUrl('');
    }
  }, [tagPhotoUrl]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }

    const file = e.target.files[0];
    
    try {
      setIsLoading(true);
      setHasError(false);
      
      // Upload the file
      const uploadedUrl = await photoService.uploadPhoto(file, 'tags');
      
      // Update state and notify parent
      setImageUrl(uploadedUrl);
      onPhotoChange(uploadedUrl);
    } catch (error) {
      console.error("Erro ao fazer upload da foto:", error);
      setHasError(true);
      toast.error("Falha ao fazer upload da foto");
    } finally {
      setIsLoading(false);
      // Reset the input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRefresh = async () => {
    if (!tagPhotoUrl) return;
    
    try {
      setIsLoading(true);
      setHasError(false);
      
      // Try to regenerate URL
      const regeneratedUrl = await photoService.regeneratePublicUrl(tagPhotoUrl);
      setImageUrl(regeneratedUrl);
      onPhotoChange(regeneratedUrl);
      
      toast.success("Imagem atualizada com sucesso");
    } catch (error) {
      console.error("Erro ao atualizar imagem:", error);
      setHasError(true);
      toast.error("Erro ao atualizar imagem");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageError = () => {
    setHasError(true);
  };

  return (
    <div>
      <Label className={cn(error ? "text-red-500" : "")}>
        Foto da TAG*
      </Label>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
        <div className="space-y-2">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
            disabled={disabled || isLoading}
          />
          
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || isLoading}
          >
            {isLoading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Carregando...
              </>
            ) : (
              "Selecionar arquivo"
            )}
          </Button>
          
          {onCameraCapture && (
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={onCameraCapture}
              disabled={disabled || isLoading}
            >
              <CameraIcon className="mr-2 h-4 w-4" />
              Usar câmera
            </Button>
          )}
          
          {error && (
            <p className="text-xs text-red-500">Foto da TAG é obrigatória</p>
          )}
        </div>
        
        <div className="bg-gray-50 border rounded-md overflow-hidden h-40 flex items-center justify-center relative">
          {!imageUrl || hasError ? (
            <div className="text-center p-4">
              {hasError ? (
                <div className="flex flex-col items-center">
                  <AlertTriangle className="h-8 w-8 text-amber-500 mb-2" />
                  <p className="text-sm text-gray-500">
                    Não foi possível carregar a imagem
                  </p>
                </div>
              ) : (
                <p className="text-sm text-gray-400">
                  Nenhuma foto selecionada
                </p>
              )}
            </div>
          ) : (
            <>
              <img
                src={imageUrl}
                alt="Foto da TAG"
                className="max-h-40 max-w-full object-contain"
                onError={handleImageError}
              />
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="absolute top-1 right-1 bg-white/70 hover:bg-white/90 h-7 w-7"
                onClick={handleRefresh}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
