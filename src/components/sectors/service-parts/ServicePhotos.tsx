
import React from 'react';
import { Service, Photo } from '@/types';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, Camera } from 'lucide-react';

export interface ServicePhotosProps {
  service: Service;
  photoType: "before" | "after";
  required?: boolean;
  onPhotoUpload?: (files: FileList, type: "before" | "after") => void;
  disabled?: boolean;
  onCameraCapture?: (e: React.MouseEvent) => void;
}

const ServicePhotos: React.FC<ServicePhotosProps> = ({
  service,
  photoType = "before",
  required = false,
  onPhotoUpload,
  disabled = false,
  onCameraCapture
}) => {
  // Filter photos by type
  const photos = service.photos?.filter(photo => photo.type === photoType) || [];
  const hasPhotos = photos.length > 0;
  
  // Hide the component if disabled and no photos
  if (disabled && !hasPhotos) return null;
  
  // Reference for file input
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      if (onPhotoUpload) {
        onPhotoUpload(e.target.files, photoType);
      }
    }
  };
  
  // Handle button click to open file dialog
  const handleSelectFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Label className="text-sm">
          {photoType === "before" ? "Fotos do defeito" : "Fotos após serviço"}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        
        {!disabled && (
          <div className="flex space-x-2">
            {onCameraCapture && (
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={onCameraCapture}
                aria-label="Capturar foto"
              >
                <Camera className="h-4 w-4 mr-1" />
                Câmera
              </Button>
            )}
            
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              onClick={handleSelectFile}
              aria-label="Selecionar foto"
            >
              <Upload className="h-4 w-4 mr-1" />
              Arquivo
            </Button>
            
            <Input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              multiple
            />
          </div>
        )}
      </div>
      
      {hasPhotos ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {photos.map((photo, index) => (
            <div key={index} className="relative w-full aspect-square">
              <img
                src={photo.url}
                alt={`${service.name} ${photoType === "before" ? "antes" : "depois"} ${index + 1}`}
                className="w-full h-full object-cover rounded-md"
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 p-4 rounded-md text-gray-500 text-center">
          {required ? "Adicione pelo menos uma foto" : "Nenhuma foto adicionada"}
        </div>
      )}
    </div>
  );
};

export default ServicePhotos;
