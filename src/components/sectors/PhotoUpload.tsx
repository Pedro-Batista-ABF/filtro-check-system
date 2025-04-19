
import React from 'react';
import { PhotoWithFile } from '@/types';
import { Button } from '@/components/ui/button';
import { Camera, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PhotoUploadProps {
  photos: PhotoWithFile[];
  onChange: (files: FileList) => void;
  disabled?: boolean;
  title?: string;
  required?: boolean;
  onCameraCapture?: (e: React.MouseEvent) => void;
}

const PhotoUpload: React.FC<PhotoUploadProps> = ({
  photos = [],
  onChange,
  disabled = false,
  title = 'Fotos',
  required = false,
  onCameraCapture
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onChange(e.target.files);
    }
  };

  const hasPhotos = photos && photos.length > 0;

  return (
    <div className="w-full">
      <div className={cn(
        "border border-dashed rounded-md p-4 transition-colors",
        !hasPhotos ? "border-gray-300 bg-gray-50" : "border-gray-200 bg-white",
        disabled && "opacity-60 cursor-not-allowed"
      )}>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
          disabled={disabled}
        />

        {!hasPhotos ? (
          <div className="flex flex-col items-center justify-center py-4">
            <Upload className="h-8 w-8 text-gray-400 mb-2" />
            <p className="text-sm text-gray-500 mb-1">{title}</p>
            <p className="text-xs text-gray-400 mb-4">Formatos aceitos: JPG, PNG (máx 10MB)</p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleButtonClick}
                disabled={disabled}
              >
                Escolher arquivo
              </Button>
              
              {onCameraCapture && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onCameraCapture}
                  disabled={disabled}
                >
                  <Camera className="h-4 w-4 mr-1" />
                  Usar câmera
                </Button>
              )}
            </div>
            {required && <p className="text-xs text-red-500 mt-2">* Foto obrigatória</p>}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {photos.map((photo) => (
                <div key={photo.id} className="relative aspect-square rounded-md overflow-hidden border">
                  <img
                    src={photo.url}
                    alt="Foto"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNmM2YzZjMiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOTk5Ij5JbWFnZW0gaW5kaXNwb27DrXZlbDwvdGV4dD48L3N2Zz4=';
                    }}
                  />
                </div>
              ))}
              <div className="aspect-square rounded-md border border-dashed flex items-center justify-center bg-gray-50">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleButtonClick}
                  disabled={disabled}
                  className="w-full h-full"
                >
                  <Upload className="h-6 w-6 text-gray-400" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhotoUpload;
