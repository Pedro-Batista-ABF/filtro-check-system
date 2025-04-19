
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import ServiceQuantity from "../../service-parts/ServiceQuantity";
import { Service } from "@/types";
import ServicePhotos from "../../service-parts/ServicePhotos";
import { Textarea } from "@/components/ui/textarea";

interface ServiceCheckProps {
  service: Service;
  onChange: (id: string, checked: boolean) => void;
  onQuantityChange: (id: string, quantity: number) => void;
  onObservationChange: (id: string, observations: string) => void;
  onPhotoUpload: (id: string, files: FileList, type: "before" | "after") => void;
  onCameraCapture?: (e: React.MouseEvent, serviceId: string) => void;
  photoRequired?: boolean;
  error?: boolean;
}

export default function ServiceCheck({
  service,
  onChange,
  onQuantityChange,
  onObservationChange,
  onPhotoUpload,
  onCameraCapture,
  photoRequired = true,
  error = false
}: ServiceCheckProps) {
  const hasPhotos = Array.isArray(service.photos) && service.photos.length > 0;
  
  const handleCheckboxChange = (checked: boolean) => {
    onChange(service.id, checked);
  };
  
  const handleCameraCapture = (e: React.MouseEvent) => {
    if (onCameraCapture) {
      onCameraCapture(e, service.id);
    }
  };

  return (
    <Card className={`${error ? 'border-red-500' : ''}`}>
      <CardContent className="pt-6 px-4 pb-4">
        <div className="flex items-start space-x-2">
          <Checkbox
            id={`service-${service.id}`}
            checked={service.selected}
            onCheckedChange={handleCheckboxChange}
          />
          <div className="grid gap-1.5 leading-none w-full">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center w-full">
              <Label
                htmlFor={`service-${service.id}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {service.name}
              </Label>
            </div>
            
            {service.selected && (
              <div className="mt-2 space-y-4">
                <ServiceQuantity
                  quantity={service.quantity || 1}
                  onChange={(quantity) => onQuantityChange(service.id, quantity)}
                />
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Observações</Label>
                  <Textarea
                    value={service.observations || ''}
                    onChange={(e) => onObservationChange(service.id, e.target.value)}
                    placeholder="Observações sobre o serviço..."
                    className="resize-none h-20"
                  />
                </div>
                
                <ServicePhotos
                  service={service}
                  photoType="before"
                  required={photoRequired}
                  onFileInputChange={() => {}}
                  onPhotoUpload={onPhotoUpload}
                  onCameraCapture={handleCameraCapture}
                />
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
