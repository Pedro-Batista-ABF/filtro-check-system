
import React, { useState, useRef, useEffect } from 'react';
import { CameraIcon, Trash, Plus, RefreshCw, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { photoService } from '@/services/photoService';

interface PhotoUploadProps {
  initialPhotos?: string[];
  onPhotosChange: (urls: string[]) => void;
  maxPhotos?: number;
  label?: string;
  disabled?: boolean;
  onCameraCapture?: () => void;
}

export default function PhotoUpload({
  initialPhotos = [],
  onPhotosChange,
  maxPhotos = 5,
  label = "Fotos",
  disabled = false,
  onCameraCapture
}: PhotoUploadProps) {
  const [photos, setPhotos] = useState<string[]>(initialPhotos);
  const [isUploading, setIsUploading] = useState(false);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (JSON.stringify(initialPhotos) !== JSON.stringify(photos)) {
      setPhotos(initialPhotos);
    }
  }, [initialPhotos]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    try {
      setIsUploading(true);
      
      const newPhotos: string[] = [...photos];
      const files = Array.from(e.target.files);
      
      // Check if adding these files would exceed the max limit
      if (newPhotos.length + files.length > maxPhotos) {
        toast.error(`Máximo de ${maxPhotos} fotos permitido`);
        return;
      }
      
      for (const file of files) {
        try {
          // Upload the file and get URL
          const uploadedUrl = await photoService.uploadPhoto(file);
          newPhotos.push(uploadedUrl);
        } catch (error) {
          console.error(`Erro ao fazer upload da foto ${file.name}:`, error);
          toast.error(`Falha ao fazer upload da foto ${file.name}`);
        }
      }
      
      setPhotos(newPhotos);
      onPhotosChange(newPhotos);
    } catch (error) {
      console.error("Erro ao processar fotos:", error);
      toast.error("Erro ao processar fotos");
    } finally {
      setIsUploading(false);
      // Reset the input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemovePhoto = (index: number) => {
    const newPhotos = [...photos];
    newPhotos.splice(index, 1);
    setPhotos(newPhotos);
    onPhotosChange(newPhotos);
  };

  const handleRefreshPhoto = async (url: string, index: number) => {
    try {
      // Try to regenerate the URL
      const regeneratedUrl = await photoService.regeneratePublicUrl(url);
      
      // Update the photos array
      const newPhotos = [...photos];
      newPhotos[index] = regeneratedUrl;
      
      // Update state
      setPhotos(newPhotos);
      onPhotosChange(newPhotos);
      
      // Clear error state for this URL
      setImageErrors(prev => ({
        ...prev,
        [url]: false
      }));
      
      toast.success("Imagem atualizada com sucesso");
    } catch (error) {
      console.error("Erro ao atualizar imagem:", error);
      toast.error("Erro ao atualizar imagem");
    }
  };

  const handleImageError = (url: string) => {
    // Set error state for this URL
    setImageErrors(prev => ({
      ...prev,
      [url]: true
    }));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-xs text-gray-500">
          {photos.length}/{maxPhotos}
        </span>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
        {photos.map((url, index) => (
          <div 
            key={`${url}-${index}`} 
            className="relative border rounded-md overflow-hidden h-24 bg-gray-50 group"
          >
            {imageErrors[url] ? (
              <div className="flex flex-col items-center justify-center h-full p-2">
                <AlertTriangle className="h-6 w-6 text-amber-500 mb-1" />
                <p className="text-xs text-gray-500 text-center">Erro ao carregar</p>
                <Button
                  size="sm"
                  variant="ghost"
                  className="p-1 h-auto mt-1"
                  onClick={() => handleRefreshPhoto(url, index)}
                >
                  <RefreshCw className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <>
                <img 
                  src={url} 
                  alt={`Foto ${index + 1}`} 
                  className="h-full w-full object-cover"
                  onError={() => handleImageError(url)}
                />
                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <Button
                    type="button"
                    size="icon"
                    variant="destructive"
                    className="h-6 w-6"
                    onClick={() => handleRemovePhoto(index)}
                    disabled={disabled}
                  >
                    <Trash className="h-3 w-3" />
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="secondary"
                    className="h-6 w-6"
                    onClick={() => handleRefreshPhoto(url, index)}
                    disabled={disabled}
                  >
                    <RefreshCw className="h-3 w-3" />
                  </Button>
                </div>
              </>
            )}
          </div>
        ))}
        
        {photos.length < maxPhotos && !disabled && (
          <div className="border border-dashed rounded-md h-24 flex flex-col items-center justify-center">
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              multiple={true}
              onChange={handleFileChange}
              disabled={isUploading || disabled}
            />
            
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading || disabled}
              className="h-auto py-1"
            >
              {isUploading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4 mr-1" />
              )}
              <span className="text-xs">Adicionar</span>
            </Button>
            
            {onCameraCapture && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onCameraCapture}
                disabled={isUploading || disabled}
                className="h-auto py-1 mt-1"
              >
                <CameraIcon className="h-4 w-4 mr-1" />
                <span className="text-xs">Câmera</span>
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
