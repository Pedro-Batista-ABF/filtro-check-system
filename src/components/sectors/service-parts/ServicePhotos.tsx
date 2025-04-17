
import React from 'react';
import { Service } from '@/types';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Camera, Trash2, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  const visiblePhotos = photos.filter(p => p.type === photoType);
  const hasPhotos = visiblePhotos.length > 0;
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileInputChange(e.target.files);
    }
  };

  const handleDeletePhoto = (photoUrl: string) => {
    console.log(`Pedido para excluir foto: ${photoUrl}`);
    // A implementação da exclusão de fotos seria feita em outro componente
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <Label className="text-sm font-medium">
          Fotos {photoTypeLabel}
          {required && !hasPhotos && <span className="text-red-500 ml-1">*</span>}
        </Label>
        
        <div className="flex space-x-2">
          {onCameraCapture && (
            <Button 
              type="button" 
              size="sm" 
              variant="outline"
              onClick={onCameraCapture}
              disabled={disabled}
            >
              <Camera className="h-4 w-4 mr-1" />
              Câmera
            </Button>
          )}
          
          <div className="relative">
            <Button 
              type="button" 
              size="sm" 
              variant="outline"
              disabled={disabled}
              className="relative"
              asChild
            >
              <label htmlFor={`photo-upload-${service.id}-${photoType}`} className="cursor-pointer flex items-center">
                <Upload className="h-4 w-4 mr-1" />
                Upload
              </label>
            </Button>
            <input
              id={`photo-upload-${service.id}-${photoType}`}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="hidden"
              disabled={disabled}
            />
          </div>
        </div>
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
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {visiblePhotos.map((photo, index) => (
            <div key={photo.id || index} className="relative group">
              <img
                src={photo.url}
                alt={`Foto ${photoTypeLabel} ${index + 1}`}
                className="h-24 w-full object-cover rounded-md"
              />
              {!disabled && (
                <button
                  type="button"
                  onClick={() => handleDeletePhoto(photo.url)}
                  className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ServicePhotos;
