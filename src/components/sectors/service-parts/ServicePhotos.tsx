
import React from 'react';
import { Service, PhotoWithFile } from '@/types';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import PhotoUpload from '../PhotoUpload';

interface ServicePhotosProps {
  service: Service;
  photoType: "before" | "after";
  required: boolean;
  onFileInputChange: (files: FileList) => void;
  disabled?: boolean;
  onCameraCapture?: (e: React.MouseEvent) => void;
}

const ServicePhotos: React.FC<ServicePhotosProps> = ({
  service,
  photoType,
  required,
  onFileInputChange,
  disabled = false,
  onCameraCapture
}) => {
  const photoTypeLabel = photoType === "before" ? "Antes" : "Depois";
  const photos = service.photos || [];
  
  // Filtrar fotos pelo tipo (antes/depois)
  const filteredPhotos = photos.filter(p => p.type === photoType);
  
  // Convert to PhotoWithFile type to satisfy the component props
  const photoWithFiles: PhotoWithFile[] = filteredPhotos.map(photo => ({
    ...photo,
    id: photo.id,
    url: photo.url,
    type: photo.type || photoType,
    serviceId: service.id
  }));
  
  const hasPhotos = photoWithFiles.length > 0;

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <Label className="text-sm font-medium">
          Fotos {photoTypeLabel}
          {required && !hasPhotos && <span className="text-red-500 ml-1">*</span>}
        </Label>
      </div>

      {!hasPhotos ? (
        <div className={cn(
          "border-2 border-dashed rounded-md p-4 text-center",
          required && !hasPhotos ? "border-red-300" : "border-gray-200",
          "bg-gray-50"
        )}>
          <p className="text-sm text-gray-500">
            {disabled 
              ? "Upload desativado" 
              : `Adicione fotos ${photoTypeLabel.toLowerCase()} do serviço`}
          </p>
        </div>
      ) : (
        <PhotoUpload
          photos={photoWithFiles}
          onChange={onFileInputChange}
          disabled={disabled}
          title={`Fotos ${photoTypeLabel}`}
          required={required}
          onCameraCapture={onCameraCapture}
        />
      )}
    </div>
  );
};

export default ServicePhotos;
