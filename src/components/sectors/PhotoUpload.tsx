
import React, { useRef, useState } from 'react';
import { PhotoWithFile } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Plus, Camera, Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

interface PhotoUploadProps {
  photos: PhotoWithFile[];
  onChange: (files: FileList) => void;
  disabled?: boolean;
  title?: string;
  required?: boolean;
  onCameraCapture?: (e: React.MouseEvent) => void;
  allowRemove?: boolean;
  onRemove?: (photoId: string) => void;
}

export default function PhotoUpload({ 
  photos, 
  onChange, 
  disabled = false, 
  title = "Adicionar fotos", 
  required = false,
  onCameraCapture,
  allowRemove = false,
  onRemove
}: PhotoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const handleClick = () => {
    if (disabled) return;
    fileInputRef.current?.click();
  };

  // Função para obter URL segura da foto, seja arquivo ou URL
  const getPhotoUrl = (photo: PhotoWithFile): string => {
    if (photo.url) {
      return photo.url;
    } else if (photo.file instanceof File) {
      return URL.createObjectURL(photo.file);
    }
    return '/placeholder.svg'; // URL de fallback em caso de falha
  };
  
  // Função para lidar com erros de carregamento de imagem
  const handleImageError = (photoId: string) => {
    setImageErrors(prev => ({
      ...prev,
      [photoId]: true
    }));
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {photos && photos.map((photo, index) => {
          const photoUrl = getPhotoUrl(photo);
          const photoId = photo.id || `temp-${index}`;
          const hasError = imageErrors[photoId];
          
          return (
            <div key={photoId} className="relative group">
              <Dialog>
                <DialogTrigger asChild>
                  <div className="cursor-pointer">
                    {hasError ? (
                      <div className="w-20 h-20 flex items-center justify-center rounded-md border bg-gray-100">
                        <span className="text-xs text-gray-500 text-center px-1">Erro ao carregar</span>
                      </div>
                    ) : (
                      <img
                        src={photoUrl}
                        alt={`Foto ${index + 1}`}
                        className="w-20 h-20 rounded-md object-cover border"
                        onError={() => handleImageError(photoId)}
                      />
                    )}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-30 rounded-md">
                      <Eye className="h-5 w-5 text-white" />
                    </div>
                  </div>
                </DialogTrigger>
                <DialogContent className="max-w-3xl p-0 overflow-hidden">
                  <div className="relative">
                    {hasError ? (
                      <div className="w-full h-[80vh] flex items-center justify-center bg-gray-100">
                        <span className="text-gray-500">Não foi possível carregar a imagem</span>
                      </div>
                    ) : (
                      <img 
                        src={photoUrl} 
                        alt={`Visualização da foto ${index + 1}`} 
                        className="w-full h-auto max-h-[80vh] object-contain"
                        onError={() => handleImageError(photoId)}
                      />
                    )}
                    {allowRemove && onRemove && (
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={() => onRemove(photo.id || '')}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          );
        })}
        
        <Button
          type="button"
          variant="outline"
          className="w-20 h-20 border-dashed flex flex-col items-center justify-center"
          onClick={handleClick}
          disabled={disabled}
        >
          <Plus className="h-5 w-5 mb-1" />
          <span className="text-xs">Foto</span>
        </Button>
      </div>
      
      {onCameraCapture && (
        <div className="flex space-x-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onCameraCapture}
            disabled={disabled}
          >
            <Camera className="h-4 w-4 mr-1" />
            Câmera
          </Button>
        </div>
      )}
      
      <Input
        type="file"
        ref={fileInputRef}
        onChange={(e) => e.target.files && onChange(e.target.files)}
        accept="image/*"
        className="hidden"
        multiple
        disabled={disabled}
      />
    </div>
  );
}
