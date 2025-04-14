
import React, { useRef } from 'react';
import { Photo, PhotoWithFile } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Plus, Camera } from 'lucide-react';

interface PhotoUploadProps {
  photos: PhotoWithFile[];
  onChange: (files: FileList) => void;
  disabled?: boolean;
  title?: string;
  required?: boolean;
  onCameraCapture?: (e: React.MouseEvent) => void;
}

export default function PhotoUpload({ 
  photos, 
  onChange, 
  disabled = false, 
  title = "Adicionar fotos", 
  required = false,
  onCameraCapture
}: PhotoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {photos && photos.map((photo, index) => (
          <div key={photo.id || `temp-${index}`} className="relative group">
            <img
              src={photo.url || URL.createObjectURL(photo.file as File)}
              alt={`Foto ${index + 1}`}
              className="w-20 h-20 rounded-md object-cover border"
            />
          </div>
        ))}

        <div className="flex items-center space-x-2">
          <Button
            type="button"
            variant="outline"
            className="w-20 h-20 rounded-md border-dashed"
            disabled={disabled}
            onClick={handleClick}
          >
            <Plus className="h-6 w-6" />
          </Button>
          
          {onCameraCapture && (
            <Button
              type="button"
              variant="outline"
              className="w-14 h-20 rounded-md border-dashed"
              disabled={disabled}
              onClick={onCameraCapture}
              title="Usar câmera"
            >
              <Camera className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>

      <Input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => e.target.files && onChange(e.target.files)}
        className="hidden"
        required={required && photos.length === 0}
        multiple
      />
    </div>
  );
}
