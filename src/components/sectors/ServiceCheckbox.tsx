
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import PhotoUpload from "./PhotoUpload";
import { Service, Photo, ServiceType } from "@/types";

interface ServiceCheckboxProps {
  service: Service;
  checked?: boolean;
  onChecked?: (id: string, checked: boolean) => void;
  onServiceChange?: (id: string, checked: boolean) => void;
  onQuantityChange?: (id: string, quantity: number) => void;
  onObservationChange?: (id: string, observations: string) => void;
  onPhotoUpload?: (id: string, files: FileList, type: "before" | "after") => void;
  disabled?: boolean;
  photoType?: "before" | "after";
  existingPhotos?: Photo[];
  onChange?: (files: FileList) => void;
  completedCheckboxId?: string;
  isCompleted?: boolean;
  key?: string;
  photoRequired?: boolean;
  required?: boolean;
}

export default function ServiceCheckbox({
  service,
  checked = false,
  onChecked,
  onServiceChange,
  onQuantityChange,
  onObservationChange,
  onPhotoUpload,
  disabled = false,
  photoType = "before",
  existingPhotos = [],
  completedCheckboxId,
  isCompleted,
  onChange,
  photoRequired = false,
  required = false
}: ServiceCheckboxProps) {
  const [isSelected, setIsSelected] = useState(checked || service.selected || false);
  const [quantity, setQuantity] = useState(service.quantity || 1);
  const [observations, setObservations] = useState(service.observations || "");

  const handleChange = (checked: boolean) => {
    setIsSelected(checked);
    if (onChecked) {
      onChecked(service.id, checked);
    }
    if (onServiceChange) {
      onServiceChange(service.id, checked);
    }
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuantity = parseInt(e.target.value) || 1;
    setQuantity(newQuantity);
    if (onQuantityChange) {
      onQuantityChange(service.id, newQuantity);
    }
  };

  const handleObservationChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newObservation = e.target.value;
    setObservations(newObservation);
    if (onObservationChange) {
      onObservationChange(service.id, newObservation);
    }
  };

  const handlePhotoUpload = (files: FileList) => {
    if (onPhotoUpload) {
      onPhotoUpload(service.id, files, photoType);
    }
    if (onChange) {
      onChange(files);
    }
  };

  return (
    <div className={`p-4 rounded-lg border ${isSelected ? 'bg-gray-50 border-primary/50' : 'bg-white'}`}>
      <div className="flex items-start space-x-3">
        <Checkbox 
          id={`service-${service.id}`} 
          checked={isSelected}
          onCheckedChange={handleChange}
          disabled={disabled}
          required={required}
        />
        <div className="space-y-1.5 flex-1">
          <Label 
            htmlFor={`service-${service.id}`}
            className="text-base font-medium cursor-pointer"
          >
            {service.name}
          </Label>
          
          {isSelected && (
            <div className="space-y-4 mt-3">
              <div>
                <Label 
                  htmlFor={`quantity-${service.id}`}
                  className="text-sm font-medium mb-1 block"
                >
                  Quantidade
                </Label>
                <Input 
                  id={`quantity-${service.id}`}
                  type="number" 
                  value={quantity}
                  min={1} 
                  onChange={handleQuantityChange}
                  className="w-full max-w-[120px]"
                  disabled={disabled}
                />
              </div>
              
              <div>
                <Label 
                  htmlFor={`observations-${service.id}`}
                  className="text-sm font-medium mb-1 block"
                >
                  Observações
                </Label>
                <Textarea 
                  id={`observations-${service.id}`}
                  value={observations}
                  onChange={handleObservationChange}
                  placeholder="Adicione observações sobre este serviço"
                  className="w-full h-20"
                  disabled={disabled}
                />
              </div>
              
              <PhotoUpload
                id={`photo-${service.id}`}
                label={`Fotos do ${photoType === "before" ? "Defeito" : "Serviço Concluído"}`}
                onChange={handlePhotoUpload}
                existingPhotos={existingPhotos}
                disabled={disabled}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
