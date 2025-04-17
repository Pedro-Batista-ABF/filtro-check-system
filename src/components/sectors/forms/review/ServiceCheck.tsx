
import React from 'react';
import { Service } from "@/types";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import ServiceQuantity from "@/components/sectors/service-parts/ServiceQuantity";
import ServicePhotos from "@/components/sectors/service-parts/ServicePhotos";

interface ServiceCheckProps {
  service: Service;
  handleServiceChange: (id: string, checked: boolean) => void;
  handleQuantityChange: (id: string, quantity: number) => void;
  handleObservationChange?: (id: string, observations: string) => void;
  handlePhotoUpload: (id: string, files: FileList, type: "before" | "after") => void;
  onCameraCapture: (e: React.MouseEvent, serviceId: string) => void;
  photoRequired: boolean;
}

export default function ServiceCheck({
  service,
  handleServiceChange,
  handleQuantityChange,
  handleObservationChange,
  handlePhotoUpload,
  onCameraCapture,
  photoRequired
}: ServiceCheckProps) {
  const hasPhotos = service.photos && service.photos.length > 0;
  const missingPhotos = service.selected && photoRequired && !hasPhotos;
  
  return (
    <div className={`p-4 border rounded-md ${missingPhotos ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}>
      <div className="flex items-start gap-3">
        <Checkbox
          id={`service-${service.id}`}
          checked={service.selected || false}
          onCheckedChange={(checked) => 
            handleServiceChange(service.id, checked === true)
          }
          className="mt-1"
        />
        <div className="flex-1 space-y-2">
          <Label
            htmlFor={`service-${service.id}`}
            className="text-md font-medium cursor-pointer"
          >
            {service.name}
          </Label>
          
          {service.selected && (
            <>
              <ServiceQuantity 
                service={service}
                onUpdate={(quantity) => handleQuantityChange(service.id, quantity)}
              />
              
              {handleObservationChange && (
                <div className="mt-2">
                  <Label htmlFor={`obs-${service.id}`} className="text-sm mb-1 block">
                    Observações
                  </Label>
                  <Textarea
                    id={`obs-${service.id}`}
                    placeholder="Observações sobre o serviço"
                    value={service.observations || ''}
                    onChange={(e) => handleObservationChange(service.id, e.target.value)}
                    className="h-20"
                  />
                </div>
              )}
              
              <ServicePhotos
                service={service}
                photoType="before"
                required={photoRequired}
                onPhotoUpload={(files) => handlePhotoUpload(service.id, files, 'before')}
                onCameraCapture={(e) => onCameraCapture(e, service.id)}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
