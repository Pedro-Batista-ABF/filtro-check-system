
import React, { useRef, useState, useEffect } from 'react';
import { PhotoWithFile } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Plus, Camera, Eye, AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { photoService } from '@/services/photoService';
import { toast } from 'sonner';

interface PhotoUploadProps {
  photos: PhotoWithFile[];
  onChange: (files: FileList) => void;
  disabled?: boolean;
  title?: string;
  required?: boolean;
  onCameraCapture?: (e: React.MouseEvent) => void;
  allowRemove?: boolean;
  onRemove?: (photoId: string) => void;
}

export default function PhotoUpload({ 
  photos, 
  onChange, 
  disabled = false, 
  title = "Adicionar fotos", 
  required = false,
  onCameraCapture,
  allowRemove = false,
  onRemove
}: PhotoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [photoUrls, setPhotoUrls] = useState<Record<string, string>>({});
  const [fallbackUrls, setFallbackUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    // Limpar erros quando as fotos mudam
    setImageErrors({});
    
    // Processar cada foto para garantir que temos URLs válidas
    const processPhotos = async () => {
      const newPhotoUrls: Record<string, string> = {};
      
      for (const photo of photos) {
        const photoId = photo.id || `temp-${Date.now()}`;
        
        if (photo.url) {
          // Verificar se é uma URL válida
          try {
            // Se for arquivo, criar objeto URL
            if (photo.file instanceof File) {
              newPhotoUrls[photoId] = URL.createObjectURL(photo.file);
              continue;
            }
            
            // Tentar verificar a URL
            const isValid = await photoService.verifyPhotoUrl(photo.url);
            if (isValid) {
              newPhotoUrls[photoId] = photo.url;
            } else {
              console.warn(`URL da foto ${photoId} não é válida, tentando regenerar...`);
              
              // Tentar regenerar URL
              const regeneratedUrl = photoService.regeneratePublicUrl(photo.url);
              if (regeneratedUrl) {
                newPhotoUrls[photoId] = regeneratedUrl;
                console.log(`URL regenerada para ${photoId}: ${regeneratedUrl}`);
              } else {
                console.error(`Não foi possível regenerar URL para foto ${photoId}`);
              }
            }
          } catch (error) {
            console.error(`Erro ao processar URL da foto ${photoId}:`, error);
          }
        } else if (photo.file instanceof File) {
          // Se temos um arquivo mas não URL, criamos uma URL de objeto
          newPhotoUrls[photoId] = URL.createObjectURL(photo.file);
        }
      }
      
      setPhotoUrls(newPhotoUrls);
    };
    
    processPhotos();
    
    // Limpeza de URLs de objeto ao desmontar
    return () => {
      Object.values(photoUrls).forEach(url => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
      
      Object.values(fallbackUrls).forEach(url => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [photos]);

  const handleClick = () => {
    if (disabled) return;
    fileInputRef.current?.click();
  };

  // Função para obter URL segura da foto
  const getPhotoUrl = (photo: PhotoWithFile): string => {
    const photoId = photo.id || `temp-${Date.now()}`;
    
    // Verificar se temos uma URL de fallback primeiro
    if (fallbackUrls[photoId]) {
      return fallbackUrls[photoId];
    }
    
    // Caso contrário, usar a URL processada ou vazia
    return photoUrls[photoId] || '';
  };
  
  // Função para lidar com erros de carregamento de imagem
  const handleImageError = async (photoId: string, photoUrl: string) => {
    console.log("Erro ao carregar imagem:", photoId);
    setImageErrors(prev => ({
      ...prev,
      [photoId]: true
    }));
    
    // Tentar baixar a imagem diretamente como fallback
    try {
      const fallbackUrl = await photoService.downloadPhoto(photoUrl);
      if (fallbackUrl) {
        console.log(`Fallback URL criada para ${photoId}: ${fallbackUrl}`);
        setFallbackUrls(prev => ({
          ...prev,
          [photoId]: fallbackUrl
        }));
        
        // Limpar erro já que agora temos uma URL de fallback
        setImageErrors(prev => ({
          ...prev,
          [photoId]: false
        }));
      }
    } catch (error) {
      console.error(`Erro ao criar fallback para ${photoId}:`, error);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {photos && photos.map((photo, index) => {
          const photoId = photo.id || `temp-${index}`;
          const photoUrl = getPhotoUrl(photo);
          const hasError = imageErrors[photoId];
          
          if (!photoUrl) {
            return (
              <div key={photoId} className="w-20 h-20 flex items-center justify-center rounded-md border bg-gray-100">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                <span className="text-xs text-gray-500 text-center ml-1">URL inválida</span>
              </div>
            );
          }
          
          return (
            <div key={photoId} className="relative group">
              <Dialog>
                <DialogTrigger asChild>
                  <div className="cursor-pointer">
                    {hasError ? (
                      <div className="w-20 h-20 flex items-center justify-center rounded-md border bg-gray-100">
                        <AlertTriangle className="h-5 w-5 text-amber-500" />
                        <span className="text-xs text-gray-500 text-center ml-1">Erro</span>
                      </div>
                    ) : (
                      <img
                        src={photoUrl}
                        alt={`Foto ${index + 1}`}
                        className="w-20 h-20 rounded-md object-cover border"
                        onError={() => handleImageError(photoId, photo.url || '')}
                      />
                    )}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-30 rounded-md">
                      <Eye className="h-5 w-5 text-white" />
                    </div>
                  </div>
                </DialogTrigger>
                <DialogContent className="max-w-3xl p-0 overflow-hidden">
                  <div className="relative">
                    {hasError ? (
                      <div className="w-full h-[80vh] flex items-center justify-center bg-gray-100">
                        <AlertTriangle className="h-6 w-6 text-amber-500 mr-2" />
                        <span className="text-gray-500">Não foi possível carregar a imagem</span>
                      </div>
                    ) : (
                      <img 
                        src={photoUrl} 
                        alt={`Visualização da foto ${index + 1}`} 
                        className="w-full h-auto max-h-[80vh] object-contain"
                        onError={() => handleImageError(photoId, photo.url || '')}
                      />
                    )}
                    {allowRemove && onRemove && (
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={() => onRemove(photo.id || '')}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          );
        })}
        
        <Button
          type="button"
          variant="outline"
          className="w-20 h-20 border-dashed flex flex-col items-center justify-center"
          onClick={handleClick}
          disabled={disabled}
        >
          <Plus className="h-5 w-5 mb-1" />
          <span className="text-xs">Foto</span>
        </Button>
      </div>
      
      {onCameraCapture && (
        <div className="flex space-x-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onCameraCapture}
            disabled={disabled}
          >
            <Camera className="h-4 w-4 mr-1" />
            Câmera
          </Button>
        </div>
      )}
      
      <Input
        type="file"
        ref={fileInputRef}
        onChange={(e) => e.target.files && onChange(e.target.files)}
        accept="image/*"
        className="hidden"
        multiple
        disabled={disabled}
      />
    </div>
  );
}
