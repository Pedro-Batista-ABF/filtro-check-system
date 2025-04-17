
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Service } from '@/types';
import { Camera, Image, Plus, X } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onPhotoUpload(service.id, e.target.files, photoType);
      // Clear the input to allow selecting the same file again
      e.target.value = '';
    }
  };

  // Filter photos by type
  const photos = (service.photos || []).filter(photo => photo.type === photoType);

  return (
    <div className="space-y-2">
      <Label className="text-sm flex items-center">
        Fotos {photoType === 'before' ? 'do defeito' : 'da execução'}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>

      <div className="grid grid-cols-4 gap-2">
        {photos.map((photo, index) => (
          <div key={photo.id || `photo-${index}`} className="relative group">
            <Dialog>
              <DialogTrigger asChild>
                <div className="cursor-pointer">
                  <img
                    src={photo.url}
                    alt={`Foto ${index + 1}`}
                    className="aspect-square w-full object-cover rounded-md border"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder.svg';
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-40 rounded-md">
                    <Plus className="h-5 w-5 text-white" />
                  </div>
                </div>
              </DialogTrigger>
              <DialogContent className="max-w-3xl p-0 overflow-hidden">
                <img
                  src={photo.url}
                  alt={`Visualização da foto ${index + 1}`}
                  className="w-full h-auto max-h-[80vh] object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder.svg';
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          size="icon"
          className="aspect-square flex items-center justify-center border-dashed"
          onClick={handleClick}
          disabled={disabled}
        >
          <Plus className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex space-x-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onCameraCapture} // Fixed: Changed from handleCameraCapture to onCameraCapture
          disabled={disabled}
          className="text-xs"
        >
          <Camera className="h-3 w-3 mr-1" />
          Usar câmera
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleClick}
          disabled={disabled}
          className="text-xs"
        >
          <Image className="h-3 w-3 mr-1" />
          Carregar foto
        </Button>
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
  );
};

export default ServicePhotos;
