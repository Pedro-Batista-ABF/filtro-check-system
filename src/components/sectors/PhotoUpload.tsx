
import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Camera, X, Upload } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { PhotoWithFile } from "@/types";

export interface PhotoUploadProps {
  onChange: (files: FileList) => void;
  disabled?: boolean;
  title?: string;
  required?: boolean;
  photos?: PhotoWithFile[]; // Adicionada propriedade photos
}

const PhotoUpload: React.FC<PhotoUploadProps> = ({
  onChange,
  disabled = false,
  title = "Adicionar fotos",
  required = false,
  photos = [] // Adicionado valor padrão
}) => {
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    
    if (disabled) return;
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onChange(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onChange(e.target.files);
    }
  };

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Exibindo fotos, se existirem
  const renderPhotos = () => {
    if (!photos || photos.length === 0) return null;
    
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4">
        {photos.map((photo, index) => (
          <div key={photo.id || index} className="relative">
            <img 
              src={photo.url || URL.createObjectURL(photo.file)}
              alt={`Foto ${index + 1}`}
              className="w-full h-20 object-cover rounded-md"
              onError={(e) => {
                // Tratar erro de carregamento da imagem
                (e.target as HTMLImageElement).src = '/placeholder.svg';
                (e.target as HTMLImageElement).alt = 'Imagem indisponível';
              }}
            />
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">
        {title} {required && <span className="text-red-500">*</span>}
      </label>
      
      <div
        className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors
          ${dragging ? 'border-primary bg-primary/5' : 'border-gray-300'}
          ${disabled ? 'opacity-60 cursor-not-allowed' : 'hover:border-primary hover:bg-primary/5'}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={disabled ? undefined : handleButtonClick}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          disabled={disabled}
        />
        
        <div className="flex flex-col items-center py-4">
          <Upload className="h-8 w-8 text-gray-400 mb-2" />
          <p className="text-sm text-gray-600">
            Arraste e solte fotos aqui ou clique para selecionar
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Formatos suportados: JPG, PNG, WEBP
          </p>
        </div>
      </div>

      {/* Exibir as fotos já carregadas */}
      {renderPhotos()}
    </div>
  );
};

export default PhotoUpload;
