
import React from 'react';
import { Service, Photo } from '@/types';
import { Label } from '@/components/ui/label';
import PhotoUpload from '../PhotoUpload';

interface ServicePhotosProps {
  service: Service;
  photoType: "before" | "after";
  required: boolean;
  onFileInputChange: (files: FileList) => void;
  disabled?: boolean;
  onCameraCapture?: (e: React.MouseEvent) => void;
  onPhotoUpload?: (id: string, files: FileList, type: "before" | "after") => void;
}

const ServicePhotos: React.FC<ServicePhotosProps> = ({
  service,
  photoType,
  required,
  onFileInputChange,
  disabled = false,
  onCameraCapture,
  onPhotoUpload
}) => {
  const photoTypeLabel = photoType === "before" ? "Antes" : "Depois";
  
  // Garantir que photos é sempre um array válido
  const photos = Array.isArray(service.photos) ? service.photos : [];
  
  // Filtrar fotos pelo tipo (antes/depois)
  const filteredPhotos = photos.filter(p => p.type === photoType);
  
  // Convert to PhotoWithFile type to satisfy the component props
  const photoWithFiles = filteredPhotos.map(photo => ({
    ...photo,
    id: photo.id,
    url: photo.url,
    type: photo.type || photoType,
    serviceId: service.id,
    file: undefined
  }));
  
  const hasPhotos = photoWithFiles.length > 0;

  const handleFileChange = (files: FileList) => {
    if (onPhotoUpload) {
      onPhotoUpload(service.id, files, photoType);
    } else {
      onFileInputChange(files);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <Label className="text-sm font-medium">
          Fotos {photoTypeLabel}
          {required && !hasPhotos && <span className="text-red-500 ml-1">*</span>}
        </Label>
      </div>

      {/* PhotoUpload component with proper props */}
      <PhotoUpload
        photos={photoWithFiles}
        onChange={handleFileChange}
        disabled={disabled}
        title={`Fotos ${photoTypeLabel}`}
        required={required}
        onCameraCapture={onCameraCapture}
      />
    </div>
  );
};

export default ServicePhotos;
