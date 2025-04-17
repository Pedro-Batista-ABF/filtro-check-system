
import React, { useRef } from 'react';
import { Photo, PhotoWithFile } from '@/types';
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

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  // Função para obter URL segura da foto, seja arquivo ou URL
  const getPhotoUrl = (photo: PhotoWithFile): string => {
    if (photo.url) {
      return photo.url;
    } else if (photo.file instanceof File) {
      return URL.createObjectURL(photo.file);
    }
    return ''; // URL vazia caso não seja possível obter
  };
  
  // Função para lidar com erros de carregamento de imagem
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    target.src = '/placeholder.svg'; // URL de imagem de fallback
    
    // Adicionar classe para indicar erro
    target.classList.add('error-image');
    target.classList.add('bg-red-50');
    target.classList.add('border-red-200');
    
    // Adicionar texto de erro
    target.alt = 'Erro ao carregar imagem';
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {photos && photos.map((photo, index) => {
          const photoUrl = getPhotoUrl(photo);
          if (!photoUrl) return null;
          
          return (
            <div key={photo.id || `temp-${index}`} className="relative group">
              <Dialog>
                <DialogTrigger asChild>
                  <div className="cursor-pointer">
                    <img
                      src={photoUrl}
                      alt={`Foto ${index + 1}`}
                      className="w-20 h-20 rounded-md object-cover border"
                      onError={handleImageError}
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-30 rounded-md">
                      <Eye className="h-5 w-5 text-white" />
                    </div>
                  </div>
                </DialogTrigger>
                <DialogContent className="max-w-3xl p-0 overflow-hidden">
                  <div className="relative">
                    <img 
                      src={photoUrl} 
                      alt={`Visualização da foto ${index + 1}`} 
                      className="w-full h-auto max-h-[80vh] object-contain"
                      onError={handleImageError}
                    />
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
