
import { useEffect, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import PhotoUpload from "./PhotoUpload";
import { Service, Photo, ServiceType } from "@/types";

export interface ServiceCheckboxProps {
  service: Service;
  onQuantityChange?: (id: string, quantity: number) => void;
  onObservationChange?: (id: string, observation: string) => void;
  onPhotoUpload?: (id: string, files: FileList, type: "before" | "after") => void;
  onServiceChange?: (id: string, checked: boolean) => void;
  onChange?: (id: string, checked: boolean) => void; // Adicionando para compatibilidade
  isCompleted?: boolean;
  completedCheckboxId?: string;
  photoType?: string;
  required?: boolean;
}

export default function ServiceCheckbox({
  service,
  onQuantityChange,
  onObservationChange,
  onPhotoUpload,
  onServiceChange,
  onChange,
  isCompleted,
  completedCheckboxId,
  photoType,
  required
}: ServiceCheckboxProps) {
  const [isChecked, setIsChecked] = useState(service.selected);
  
  useEffect(() => {
    setIsChecked(service.selected);
  }, [service.selected]);

  const handleChange = (checked: boolean) => {
    setIsChecked(checked);
    if (onServiceChange) {
      onServiceChange(service.id, checked);
    }
    if (onChange) {
      onChange(service.id, checked);
    }
  };

  return (
    <div className="space-y-4 border-b pb-4 mb-4 last:border-b-0">
      <div className="flex items-center space-x-2 mb-2">
        <Checkbox
          id={`service-${service.id}`}
          checked={isChecked} 
          onCheckedChange={handleChange}
        />
        <label 
          htmlFor={`service-${service.id}`}
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          {service.name}
        </label>
      </div>
      
      {isChecked && (
        <div className="pl-6 space-y-4">
          {onQuantityChange && (
            <div className="flex flex-col space-y-2">
              <label htmlFor={`quantity-${service.id}`} className="text-xs font-medium text-gray-700">
                Quantidade
              </label>
              <Input
                id={`quantity-${service.id}`}
                type="number" 
                min="1"
                value={service.quantity}
                onChange={(e) => onQuantityChange(service.id, parseInt(e.target.value) || 1)}
                className="w-24 h-8"
              />
            </div>
          )}
          
          {onObservationChange && (
            <div className="flex flex-col space-y-2">
              <label htmlFor={`obs-${service.id}`} className="text-xs font-medium text-gray-700">
                Observações
              </label>
              <Textarea
                id={`obs-${service.id}`}
                placeholder="Observações sobre este serviço..." 
                value={service.observations || ''}
                onChange={(e) => onObservationChange(service.id, e.target.value)}
                className="min-h-[80px]"
              />
            </div>
          )}
          
          {onPhotoUpload && (
            <div className="space-y-2">
              <div className="text-xs font-medium text-gray-700 mb-1">
                Fotos {photoType === "after" ? "depois do serviço" : "do defeito"}
              </div>
              <div className="flex flex-wrap gap-2 mb-2">
                {service.photos?.filter(photo => 
                  typeof photo === 'object' && photo.type === (photoType === "after" ? 'after' : 'before')
                ).map((photo) => (
                  typeof photo === 'object' && photo.url && (
                    <img 
                      key={photo.id} 
                      src={photo.url} 
                      alt={service.name} 
                      className="w-20 h-20 object-cover rounded border"
                    />
                  )
                ))}
              </div>
              <Input
                id={`photo-${service.id}`}
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => e.target.files && onPhotoUpload(service.id, e.target.files, photoType === "after" ? "after" : "before")}
                className="w-full"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
