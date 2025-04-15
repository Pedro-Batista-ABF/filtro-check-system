
import React from 'react';
import { Service } from '@/types';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import QuantityInput from './QuantityInput';
import PhotoUpload from './PhotoUpload';

interface ServicesListProps {
  services: Service[];
  onServiceChange: (serviceId: string, isSelected: boolean) => void;
  onQuantityChange: (serviceId: string, quantity: number) => void;
  onPhotoChange: (serviceId: string, files: FileList) => void;
  disabled?: boolean;
  beforePhotos: any[];
}

export default function ServicesList({
  services,
  onServiceChange,
  onQuantityChange,
  onPhotoChange,
  disabled = false,
  beforePhotos
}: ServicesListProps) {
  return (
    <div className="space-y-4">
      {services.map((service) => (
        <div key={service.id} className="border p-4 rounded-md">
          <div className="flex items-start space-x-3">
            <Checkbox 
              id={`service-${service.id}`}
              checked={service.selected}
              onCheckedChange={(checked) => onServiceChange(service.id, !!checked)}
              disabled={disabled}
            />
            <div className="flex-1 space-y-2">
              <Label htmlFor={`service-${service.id}`} className="font-medium">
                {service.name}
              </Label>
              
              {service.selected && (
                <div className="ml-6 space-y-4 mt-2">
                  <div>
                    <Label htmlFor={`quantity-${service.id}`}>Quantidade*</Label>
                    <div className="mt-1">
                      <QuantityInput
                        id={`quantity-${service.id}`}
                        value={service.quantity || 1}
                        onChange={(value) => onQuantityChange(service.id, value)}
                        min={1}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label>Fotos do Serviço (ANTES)*</Label>
                    <div className="mt-1">
                      <PhotoUpload
                        photos={beforePhotos.filter(photo => photo.serviceId === service.id)}
                        onChange={(files) => onPhotoChange(service.id, files)}
                        disabled={disabled}
                        title="Adicionar fotos do serviço"
                        required={true}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
