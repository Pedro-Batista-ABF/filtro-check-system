
import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import QuantityInput from "./QuantityInput";
import PhotoUpload from "./PhotoUpload";
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";
import { Service, Photo } from "@/types";

interface ServiceCheckboxProps {
  service: Service;
  checked?: boolean;
  onChecked?: (id: string, checked: boolean) => void;
  onServiceChange?: (id: string, checked: boolean) => void; // Alias para compatibilidade
  onQuantityChange?: (id: string, quantity: number) => void;
  onObservationChange?: (id: string, observations: string) => void;
  onPhotoUpload?: (id: string, files: FileList, type: "before" | "after") => void;
  photoType?: "before" | "after";
  required?: boolean;
  onCameraCapture?: (e: React.MouseEvent) => void;
}

const ServiceCheckbox: React.FC<ServiceCheckboxProps> = ({
  service,
  checked = false,
  onChecked,
  onServiceChange, // Alias para compatibilidade
  onQuantityChange,
  onObservationChange,
  onPhotoUpload,
  photoType = "before",
  required = false,
  onCameraCapture
}) => {
  const handleCheckedChange = (checked: boolean) => {
    if (onChecked) {
      onChecked(service.id, checked);
    } else if (onServiceChange) {
      onServiceChange(service.id, checked);
    }
  };

  const handleQuantityChange = (quantity: number) => {
    if (onQuantityChange) {
      onQuantityChange(service.id, quantity);
    }
  };

  const handleObservationChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (onObservationChange) {
      onObservationChange(service.id, e.target.value);
    }
  };

  const handlePhotoUpload = (files: FileList) => {
    if (onPhotoUpload) {
      onPhotoUpload(service.id, files, photoType || "before");
    }
  };

  // Filtrar apenas as fotos do tipo atual (before/after)
  const filteredPhotos = service.photos?.filter(
    (photo) => typeof photo === "object" && photo.type === photoType
  ) as Photo[];

  // Verificar se este serviço tem fotos
  const hasPhotos = filteredPhotos && filteredPhotos.length > 0;

  return (
    <div className="border rounded-md p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-2">
          <Checkbox
            id={`service-${service.id}`}
            checked={checked}
            onCheckedChange={handleCheckedChange}
          />
          <div>
            <Label
              htmlFor={`service-${service.id}`}
              className="font-medium cursor-pointer"
            >
              {service.name} {required && checked && <span className="text-red-500">*</span>}
            </Label>
            {checked && onQuantityChange && (
              <div className="mt-2">
                <QuantityInput
                  value={service.quantity || 1}
                  onChange={handleQuantityChange}
                  min={1}
                  max={100}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {checked && (
        <div className="mt-4 space-y-4">
          <div>
            <Label htmlFor={`observation-${service.id}`}>Observações</Label>
            <Textarea
              id={`observation-${service.id}`}
              value={service.observations || ""}
              onChange={handleObservationChange}
              placeholder="Observações sobre este serviço..."
              className="mt-1"
            />
          </div>

          <div>
            <Label className="block mb-2">
              Fotos {required && <span className="text-red-500">*</span>}
            </Label>
            <div className="flex items-center space-x-2">
              <PhotoUpload
                onUpload={handlePhotoUpload}
                photos={filteredPhotos}
                required={required}
                className="flex-1"
              />
              {onCameraCapture && (
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={onCameraCapture}
                  title="Usar câmera"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              )}
            </div>
            {required && !hasPhotos && (
              <p className="text-xs text-red-500 mt-1">
                Foto obrigatória para este serviço
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceCheckbox;
