
import { ChangeEvent, useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImagePlus, CheckCircle, AlertCircle } from "lucide-react";
import { Photo } from "@/types";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface PhotoUploadProps {
  id?: string;
  title?: string;
  type?: 'tag' | 'entry' | 'exit';
  photos?: string[];
  disabled?: boolean;
  label?: string;
  onChange?: (url: string) => void;
  existingPhotos?: Photo[];
  required?: boolean;
  value?: string | null;
  onSuccess?: (url: string) => void;
  error?: boolean;
  onPhotoUpload?: (e: ChangeEvent<HTMLInputElement>, type: "tag" | "entry" | "exit") => void;
}

export default function PhotoUpload({
  id = "photo-upload",
  title,
  type = 'entry',
  photos = [],
  disabled = false,
  label,
  onChange,
  existingPhotos = [],
  required = false,
  value,
  onSuccess,
  error = false,
  onPhotoUpload
}: PhotoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [photoUrls, setPhotoUrls] = useState<string[]>(photos || []);

  // Se photos props mudar, atualize o estado local
  useEffect(() => {
    if (photos && photos.length > 0) {
      setPhotoUrls(photos);
      setUploadSuccess(true);
    } else if (value && !photoUrls.includes(value)) {
      setPhotoUrls([value]);
      setUploadSuccess(true);
    }
  }, [photos, value, photoUrls]);

  const uploadToSupabase = async (file: File): Promise<string> => {
    try {
      // Gerar um nome único para o arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${type}_${Date.now()}.${fileExt}`;
      const filePath = `${type}/${fileName}`;
      
      console.log("Preparando upload para caminho:", filePath);
      
      // Upload para o Supabase Storage
      const { data, error } = await supabase.storage
        .from('sector_photos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (error) {
        console.error("Erro no upload para o Supabase:", error);
        throw new Error(`Erro no upload da foto: ${error.message}`);
      }
      
      // Obter a URL pública do arquivo
      const { data: urlData } = supabase.storage
        .from('sector_photos')
        .getPublicUrl(filePath);
      
      console.log("Upload concluído com sucesso. URL:", urlData.publicUrl);
      
      if (!urlData.publicUrl) {
        throw new Error("URL da foto não foi gerada corretamente");
      }
      
      return urlData.publicUrl;
    } catch (error) {
      console.error("Erro no upload:", error);
      throw error;
    }
  };

  const handleChange = async (e: ChangeEvent<HTMLInputElement>) => {
    // Se temos um manipulador personalizado, use-o
    if (onPhotoUpload) {
      onPhotoUpload(e, type);
      return;
    }

    if (e.target.files && e.target.files.length > 0) {
      setIsUploading(true);
      setUploadError(null);
      
      try {
        const file = e.target.files[0];
        
        // Upload direto para o Supabase
        const uploadedUrl = await uploadToSupabase(file);
        
        // Atualizar estado local
        setPhotoUrls([uploadedUrl]);
        
        // Notificar que upload foi concluído
        if (onChange) {
          onChange(uploadedUrl);
        }
        
        if (onSuccess) {
          onSuccess(uploadedUrl);
        }
        
        setUploadSuccess(true);
        toast.success(`Foto enviada com sucesso`);
        
        // Reset do estado de sucesso após 3 segundos
        setTimeout(() => {
          setUploadSuccess(false);
        }, 3000);
      } catch (error) {
        setUploadError(error instanceof Error ? error.message : "Erro ao fazer upload da foto");
        toast.error("Erro ao fazer upload da foto");
        console.error("Erro no upload da foto:", error);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const hasPhotos = photoUrls.length > 0 || existingPhotos.length > 0;

  return (
    <div className="space-y-4">
      {title && <h3 className="text-lg font-medium">{title}</h3>}
      {label && (
        <div className="text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </div>
      )}
      
      <div className="mt-1">
        <Label 
          htmlFor={id} 
          className={`cursor-pointer flex flex-col items-center justify-center bg-gray-50 border ${(required && !hasPhotos) || error ? 'border-red-500' : 'border-dashed border-gray-300'} rounded-lg p-8 hover:bg-gray-100 transition-colors ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
        >
          {isUploading ? (
            <>
              <div className="animate-pulse text-primary">
                <ImagePlus className="h-10 w-10 mb-3" />
              </div>
              <span className="text-sm font-medium text-gray-700">
                Enviando foto...
              </span>
            </>
          ) : uploadSuccess ? (
            <>
              <CheckCircle className="h-10 w-10 mb-3 text-green-500" />
              <span className="text-sm font-medium text-green-600">
                Foto enviada com sucesso!
              </span>
            </>
          ) : (error || (required && !hasPhotos)) ? (
            <>
              <AlertCircle className="h-10 w-10 mb-3 text-red-500" />
              <span className="text-sm font-medium text-red-600">
                Foto obrigatória não encontrada
              </span>
              <span className="text-xs text-red-500 mt-1">
                Clique para adicionar uma foto
              </span>
            </>
          ) : (
            <>
              <ImagePlus className="h-10 w-10 mb-3 text-primary" />
              <span className="text-sm font-medium text-gray-700">
                Clique para adicionar foto
              </span>
              <span className="text-xs text-gray-500 mt-1">
                {type === 'tag' ? 'Adicione a foto do TAG do setor' : 'Selecione uma foto para upload'}
              </span>
            </>
          )}
        </Label>
        <Input
          id={id}
          type="file"
          multiple={false}
          accept="image/*"
          className="hidden"
          onChange={handleChange}
          disabled={disabled || isUploading}
        />
      </div>
      
      {uploadError && (
        <div className="mt-2 text-sm text-red-500">
          Erro: {uploadError}
        </div>
      )}

      {/* Exibir fotos existentes como URLs */}
      {photoUrls.length > 0 && (
        <div className="mt-4">
          <p className="text-sm font-medium mb-3 text-gray-700">
            Foto adicionada:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {photoUrls.map((photo, index) => (
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

      {/* Exibir fotos existentes como objetos Photo */}
      {existingPhotos.length > 0 && (
        <div className="mt-4">
          <p className="text-sm font-medium mb-3 text-gray-700">
            Fotos existentes:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {existingPhotos.map((photo) => (
              <div key={photo.id} className="relative h-28 bg-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <img 
                  src={photo.url} 
                  alt={`Foto`} 
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
