
import React, { useState } from 'react';
import { Service } from '@/types';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import ServiceDetails from './service-parts/ServiceDetails';
import ServiceQuantity from './service-parts/ServiceQuantity';
import ServicePhotos from './service-parts/ServicePhotos';

interface ServiceCheckboxProps {
  service: Service;
  checked?: boolean;
  onChecked?: (id: string, checked: boolean) => void;
  onServiceChange?: (id: string, checked: boolean) => void; 
  onQuantityChange?: (id: string, quantity: number) => void;
  onObservationChange?: (id: string, observations: string) => void;
  onPhotoUpload?: (id: string, files: FileList, type: "before" | "after") => void;
  photoType?: "before" | "after";
  required?: boolean;
  isCompleted?: boolean;
  completedCheckboxId?: string;
  onCameraCapture?: (e: React.MouseEvent) => void;
}

export default function ServiceCheckbox({
  service,
  checked = false,
  onChecked,
  onServiceChange,
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

  const handleServiceChange = (checked: boolean) => {
    if (onChecked) onChecked(service.id, checked);
    if (onServiceChange) onServiceChange(service.id, checked);
    setExpanded(checked);
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
          <ServiceDetails
            service={service}
            isCompleted={isCompleted}
            completedCheckboxId={completedCheckboxId}
            isMissingPhotos={isMissingPhotos}
          />

          {expanded && (
            <div className="mt-3 space-y-4">
              {onQuantityChange && (
                <ServiceQuantity
                  service={service}
                  onQuantityChange={onQuantityChange}
                />
              )}

              {onObservationChange && (
                <ServiceDetails.Observations
                  service={service}
                  onObservationChange={onObservationChange}
                />
              )}

              {onPhotoUpload && (
                <ServicePhotos
                  service={service}
                  photoType={photoType}
                  required={required}
                  onPhotoUpload={onPhotoUpload}
                  onCameraCapture={onCameraCapture}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
