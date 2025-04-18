
import React, { useRef, useState, useEffect } from 'react';
import { PhotoWithFile } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Plus, Camera, Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
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

  useEffect(() => {
    // Limpar erros quando as fotos mudam
    setImageErrors({});
    
    // Processar cada foto para garantir que temos URLs válidas
    const processPhotos = async () => {
      const newPhotoUrls: Record<string, string> = {};
      
      for (const photo of photos) {
        const photoId = photo.id || `temp-${Date.now()}`;
        
        if (photo.url) {
          // Se já temos uma URL, vamos verificar se é válida tentando pegar metadados
          try {
            const response = await fetch(photo.url, { method: 'HEAD' });
            if (response.ok) {
              newPhotoUrls[photoId] = photo.url;
            } else {
              console.warn(`URL da foto ${photoId} retornou código ${response.status}`);
              // Tentar obter a URL pública novamente se for uma URL do Supabase
              if (photo.url.includes('supabase.co')) {
                const urlParts = photo.url.split('/object/public/');
                if (urlParts.length > 1) {
                  const path = urlParts[1];
                  try {
                    const { data } = supabase.storage
                      .from('sector_photos')
                      .getPublicUrl(path);
                    
                    if (data.publicUrl) {
                      newPhotoUrls[photoId] = data.publicUrl;
                      console.log(`Recuperada URL pública para ${photoId}: ${data.publicUrl}`);
                    }
                  } catch (storageError) {
                    console.error(`Erro ao obter URL pública: ${storageError}`);
                  }
                }
              }
            }
          } catch (error) {
            console.error(`Erro ao verificar URL da foto ${photoId}: ${error}`);
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
    };
  }, [photos]);

  const handleClick = () => {
    if (disabled) return;
    fileInputRef.current?.click();
  };

  // Função para obter URL segura da foto
  const getPhotoUrl = (photo: PhotoWithFile): string => {
    const photoId = photo.id || `temp-${Date.now()}`;
    return photoUrls[photoId] || '';
  };
  
  // Função para lidar com erros de carregamento de imagem
  const handleImageError = (photoId: string) => {
    console.log("Erro ao carregar imagem:", photoId);
    setImageErrors(prev => ({
      ...prev,
      [photoId]: true
    }));
    
    // Tentar fazer download direto como fallback
    if (photo.url && photo.url.includes('supabase.co')) {
      tryDownloadImage(photo.url, photoId);
    }
  };
  
  // Função para tentar fazer download da imagem como fallback
  const tryDownloadImage = async (url: string, photoId: string) => {
    try {
      // Extrair o caminho do bucket da URL
      const urlParts = url.split('/object/public/');
      if (urlParts.length > 1) {
        const path = urlParts[1];
        console.log(`Tentando download direto para ${photoId}: ${path}`);
        
        const { data, error } = await supabase.storage
          .from('sector_photos')
          .download(path);
          
        if (error) {
          console.error(`Erro ao fazer download da imagem: ${error.message}`);
          return;
        }
        
        if (data) {
          const newUrl = URL.createObjectURL(data);
          setPhotoUrls(prev => ({
            ...prev,
            [photoId]: newUrl
          }));
          setImageErrors(prev => ({
            ...prev,
            [photoId]: false
          }));
          console.log(`Criada URL local para ${photoId}: ${newUrl}`);
        }
      }
    } catch (error) {
      console.error(`Erro ao processar download: ${error}`);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {photos && photos.map((photo, index) => {
          const photoUrl = getPhotoUrl(photo);
          if (!photoUrl) return null;
          
          const photoId = photo.id || `temp-${index}`;
          const hasError = imageErrors[photoId];
          
          return (
            <div key={photoId} className="relative group">
              <Dialog>
                <DialogTrigger asChild>
                  <div className="cursor-pointer">
                    {hasError ? (
                      <div className="w-20 h-20 flex items-center justify-center rounded-md border bg-gray-100">
                        <span className="text-xs text-gray-500 text-center px-1">Erro ao carregar</span>
                      </div>
                    ) : (
                      <img
                        src={photoUrl}
                        alt={`Foto ${index + 1}`}
                        className="w-20 h-20 rounded-md object-cover border"
                        onError={() => handleImageError(photoId)}
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
                        <span className="text-gray-500">Não foi possível carregar a imagem</span>
                      </div>
                    ) : (
                      <img 
                        src={photoUrl} 
                        alt={`Visualização da foto ${index + 1}`} 
                        className="w-full h-auto max-h-[80vh] object-contain"
                        onError={() => handleImageError(photoId)}
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
