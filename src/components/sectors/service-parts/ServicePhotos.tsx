
import React, { useRef } from 'react';
import { Service } from '@/types';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Camera, Plus } from 'lucide-react';

interface ServicePhotosProps {
  service: Service;
  photoType: 'before' | 'after';
  required?: boolean;
  onPhotoUpload: (id: string, files: FileList, type: "before" | "after") => void;
  disabled?: boolean;
  onCameraCapture?: (e: React.MouseEvent) => void;
}

export default function ServicePhotos({
  service,
  photoType = 'before',
  required = false,
  onPhotoUpload,
  disabled = false,
  onCameraCapture
}: ServicePhotosProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    onPhotoUpload(service.id, e.target.files, photoType);
  };

  const handleCameraClick = (e: React.MouseEvent) => {
    if (onCameraCapture) {
      onCameraCapture(e);
    }
  };

  // Filtrar fotos pelo tipo (antes/depois)
  const photos = service.photos?.filter(photo => photo.type === photoType) || [];
  const hasPhotos = photos.length > 0;

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Label className="text-sm">
          Fotos do {photoType === 'before' ? 'defeito' : 'serviço executado'}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        
        <div className="flex space-x-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleUploadClick}
            disabled={disabled}
            className="text-xs"
          >
            <Plus className="h-3 w-3 mr-1" />
            Adicionar foto
          </Button>
          
          {onCameraCapture && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCameraClick}
              disabled={disabled}
              className="text-xs"
            >
              <Camera className="h-3 w-3 mr-1" />
              Usar câmera
            </Button>
          )}
        </div>
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />
      
      {hasPhotos ? (
        <div className="grid grid-cols-4 gap-2">
          {photos.map((photo, index) => (
            <div key={photo.id || `temp-${index}`} className="relative">
              <img
                src={photo.url}
                alt={`Foto ${index + 1}`}
                className="w-full h-20 object-cover rounded-md border"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder.svg';
                }}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 border border-dashed rounded-md p-4 text-center">
          <p className="text-sm text-gray-500">
            {required
              ? 'É necessário adicionar pelo menos uma foto'
              : 'Nenhuma foto adicionada'}
          </p>
        </div>
      )}
    </div>
  );
}
