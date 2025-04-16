
import React from 'react';
import { Photo, PhotoWithFile } from '@/types';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Camera } from 'lucide-react';
import PhotoUpload from '../PhotoUpload';

interface ServicePhotosProps {
  service: {
    id: string;
    photos?: (Photo | PhotoWithFile)[];
    selected: boolean;
  };
  photoType: "before" | "after";
  required: boolean;
  onPhotoUpload: (id: string, files: FileList, type: "before" | "after") => void;
  onCameraCapture?: (e: React.MouseEvent) => void;
  disabled?: boolean;
}

export default function ServicePhotos({
  service,
  photoType,
  required,
  onPhotoUpload,
  onCameraCapture,
  disabled = false
}: ServicePhotosProps) {
  const handlePhotoUpload = (files: FileList) => {
    onPhotoUpload(service.id, files, photoType);
  };

  // Convert the photos to PhotoWithFile[] to match PhotoUpload component's expectations
  const photoWithFiles = service.photos 
    ? service.photos.map(photo => {
        if ('file' in photo) {
          return photo as PhotoWithFile;
        }
        // Add a default empty file property to photos that don't have it
        return { ...photo, file: null } as PhotoWithFile;
      })
    : [];

  // Filtrar fotos apenas do tipo correspondente
  const filteredPhotos = photoWithFiles.filter(photo => photo.type === photoType);

  // Label text based on photoType
  const labelText = photoType === "before" ? "Fotos do Defeito" : "Fotos da Execução";
  const buttonText = `Adicionar fotos ${photoType === "before" ? "do defeito" : "da execução"}`;

  return (
    <div className="space-y-1">
      <Label className="text-sm flex items-center justify-between">
        <span>
          {labelText}
          {required && <span className="text-red-500 ml-1">*</span>}
        </span>
        
        {onCameraCapture && !disabled && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onCameraCapture}
            title="Usar câmera"
          >
            <Camera className="h-4 w-4 mr-2" />
            Câmera
          </Button>
        )}
      </Label>
      
      <PhotoUpload
        photos={filteredPhotos}
        onChange={handlePhotoUpload}
        disabled={!service.selected || disabled}
        title={buttonText}
        required={required}
        onCameraCapture={onCameraCapture}
      />
    </div>
  );
}
