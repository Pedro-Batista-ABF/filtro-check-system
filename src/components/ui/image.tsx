
import React, { useState, useEffect } from 'react';
import { Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { photoService } from '@/services/photoService';
import { isDataUrl, addNoCacheParam, fixDuplicatedStoragePath } from '@/utils/photoUtils';
import { toast } from 'sonner';

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
  onLoadError?: (error: any) => void;
  onLoadSuccess?: () => void;
  showRefresh?: boolean;
}

export function Image({
  src,
  alt,
  className,
  fallbackSrc = '/placeholder-image.png', // Valor padrão para fallback
  onLoadError,
  onLoadSuccess,
  showRefresh = true,
  ...props
}: ImageProps) {
  const [imgSrc, setImgSrc] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  // Prepare image URL with cache-busting and fix any path issues
  const prepareImageUrl = (url?: string): string | undefined => {
    if (!url) return undefined;
    
    // If it's a data URL, return it as is
    if (isDataUrl(url)) return url;
    
    // Fix common URL issues and add cache-busting parameter
    try {
      const fixedUrl = fixDuplicatedStoragePath(url);
      return addNoCacheParam(fixedUrl);
    } catch (error) {
      console.error('Error preparing image URL:', error);
      return url;
    }
  };

  useEffect(() => {
    // Reset states when src changes
    if (src !== imgSrc) {
      console.log("Image source changed, preparing URL:", src);
      const preparedUrl = prepareImageUrl(src);
      console.log("Prepared URL:", preparedUrl);
      setImgSrc(preparedUrl);
      setIsLoading(true);
      setHasError(false);
      setRetryCount(0);
    }
  }, [src]);

  const handleImageLoad = () => {
    console.log("Image loaded successfully:", imgSrc);
    setIsLoading(false);
    setHasError(false);
    if (onLoadSuccess) onLoadSuccess();
  };

  const handleImageError = async () => {
    console.error('Image failed to load:', imgSrc);
    
    // If we've tried too many times, give up
    if (retryCount >= maxRetries) {
      console.warn(`Exceeded maximum retry attempts (${maxRetries})`);
      setIsLoading(false);
      setHasError(true);
      if (onLoadError) onLoadError(new Error('Failed to load image after multiple attempts'));
      return;
    }
    
    setRetryCount(prev => prev + 1);
    
    // Try recovery options automatically
    if (src && !isDataUrl(src)) {
      try {
        // Try to regenerate the URL first
        const regeneratedUrl = photoService.regeneratePublicUrl(src);
        if (regeneratedUrl) {
          console.log('Trying regenerated URL:', regeneratedUrl);
          setImgSrc(addNoCacheParam(regeneratedUrl));
          return; // Wait for next load attempt
        }
        
        // If regeneration fails, try direct download
        const downloadUrl = await photoService.downloadPhoto(src);
        if (downloadUrl) {
          console.log('Using direct download URL as fallback');
          setImgSrc(downloadUrl);
          setHasError(false);
          return;
        }
        
        // If all else fails, use the fallback if provided
        if (fallbackSrc) {
          console.log('Using fallback image source');
          setImgSrc(fallbackSrc);
          return;
        }
        
        setIsLoading(false);
        setHasError(true);
        if (onLoadError) onLoadError(new Error('Failed to load image'));
      } catch (error) {
        console.error('Error during image recovery:', error);
        setIsLoading(false);
        setHasError(true);
        if (onLoadError) onLoadError(error);
      }
    } else {
      // For data URLs or if no src, just show error state
      setIsLoading(false);
      setHasError(true);
      if (onLoadError) onLoadError(new Error('Failed to load image'));
    }
  };

  const handleRefresh = async () => {
    if (!src) return;
    
    setIsRefreshing(true);
    setHasError(false);
    setRetryCount(0);
    
    try {
      // For data URLs, just use them directly
      if (isDataUrl(src)) {
        setImgSrc(src);
        setIsRefreshing(false);
        toast.success('Imagem atualizada com sucesso');
        return;
      }
      
      // Fix any path issues
      const fixedUrl = fixDuplicatedStoragePath(src);
      
      // Add a new cache-busting parameter
      const refreshedUrl = addNoCacheParam(fixedUrl);
      console.log('Refreshing image with URL:', refreshedUrl);
      setImgSrc(refreshedUrl);
      setIsRefreshing(false);
      
      // Toast will be shown after successful load
    } catch (error) {
      console.error('Error refreshing image:', error);
      setIsRefreshing(false);
      setHasError(true);
      toast.error('Erro ao atualizar imagem');
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={cn("flex items-center justify-center bg-muted", className)} {...props}>
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Error state
  if (hasError) {
    return (
      <div className={cn("flex flex-col items-center justify-center bg-muted", className)} {...props}>
        <AlertCircle className="h-6 w-6 text-destructive mb-2" />
        <span className="text-sm text-muted-foreground mb-2">
          Falha ao carregar imagem
        </span>
        {showRefresh && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Tentar novamente
          </Button>
        )}
      </div>
    );
  }

  // Success state
  return (
    <div className="relative group">
      <img
        src={imgSrc}
        alt={alt}
        className={className}
        onLoad={handleImageLoad}
        onError={handleImageError}
        {...props}
      />
      {showRefresh && (
        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8 bg-white/90 hover:bg-white"
            onClick={handleRefresh}
            disabled={isRefreshing}
            title="Recarregar imagem"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      )}
    </div>
  );
}
