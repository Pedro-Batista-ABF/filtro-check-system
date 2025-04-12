
import { ChangeEvent } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";
import { toast } from "sonner";

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
      <h3 className="text-lg font-medium">{title}</h3>
      
      <div className="mt-1">
        <Label 
          htmlFor={id} 
          className={`cursor-pointer flex flex-col items-center justify-center bg-gray-100 border border-dashed border-gray-300 rounded-md p-6 hover:bg-gray-50 transition-colors ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
        >
          <Upload className="h-8 w-8 mb-2 text-gray-500" />
          <span className="text-sm text-gray-500">
            Clique para adicionar fotos
          </span>
          <span className="text-xs text-gray-400 mt-1">
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
        <div className="mt-2">
          <p className="text-sm font-medium mb-2">
            {photos.length} foto(s) adicionada(s):
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {photos.map((photo, index) => (
              <div key={index} className="h-24 bg-gray-200 rounded overflow-hidden">
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
