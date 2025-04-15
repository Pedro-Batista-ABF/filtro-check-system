
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";

interface TagPhotoFieldProps {
  tagPhotoUrl?: string;
  onPhotoUpload: (files: FileList) => void;
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
          onChange={(e) => e.target.files && onPhotoUpload(e.target.files)}
          className={`flex-1 ${error ? "border-red-500" : ""}`}
        />
        <Button 
          variant="outline" 
          size="icon"
          onClick={onCameraCapture}
          title="Usar câmera"
        >
          <Camera className="h-4 w-4" />
        </Button>
      </div>
      {tagPhotoUrl && (
        <div className="mt-2">
          <img 
            src={tagPhotoUrl} 
            alt="TAG do Setor" 
            className="w-32 h-32 object-cover rounded-md border"
          />
        </div>
      )}
      {error && (
        <p className="text-xs text-red-500">Foto do TAG é obrigatória</p>
      )}
    </div>
  );
}
