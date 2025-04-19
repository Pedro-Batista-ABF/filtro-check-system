
import React, { useRef, useState, useEffect } from 'react';
import { PhotoWithFile } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Plus, Camera, Eye, AlertTriangle, RefreshCw } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { photoService } from '@/services/photoService';
import { toast } from 'sonner';
import { addNoCacheParam } from '@/utils/photoUtils';

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
  photos = [], // Garantir valor padrão para evitar undefined
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
  const [isRefreshing, setIsRefreshing] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Reset errors when photos change
    setImageErrors({});
    
    // Process each photo to ensure we have valid URLs
    const processPhotos = async () => {
      const newPhotoUrls: Record<string, string> = {};
      
      // Garantir que photos é sempre um array, mesmo que undefined
      const safePhotos = Array.isArray(photos) ? photos : [];
      
      for (const photo of safePhotos) {
        const photoId = photo.id || `temp-${Date.now()}`;
        
        if (photo.url) {
          try {
            // If it's a File object, create an object URL
            if (photo.file instanceof File) {
              newPhotoUrls[photoId] = URL.createObjectURL(photo.file);
              continue;
            }
            
            // Add a cache-busting parameter to the URL
            const urlWithNoCache = addNoCacheParam(photo.url);
            
            // Try to verify the URL
            const isValid = await photoService.verifyPhotoUrl(urlWithNoCache);
            if (isValid) {
              newPhotoUrls[photoId] = urlWithNoCache;
            } else {
              console.warn(`URL da foto ${photoId} não é válida, tentando regenerar...`);
              
              // Try to regenerate URL
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
          // If we have a file but no URL, create an object URL
          newPhotoUrls[photoId] = URL.createObjectURL(photo.file);
        }
      }
      
      setPhotoUrls(newPhotoUrls);
    };
    
    processPhotos();
    
    // Clean up object URLs when unmounting
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

  // Function to get a safe photo URL
  const getPhotoUrl = (photo: PhotoWithFile): string => {
    const photoId = photo.id || `temp-${Date.now()}`;
    
    // Check if we have a fallback URL first
    if (fallbackUrls[photoId]) {
      return fallbackUrls[photoId];
    }
    
    // Caso contrário, usar a URL processada ou vazia
    return photoUrls[photoId] || '';
  };
  
  // Function to handle image loading errors
  const handleImageError = async (photoId: string, photoUrl: string) => {
    console.log("Erro ao carregar imagem:", photoId);
    setImageErrors(prev => ({
      ...prev,
      [photoId]: true
    }));
    
    // Try to download the image directly as a fallback
    try {
      setIsRefreshing(prev => ({ ...prev, [photoId]: true }));
      
      // First, try to regenerate the URL
      const regeneratedUrl = photoService.regeneratePublicUrl(photoUrl);
      if (regeneratedUrl && regeneratedUrl !== photoUrl) {
        const isValid = await photoService.verifyPhotoUrl(regeneratedUrl);
        if (isValid) {
          console.log(`URL regenerada com sucesso para ${photoId}: ${regeneratedUrl}`);
          setFallbackUrls(prev => ({
            ...prev,
            [photoId]: regeneratedUrl
          }));
          
          setImageErrors(prev => ({
            ...prev,
            [photoId]: false
          }));
          
          setIsRefreshing(prev => ({ ...prev, [photoId]: false }));
          return;
        }
      }
      
      // If regeneration didn't work, try direct download
      const fallbackUrl = await photoService.downloadPhoto(photoUrl);
      if (fallbackUrl) {
        console.log(`Fallback URL criada para ${photoId}: ${fallbackUrl}`);
        setFallbackUrls(prev => ({
          ...prev,
          [photoId]: fallbackUrl
        }));
        
        // Clear error since we now have a fallback URL
        setImageErrors(prev => ({
          ...prev,
          [photoId]: false
        }));
      }
    } catch (error) {
      console.error(`Erro ao criar fallback para ${photoId}:`, error);
    } finally {
      setIsRefreshing(prev => ({ ...prev, [photoId]: false }));
    }
  };
  
  // Function to refresh a photo URL
  const refreshPhotoUrl = async (photoId: string, photoUrl: string) => {
    try {
      setIsRefreshing(prev => ({ ...prev, [photoId]: true }));
      
      // Try to regenerate the URL
      const regeneratedUrl = photoService.regeneratePublicUrl(photoUrl);
      if (regeneratedUrl) {
        console.log(`URL regenerada: ${regeneratedUrl}`);
        
        // Check if the regenerated URL is accessible
        const isValid = await photoService.verifyPhotoUrl(regeneratedUrl);
        if (isValid) {
          setFallbackUrls(prev => ({
            ...prev,
            [photoId]: addNoCacheParam(regeneratedUrl)
          }));
          
          setImageErrors(prev => ({
            ...prev,
            [photoId]: false
          }));
          
          toast.success("Imagem atualizada com sucesso");
          return;
        }
      }
      
      // If regeneration didn't work, try direct download
      const fallbackUrl = await photoService.downloadPhoto(photoUrl);
      if (fallbackUrl) {
        setFallbackUrls(prev => ({
          ...prev,
          [photoId]: fallbackUrl
        }));
        
        setImageErrors(prev => ({
          ...prev,
          [photoId]: false
        }));
        
        toast.success("Imagem recuperada do armazenamento");
      } else {
        toast.error("Não foi possível recuperar a imagem");
      }
    } catch (error) {
      console.error("Erro ao atualizar URL da foto:", error);
      toast.error("Erro ao atualizar imagem");
    } finally {
      setIsRefreshing(prev => ({ ...prev, [photoId]: false }));
    }
  };

  // Garantir que photos seja sempre um array
  const safePhotos = Array.isArray(photos) ? photos : [];

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {safePhotos.map((photo, index) => {
          const photoId = photo.id || `temp-${index}`;
          const photoUrl = getPhotoUrl(photo);
          const hasError = imageErrors[photoId];
          const isRefreshingThis = isRefreshing[photoId];
          
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
                      <div className="w-20 h-20 flex flex-col items-center justify-center rounded-md border bg-gray-100">
                        <AlertTriangle className="h-5 w-5 text-amber-500 mb-1" />
                        <span className="text-xs text-gray-500 text-center">Erro</span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="p-1 h-auto mt-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            refreshPhotoUrl(photoId, photo.url);
                          }}
                          disabled={isRefreshingThis}
                        >
                          <RefreshCw className={`h-3 w-3 ${isRefreshingThis ? 'animate-spin' : ''}`} />
                        </Button>
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
                      <div className="w-full h-[80vh] flex flex-col items-center justify-center bg-gray-100">
                        <AlertTriangle className="h-6 w-6 text-amber-500 mb-2" />
                        <span className="text-gray-500 mb-4">Não foi possível carregar a imagem</span>
                        <Button 
                          onClick={() => refreshPhotoUrl(photoId, photo.url)}
                          disabled={isRefreshingThis}
                        >
                          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshingThis ? 'animate-spin' : ''}`} />
                          Tentar novamente
                        </Button>
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
        
        {/* Botão de upload sempre visível, independentemente de haver fotos ou não */}
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
