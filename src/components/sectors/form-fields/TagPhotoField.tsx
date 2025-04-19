
import React, { useState, useEffect } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Camera, Loader2, RefreshCw, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { photoService } from "@/services/photoService";
import { isValidUrl, addNoCacheParam, fixDuplicatedStoragePath, isDataUrl } from "@/utils/photoUtils";

interface TagPhotoFieldProps {
  tagPhotoUrl?: string;
  onPhotoUpload: (files: FileList) => Promise<string | undefined>;
  onCameraCapture: (e: React.MouseEvent) => void;
  error?: boolean;
  required?: boolean;
}

export function TagPhotoField({
  tagPhotoUrl,
  onPhotoUpload,
  onCameraCapture,
  error = false,
  required = false
}: TagPhotoFieldProps) {
  const [uploading, setUploading] = useState(false);
  const [previewError, setPreviewError] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(undefined);
  const [verifying, setVerifying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  // Função para normalizar e preparar a URL para exibição
  const prepareImageUrl = (url?: string): string | undefined => {
    if (!url) return undefined;
    
    // Se já for uma URL de dados, retornar diretamente
    if (isDataUrl(url)) return url;
    
    try {
      // Corrigir possíveis problemas na URL
      const fixedUrl = fixDuplicatedStoragePath(url);
      
      // Adicionar parâmetro para evitar cache
      return addNoCacheParam(fixedUrl);
    } catch (error) {
      console.error("Erro ao processar URL da tag:", error);
      return undefined;
    }
  };

  useEffect(() => {
    // Quando a URL muda, atualizar a preview com cache-busting
    if (tagPhotoUrl) {
      try {
        console.log("Atualizando preview com URL:", tagPhotoUrl);
        setPreviewUrl(prepareImageUrl(tagPhotoUrl));
        setPreviewError(false);
      } catch (error) {
        console.error("Erro ao processar URL da tag:", error);
        setPreviewError(true);
      }
    } else {
      setPreviewUrl(undefined);
      setPreviewError(false);
    }
  }, [tagPhotoUrl]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setUploading(true);
    try {
      console.log("Iniciando upload da foto da TAG...");
      // Chamar a função de upload passada via props
      const result = await onPhotoUpload(e.target.files);
      
      // Verificar se temos um resultado válido
      if (!result) {
        throw new Error("Nenhuma URL retornada pelo upload");
      }
      
      console.log("Upload concluído com sucesso, URL:", result);
      
      // Atualizar a preview com a nova URL e evitar cache
      setPreviewUrl(prepareImageUrl(result));
      setPreviewError(false);
      setRetryCount(0);
      toast.success("Foto da TAG carregada com sucesso");
    } catch (error) {
      console.error('Erro ao fazer upload da foto da TAG:', error);
      toast.error("Erro ao fazer upload da foto da TAG");
      setPreviewError(true);
    } finally {
      setUploading(false);
    }
  };

  const handleImageError = async () => {
    console.error("Erro ao carregar imagem da TAG:", previewUrl);
    
    // Se já tentamos muitas vezes, desistir
    if (retryCount >= maxRetries) {
      console.warn(`Excedido número máximo de tentativas (${maxRetries})`);
      setPreviewError(true);
      return;
    }
    
    setRetryCount(prev => prev + A1);
    
    // Primeiro, verificar se a URL está em um formato reconhecível
    if (!isValidUrl(previewUrl)) {
      console.error("URL da imagem inválida:", previewUrl);
      setPreviewError(true);
      return;
    }
    
    // Não mostrar erro ainda, tentar recuperar a imagem automaticamente
    if (tagPhotoUrl && !isDataUrl(tagPhotoUrl)) {
      try {
        // Tentar regenerar a URL e tentar novamente
        console.log("Tentando regenerar URL após erro de carregamento...");
        const regeneratedUrl = photoService.regeneratePublicUrl(tagPhotoUrl);
        
        if (regeneratedUrl) {
          console.log("Usando URL regenerada:", regeneratedUrl);
          setPreviewUrl(addNoCacheParam(regeneratedUrl));
          return; // Tentar carregar novamente com a URL regenerada
        }
        
        // Se regenerar falhar, tentar download direto
        console.log("Tentando baixar imagem diretamente...");
        const directUrl = await photoService.downloadPhoto(tagPhotoUrl);
        
        if (directUrl) {
          console.log("Download direto bem-sucedido, usando URL local:", directUrl);
          setPreviewUrl(directUrl);
          setPreviewError(false);
          return;
        }
        
        // Se tudo falhar, mostrar erro
        console.error("Não foi possível recuperar a imagem após várias tentativas");
        setPreviewError(true);
      } catch (error) {
        console.error("Erro ao tentar recuperar imagem:", error);
        setPreviewError(true);
      }
    } else {
      setPreviewError(true);
    }
  };
  
  const handleRefreshPreview = async () => {
    if (!tagPhotoUrl) return;
    
    setVerifying(true);
    setPreviewError(false);
    setRetryCount(0);
    
    try {
      console.log("Tentando recarregar a imagem:", tagPhotoUrl);
      
      // Se for URL de dados, não precisa recarregar
      if (isDataUrl(tagPhotoUrl)) {
        setPreviewUrl(tagPhotoUrl);
        toast.success("Imagem recarregada com sucesso");
        return;
      }
      
      // Corrigir possíveis problemas na URL
      const fixedUrl = fixDuplicatedStoragePath(tagPhotoUrl);
      
      // Tentar verificar acesso direto primeiro
      const isAccessible = await photoService.verifyPhotoUrl(fixedUrl);
      
      if (isAccessible) {
        console.log("URL acessível, recarregando com parâmetro de cache");
        setPreviewUrl(addNoCacheParam(fixedUrl));
        setPreviewError(false);
        toast.success("Imagem recarregada com sucesso");
        return;
      }
      
      // Tentar regenerar URL
      const regeneratedUrl = photoService.regeneratePublicUrl(fixedUrl);
      
      if (regeneratedUrl) {
        console.log("URL regenerada com sucesso:", regeneratedUrl);
        setPreviewUrl(addNoCacheParam(regeneratedUrl));
        setPreviewError(false);
        toast.success("Imagem recarregada com sucesso");
        return;
      }
      
      // Se não conseguir regenerar, tentar download direto
      console.log("Tentando baixar a imagem diretamente...");
      const directUrl = await photoService.downloadPhoto(fixedUrl);
      
      if (directUrl) {
        console.log("Download direto bem-sucedido");
        setPreviewUrl(directUrl);
        setPreviewError(false);
        toast.success("Imagem carregada via download direto");
      } else {
        console.error("Não foi possível baixar a imagem diretamente");
        setPreviewError(true);
        toast.error("Não foi possível carregar a imagem");
      }
    } catch (error) {
      console.error("Erro ao recarregar preview:", error);
      setPreviewError(true);
      toast.error("Erro ao recarregar imagem");
    } finally {
      setVerifying(false);
    }
  };

  // Tentar recuperação automática se houver URL mas tivermos erro
  useEffect(() => {
    if (tagPhotoUrl && previewError && retryCount === 0) {
      handleRefreshPreview();
    }
  }, [tagPhotoUrl, previewError, retryCount]);

  return (
    <div className="space-y-2">
      <Label htmlFor="tagPhoto" className={error ? "text-red-500" : ""}>
        Foto do TAG
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <div className="flex space-x-2">
        <Input
          id="tagPhoto"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className={`flex-1 ${error ? "border-red-500" : ""}`}
          disabled={uploading || verifying}
        />
        <Button 
          variant="outline" 
          size="icon"
          onClick={onCameraCapture}
          title="Usar câmera"
          disabled={uploading || verifying}
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
        </Button>
      </div>
      
      {previewUrl && !previewError && (
        <div className="mt-2 relative">
          <img 
            src={previewUrl} 
            alt="TAG do Setor" 
            className="w-32 h-32 object-cover rounded-md border"
            onError={handleImageError}
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-1 right-1 bg-white/80 hover:bg-white"
            onClick={handleRefreshPreview}
            disabled={verifying}
            title="Recarregar imagem"
          >
            <RefreshCw className={`h-4 w-4 ${verifying ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      )}
      
      {verifying && (
        <div className="mt-2 flex items-center text-sm text-gray-500">
          <Loader2 className="h-3 w-3 mr-2 animate-spin" />
          Verificando imagem...
        </div>
      )}
      
      {previewError && (
        <div className="mt-2">
          <div className="flex items-center gap-2 text-sm text-red-500 mb-2">
            <AlertTriangle className="h-4 w-4" />
            Não foi possível carregar a prévia da imagem.
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshPreview}
            disabled={verifying}
            className="w-full"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${verifying ? 'animate-spin' : ''}`} />
            Tentar recarregar
          </Button>
        </div>
      )}
      
      {error && !previewError && (
        <p className="text-xs text-red-500">Foto do TAG é obrigatória</p>
      )}
    </div>
  );
}
