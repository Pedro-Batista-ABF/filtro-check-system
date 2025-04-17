
import React from 'react';
import { Service, Photo } from "@/types";
import ServiceCheck from './ServiceCheck';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface ServicesSectionProps {
  services: Service[];
  handleServiceChange: (id: string, checked: boolean) => void;
  handleQuantityChange: (id: string, quantity: number) => void;
  handleObservationChange?: (id: string, observations: string) => void;
  handlePhotoUpload: (id: string, files: FileList, type: "before" | "after") => void;
  onCameraCapture: (e: React.MouseEvent, serviceId: string) => void;
  formErrors: {
    services?: boolean;
    photos?: boolean;
  };
  photoRequired: boolean;
  servicesWithoutPhotos: string[];
}

export default function ServicesSection({
  services,
  handleServiceChange,
  handleQuantityChange,
  handleObservationChange,
  handlePhotoUpload,
  onCameraCapture,
  formErrors,
  photoRequired,
  servicesWithoutPhotos
}: ServicesSectionProps) {
  if (!Array.isArray(services) || services.length === 0) {
    return <div>Nenhum serviço disponível</div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-2">Serviços a realizar</h3>
      
      {formErrors.services && (
        <Alert variant="destructive" className="bg-red-50 border-red-200">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Selecione ao menos um serviço</AlertDescription>
        </Alert>
      )}
      
      {formErrors.photos && photoRequired && (
        <Alert variant="destructive" className="bg-red-50 border-red-200">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Os seguintes serviços precisam de pelo menos uma foto: {servicesWithoutPhotos.join(", ")}
          </AlertDescription>
        </Alert>
      )}
      
      <div className="space-y-4">
        {services.map(service => (
          <ServiceCheck 
            key={service.id}
            service={service}
            handleServiceChange={handleServiceChange}
            handleQuantityChange={handleQuantityChange} 
            handleObservationChange={handleObservationChange}
            handlePhotoUpload={handlePhotoUpload}
            onCameraCapture={onCameraCapture}
            photoRequired={photoRequired}
          />
        ))}
      </div>
    </div>
  );
}
