
import React, { useRef, useState } from 'react';
import { Camera, Trash2, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Service, Photo } from '@/types';

interface ServicePhotosProps {
  service: Service;
  photoType: "before" | "after";
  required: boolean;
  onPhotoUpload: (serviceId: string, files: FileList, type: "before" | "after") => void;
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  
  const photos = service.photos || [];
  const typePhotos = photos.filter(photo => photo.type === photoType);
  
  const handleClick = () => {
    if (disabled) return;
    fileInputRef.current?.click();
  };
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled || !e.target.files || e.target.files.length === 0) return;
    
    setUploading(true);
    try {
      await onPhotoUpload(service.id, e.target.files, photoType);
      e.target.value = '';
    } catch (error) {
      console.error('Erro ao fazer upload da foto:', error);
    } finally {
      setUploading(false);
    }
  };
  
  return (
    <div className="mt-2">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium">
          Fotos {photoType === 'before' ? 'antes' : 'depois'}
          {required && <span className="text-red-500 ml-1">*</span>}
        </span>
        
        <div className="flex space-x-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClick}
            disabled={disabled || uploading}
            className="text-xs"
          >
            {uploading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Enviando...
              </span>
            ) : (
              <>
                <Image className="h-3 w-3 mr-1" />
                Adicionar foto
              </>
            )}
          </Button>
          
          {onCameraCapture && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onCameraCapture}
              disabled={disabled || uploading}
              className="text-xs"
            >
              <Camera className="h-3 w-3 mr-1" />
              Usar câmera
            </Button>
          )}
        </div>
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
          multiple
          disabled={disabled}
        />
      </div>
      
      {typePhotos.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {typePhotos.map((photo, index) => (
            <div key={index} className="relative border rounded-md overflow-hidden h-24">
              <a 
                href={photo.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="block h-full w-full"
              >
                <img
                  src={photo.url}
                  alt={`Foto ${index + 1} do serviço ${service.name}`}
                  className="h-full w-full object-cover"
                />
              </a>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 rounded-md p-4 flex flex-col items-center justify-center text-gray-400 border border-dashed border-gray-300">
          <Image className="h-8 w-8 mb-2" />
          <p className="text-xs text-center">
            {disabled
              ? "Não há fotos disponíveis"
              : "Clique no botão acima para adicionar fotos"}
          </p>
        </div>
      )}
    </div>
  );
};

export default ServicePhotos;
