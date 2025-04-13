
import { ChangeEvent, useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImagePlus, CheckCircle, AlertCircle } from "lucide-react";
import { Photo } from "@/types";
import { toast } from "sonner";
import { useApi } from "@/contexts/ApiContextExtended";

interface PhotoUploadProps {
  id?: string;
  title?: string;
  onPhotoUpload?: (e: ChangeEvent<HTMLInputElement>, type: 'tag' | 'entry' | 'exit') => void;
  type?: 'tag' | 'entry' | 'exit';
  photos?: string[];
  disabled?: boolean;
  // Propriedades adicionais para compatibilidade
  label?: string;
  onChange?: (files: FileList, processedUrl?: string) => void;
  existingPhotos?: Photo[];
  required?: boolean;
  value?: string | null;
  onSuccess?: (url: string) => void;
  error?: boolean;
}

export default function PhotoUpload({
  id = "photo-upload",
  title,
  onPhotoUpload,
  type = 'entry',
  photos = [],
  disabled = false,
  label,
  onChange,
  existingPhotos = [],
  required = false,
  value,
  onSuccess,
  error = false
}: PhotoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [photoUrls, setPhotoUrls] = useState<string[]>(photos || []);
  const api = useApi();

  // Se photos props mudar, atualize o estado local
  useEffect(() => {
    if (photos && photos.length > 0) {
      setPhotoUrls(photos);
      setUploadSuccess(true);
    } else {
      setPhotoUrls([]);
    }
  }, [photos]);
  
  // Também observe value se for diferente de photos
  useEffect(() => {
    if (value && !photoUrls.includes(value)) {
      setPhotoUrls(prev => [value]);
      setUploadSuccess(true);
    }
  }, [value, photoUrls]);

  // Função que lida com os dois tipos de callbacks
  const handleChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsUploading(true);
      setUploadError(null);
      
      try {
        console.log("Arquivos selecionados:", e.target.files.length);
        
        // Processar arquivos
        const files = Array.from(e.target.files);
        
        // Para todos os tipos de fotos, precisamos processar o upload imediatamente
        const file = files[0];
        try {
          // Upload do arquivo para o storage e obter URL permanente
          console.log(`Iniciando upload da foto de ${type} para o Supabase`);
          const uploadedUrl = await api.uploadPhoto(file, type === 'tag' ? 'tag' : 'before');
          console.log(`Foto de ${type} processada com sucesso:`, uploadedUrl);
          
          // Adicionar URL processada à lista
          setPhotoUrls([uploadedUrl]);
          
          // Criar um objeto File simulado para passar para os callbacks
          const processedFileList = new DataTransfer();
          processedFileList.items.add(file);
          
          if (onChange) {
            onChange(processedFileList.files, uploadedUrl);
          }
          if (onPhotoUpload) {
            // Forçar a URL processada no evento
            const modifiedEvent = {
              ...e,
              currentTarget: {
                ...e.currentTarget,
                dataset: {
                  processedUrl: uploadedUrl
                }
              },
              target: {
                ...e.target,
                dataset: {
                  processedUrl: uploadedUrl
                },
                files: processedFileList.files
              }
            };
            onPhotoUpload(modifiedEvent, type as 'tag' | 'entry' | 'exit');
          }

          // Notificar que upload foi concluído com sucesso
          setIsUploading(false);
          setUploadSuccess(true);
          
          toast.success(`Foto ${type === 'tag' ? 'do TAG' : ''} enviada com sucesso`);
          
          if (onSuccess) {
            onSuccess(uploadedUrl);
          }
          
          // Reset do estado de sucesso após 3 segundos
          setTimeout(() => {
            setUploadSuccess(false);
          }, 3000);
        } catch (uploadError) {
          console.error(`Erro ao processar foto de ${type}:`, uploadError);
          setUploadError(`Erro ao processar foto de ${type}. Tente novamente.`);
          toast.error(`Erro ao processar foto de ${type}`);
          setIsUploading(false);
          return;
        }
      } catch (error) {
        setIsUploading(false);
        setUploadError(error instanceof Error ? error.message : "Erro ao fazer upload da foto");
        toast.error("Erro ao fazer upload da foto");
        console.error("Erro no upload da foto:", error);
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
                Enviando fotos...
              </span>
            </>
          ) : uploadSuccess ? (
            <>
              <CheckCircle className="h-10 w-10 mb-3 text-green-500" />
              <span className="text-sm font-medium text-green-600">
                Fotos enviadas com sucesso!
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
                Clique para adicionar fotos
              </span>
              <span className="text-xs text-gray-500 mt-1">
                {type === 'tag' ? 'Adicione a foto do TAG do setor' : 'Você pode selecionar múltiplas fotos'}
              </span>
            </>
          )}
        </Label>
        <Input
          id={id}
          type="file"
          multiple={type !== 'tag'}
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
            {photoUrls.length} foto(s) adicionada(s):
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
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
            {existingPhotos.length} foto(s) adicionada(s):
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
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
