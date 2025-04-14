
import React, { useState, useRef, ChangeEvent, MouseEvent } from 'react';
import { Service, Photo, PhotoWithFile } from '@/types';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { AlertTriangle, Camera } from 'lucide-react';
import PhotoUpload from './PhotoUpload';
import QuantityInput from './QuantityInput';

interface ServiceCheckboxProps {
  service: Service;
  checked?: boolean;
  onChecked: (id: string, checked: boolean) => void;
  onQuantityChange?: (id: string, quantity: number) => void;
  onObservationChange?: (id: string, observations: string) => void;
  onPhotoUpload?: (id: string, files: FileList, type: "before" | "after") => void;
  photoType?: "before" | "after";
  required?: boolean;
  isCompleted?: boolean;
  completedCheckboxId?: string;
  onCameraCapture?: (e: MouseEvent) => void;
}

export default function ServiceCheckbox({
  service,
  checked = false,
  onChecked,
  onQuantityChange,
  onObservationChange,
  onPhotoUpload,
  photoType = "before",
  required = false,
  isCompleted = false,
  completedCheckboxId,
  onCameraCapture
}: ServiceCheckboxProps) {
  const [expanded, setExpanded] = useState(checked);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleServiceChange = (checked: boolean) => {
    onChecked(service.id, checked);
    setExpanded(checked);
  };

  const handleQuantityChange = (quantity: number) => {
    if (onQuantityChange) {
      onQuantityChange(service.id, quantity);
    }
  };

  const handleObservationChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    if (onObservationChange) {
      onObservationChange(service.id, e.target.value);
    }
  };

  const handlePhotoUpload = (files: FileList) => {
    if (onPhotoUpload && photoType) {
      onPhotoUpload(service.id, files, photoType);
    }
  };
  
  const handleCameraClick = (e: MouseEvent) => {
    if (onCameraCapture) {
      onCameraCapture(e);
    }
  };

  // Flag para indicar se o serviço está selecionado mas não tem fotos
  const isMissingPhotos = required && checked && 
    (!service.photos || service.photos.length === 0);

  return (
    <div className={`border rounded-lg p-4 ${expanded ? 'bg-gray-50' : ''} ${isMissingPhotos ? 'border-red-500' : 'border-gray-200'}`}>
      <div className="flex items-start gap-3">
        <Checkbox
          id={`service-${service.id}`}
          checked={checked}
          onCheckedChange={handleServiceChange}
          className="mt-1"
        />
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Label
              htmlFor={`service-${service.id}`}
              className="text-lg font-medium cursor-pointer"
            >
              {service.name}
            </Label>
            
            {isMissingPhotos && (
              <span className="text-xs text-red-500 flex items-center">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Foto obrigatória
              </span>
            )}
            
            {isCompleted && completedCheckboxId && (
              <span className="text-xs text-green-600 font-medium ml-2">
                Serviço concluído
              </span>
            )}
          </div>

          {expanded && (
            <div className="mt-3 space-y-4">
              {onQuantityChange && (
                <div className="space-y-1">
                  <Label htmlFor={`quantity-${service.id}`} className="text-sm">
                    Quantidade
                  </Label>
                  <QuantityInput
                    value={service.quantity || 1}
                    onChange={handleQuantityChange}
                    min={1}
                    max={100}
                  />
                </div>
              )}

              {onObservationChange && (
                <div className="space-y-1">
                  <Label htmlFor={`observations-${service.id}`} className="text-sm">
                    Observações
                  </Label>
                  <Textarea
                    id={`observations-${service.id}`}
                    value={service.observations || ""}
                    onChange={handleObservationChange}
                    placeholder="Detalhes sobre o serviço..."
                    className="resize-none h-20"
                  />
                </div>
              )}

              {onPhotoUpload && (
                <div className="space-y-1">
                  <Label className="text-sm flex items-center justify-between">
                    <span>
                      Fotos {photoType === "before" ? "do Defeito" : "da Execução"}
                      {required && <span className="text-red-500 ml-1">*</span>}
                    </span>
                    
                    {onCameraCapture && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleCameraClick}
                        title="Usar câmera"
                      >
                        <Camera className="h-4 w-4 mr-2" />
                        Câmera
                      </Button>
                    )}
                  </Label>
                  
                  <PhotoUpload
                    photos={service.photos as PhotoWithFile[] || []}
                    onChange={handlePhotoUpload}
                    disabled={!checked}
                    title={`Adicionar fotos ${photoType === "before" ? "do defeito" : "da execução"}`}
                    required={required}
                    onCameraCapture={onCameraCapture}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
