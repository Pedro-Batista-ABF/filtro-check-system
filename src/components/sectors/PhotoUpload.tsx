
import { ChangeEvent } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImagePlus } from "lucide-react";

interface PhotoUploadProps {
  id: string;
  title: string;
  onPhotoUpload: (e: ChangeEvent<HTMLInputElement>, type: 'tag' | 'entry' | 'exit') => void;
  type: 'tag' | 'entry' | 'exit';
  photos?: string[];
  disabled?: boolean;
}

export default function PhotoUpload({
  id,
  title,
  onPhotoUpload,
  type,
  photos = [],
  disabled = false
}: PhotoUploadProps) {
  return (
    <div className="space-y-4">
      {title && <h3 className="text-lg font-medium">{title}</h3>}
      
      <div className="mt-1">
        <Label 
          htmlFor={id} 
          className={`cursor-pointer flex flex-col items-center justify-center bg-gray-50 border border-dashed border-gray-300 rounded-lg p-8 hover:bg-gray-100 transition-colors ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
        >
          <ImagePlus className="h-10 w-10 mb-3 text-primary" />
          <span className="text-sm font-medium text-gray-700">
            Clique para adicionar fotos
          </span>
          <span className="text-xs text-gray-500 mt-1">
            Você pode selecionar múltiplas fotos
          </span>
        </Label>
        <Input
          id={id}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => onPhotoUpload(e, type)}
          disabled={disabled}
        />
      </div>

      {photos.length > 0 && (
        <div className="mt-4">
          <p className="text-sm font-medium mb-3 text-gray-700">
            {photos.length} foto(s) adicionada(s):
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {photos.map((photo, index) => (
              <div key={index} className="relative h-28 bg-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <img 
                  src={photo} 
                  alt={`Foto ${index + 1}`} 
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
