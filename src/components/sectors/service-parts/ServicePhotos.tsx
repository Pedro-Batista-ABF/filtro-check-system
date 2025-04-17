
import React from 'react';
import { Service, Photo, PhotoWithFile } from '@/types';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { UploadCloud, Camera, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ServicePhotosProps {
  service: Service;
  photoType: 'before' | 'after';
  required?: boolean;
  onPhotoUpload?: (files: FileList) => void;
  onPhotoDelete?: (photoId: string) => void;
  disabled?: boolean;
  onCameraCapture?: (e: React.MouseEvent) => void;
}

const ServicePhotos: React.FC<ServicePhotosProps> = ({
  service,
  photoType = 'before',
  required = false,
  onPhotoUpload,
  onPhotoDelete,
  disabled = false,
  onCameraCapture
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0 && onPhotoUpload) {
      onPhotoUpload(files);
      // Reset the input value after upload
      e.target.value = '';
    }
  };
  
  // Filtrar fotos baseado no tipo (antes/depois)
  const photos = service.photos || [];
  const filteredPhotos = photos.filter(photo => photo.type === photoType);
  
  const needsPhotos = required && filteredPhotos.length === 0;
  
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <Label className={cn("text-sm", needsPhotos && "text-red-500")}>
          {photoType === 'before' ? 'Fotos da Peritagem' : 'Fotos da Checagem Final'}
          {required && <span className="text-red-500">*</span>}
        </Label>
        
        <div className="flex space-x-2">
          {onCameraCapture && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onCameraCapture}
              disabled={disabled}
            >
              <Camera className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Câmera</span>
            </Button>
          )}
          
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleButtonClick}
            disabled={disabled}
          >
            <UploadCloud className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Upload</span>
          </Button>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            multiple
            disabled={disabled}
          />
        </div>
      </div>
      
      {needsPhotos && (
        <p className="text-xs text-red-500">
          É necessário adicionar pelo menos uma foto
        </p>
      )}
      
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {filteredPhotos.map((photo) => (
          <div key={photo.id} className="relative">
            <img
              src={photo.url}
              alt={`Foto ${photo.id}`}
              className="h-24 w-full object-cover rounded-md border"
            />
            
            {onPhotoDelete && !disabled && (
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="h-6 w-6 absolute top-1 right-1 opacity-70 hover:opacity-100"
                onClick={() => onPhotoDelete(photo.id)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        ))}
      </div>
      
      {filteredPhotos.length === 0 && (
        <div className={cn(
          "h-24 border border-dashed rounded-md flex items-center justify-center text-sm text-gray-500",
          needsPhotos && "border-red-300 bg-red-50"
        )}>
          Nenhuma foto adicionada
        </div>
      )}
    </div>
  );
};

export default ServicePhotos;
