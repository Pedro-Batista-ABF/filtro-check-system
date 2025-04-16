
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Service, Photo } from '@/types';
import { Camera, Upload, X } from 'lucide-react';

interface ServicePhotosProps {
  service: Service;
  photoType: 'before' | 'after';
  required: boolean;
  onPhotoUpload: (serviceId: string, files: FileList, type: 'before' | 'after') => void;
  disabled?: boolean;
  onCameraCapture?: (e: React.MouseEvent) => void;
}

const ServicePhotos: React.FC<ServicePhotosProps> = ({
  service,
  photoType,
  required,
  onPhotoUpload,
  disabled = false,
  onCameraCapture
}) => {
  const [isHovered, setIsHovered] = useState<string | null>(null);
  
  // Get the correct photos based on type
  const photos = service.photos || [];
  
  // Handle the file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onPhotoUpload(service.id, e.target.files, photoType);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">
          Fotos {photoType === 'before' ? 'do Defeito' : 'da Execução'}
          {required && photoType === 'before' && <span className="text-red-500 ml-1">*</span>}
        </span>
        
        <div className="flex gap-2">
          {!disabled && (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onCameraCapture}
                disabled={disabled}
              >
                <Camera className="h-4 w-4 mr-1" />
                <span className="text-xs">Câmera</span>
              </Button>
              
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const fileInput = document.getElementById(`photo-${service.id}`) as HTMLInputElement;
                  if (fileInput) fileInput.click();
                }}
                disabled={disabled}
              >
                <Upload className="h-4 w-4 mr-1" />
                <span className="text-xs">Galeria</span>
              </Button>
              <input
                id={`photo-${service.id}`}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileChange}
                disabled={disabled}
              />
            </>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-2">
        {photos.length === 0 ? (
          <div className="col-span-full text-center py-2 bg-gray-50 border border-dashed rounded text-gray-400 text-sm">
            {disabled 
              ? 'Nenhuma foto disponível' 
              : 'Adicione fotos do defeito'}
          </div>
        ) : (
          photos.map((photo) => (
            <div 
              key={photo.id}
              className="relative rounded-md overflow-hidden border"
              onMouseEnter={() => setIsHovered(photo.id)}
              onMouseLeave={() => setIsHovered(null)}
            >
              <img 
                src={photo.url} 
                alt={`Foto do serviço ${service.name}`}
                className="w-full h-24 object-cover"
              />
              
              {!disabled && isHovered === photo.id && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="h-8 w-8"
                    // For now, we're just showing the button but not implementing removal
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ServicePhotos;
