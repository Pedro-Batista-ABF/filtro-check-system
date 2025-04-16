
import React, { useRef, useState } from 'react';
import { Camera, Trash2, Image, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Service, Photo } from '@/types';
import { toast } from 'sonner';

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
  
  // Garantir que photos é um array
  const photos = Array.isArray(service.photos) ? service.photos : [];
  // Filtrar fotos pelo tipo correto
  const typePhotos = photos.filter(photo => photo.type === photoType);
  
  const handleClick = () => {
    if (disabled) return;
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled || !e.target.files || e.target.files.length === 0) return;
    
    setUploading(true);
    try {
      // Processar as imagens
      await onPhotoUpload(service.id, e.target.files, photoType);
      
      // Limpar o input para permitir selecionar o mesmo arquivo novamente
      if (e.target.value) {
        e.target.value = '';
      }
    } catch (error) {
      console.error('Erro ao fazer upload da foto:', error);
      toast.error("Falha ao enviar foto. Tente novamente.");
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
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
          disabled={disabled || uploading}
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
                  onError={(e) => {
                    // Fallback para imagem quebrada
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder.svg';
                    target.classList.add('bg-gray-100');
                  }}
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
