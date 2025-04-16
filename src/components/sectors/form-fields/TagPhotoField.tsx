
import React, { useState } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Camera, Loader2 } from "lucide-react";
import { toast } from "sonner";

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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setUploading(true);
    try {
      await onPhotoUpload(e.target.files);
      setPreviewError(false);
    } catch (error) {
      console.error('Erro ao fazer upload da foto da TAG:', error);
      toast.error("Erro ao fazer upload da foto da TAG");
      setPreviewError(true);
    } finally {
      setUploading(false);
    }
  };

  const handleImageError = () => {
    setPreviewError(true);
  };

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
          disabled={uploading}
        />
        <Button 
          variant="outline" 
          size="icon"
          onClick={onCameraCapture}
          title="Usar câmera"
          disabled={uploading}
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
        </Button>
      </div>
      {tagPhotoUrl && !previewError && (
        <div className="mt-2">
          <img 
            src={tagPhotoUrl} 
            alt="TAG do Setor" 
            className="w-32 h-32 object-cover rounded-md border"
            onError={handleImageError}
          />
        </div>
      )}
      {previewError && tagPhotoUrl && (
        <div className="mt-2 text-sm text-red-500">
          Não foi possível carregar a prévia da imagem. A foto pode ter sido enviada, mas não está disponível para visualização.
        </div>
      )}
      {error && (
        <p className="text-xs text-red-500">Foto do TAG é obrigatória</p>
      )}
    </div>
  );
}
