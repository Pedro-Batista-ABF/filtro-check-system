
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, RefreshCw } from "lucide-react";
import { useCamera } from '@/hooks/useCamera';
import { useToast } from '@/hooks/use-toast';
import { photoService } from '@/services/photoService';

interface TagPhotoFieldProps {
  value?: string;
  onChange: (url: string) => void;
  onFileChange?: (file: File) => void;
  disabled?: boolean;
  required?: boolean;
}

const TagPhotoField: React.FC<TagPhotoFieldProps> = ({
  value,
  onChange,
  onFileChange,
  disabled = false,
  required = false
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { openCamera, isCameraSupported } = useCamera();
  const { toast } = useToast();

  // Estado para controlar a exibição de imagem
  const [imageError, setImageError] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(value || null);

  // Função para regenerar a URL da imagem
  const regenerateImageUrl = async () => {
    if (!value) return;
    
    try {
      setLoading(true);
      setError(null);
      setImageError(false);
      
      // Utilizar o photoService para regenerar a URL pública
      const regeneratedUrl = await photoService.regeneratePublicUrl(value);
      if (regeneratedUrl) {
        setImageUrl(regeneratedUrl);
      } else {
        setImageError(true);
        setError("Não foi possível carregar a imagem");
      }
    } catch (err) {
      console.error("Erro ao regenerar URL da imagem:", err);
      setImageError(true);
      setError("Erro ao obter URL da imagem");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (value) {
      regenerateImageUrl();
    } else {
      setImageUrl(null);
      setImageError(false);
    }
  }, [value]);

  const handleCameraCapture = async () => {
    if (disabled) return;
    
    try {
      const file = await openCamera();
      if (file) {
        const objectUrl = URL.createObjectURL(file);
        setImageUrl(objectUrl);
        setImageError(false);
        onChange(objectUrl);
        if (onFileChange) {
          onFileChange(file);
        }
      }
    } catch (err) {
      console.error("Erro ao capturar imagem:", err);
      toast({
        title: "Erro",
        description: "Não foi possível capturar a imagem. Verifique se a câmera está disponível.",
        variant: "destructive"
      });
    }
  };

  const handleImageError = () => {
    setImageError(true);
    setError("A imagem não pôde ser carregada");
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="block text-sm font-medium">
          Foto da TAG {required && <span className="text-red-500">*</span>}
        </label>
        {value && imageError && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={regenerateImageUrl}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Recarregar
          </Button>
        )}
      </div>
      
      <Card className={`${disabled ? 'opacity-70' : ''}`}>
        <CardContent className="p-3">
          {imageUrl && !imageError ? (
            <div className="relative">
              <img
                src={imageUrl}
                alt="Foto da TAG"
                className="w-full h-40 object-contain rounded-md"
                onError={handleImageError}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-40 bg-gray-50 rounded-md">
              {error ? (
                <p className="text-sm text-red-500">{error}</p>
              ) : (
                <p className="text-sm text-gray-500">Nenhuma foto da TAG</p>
              )}
            </div>
          )}
          
          {!disabled && isCameraSupported && (
            <Button
              type="button"
              variant="outline"
              className="w-full mt-3"
              onClick={handleCameraCapture}
            >
              <Camera className="h-4 w-4 mr-2" />
              {imageUrl ? "Tirar nova foto" : "Capturar foto da TAG"}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TagPhotoField;
