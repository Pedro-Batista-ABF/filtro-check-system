
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Service } from "@/types";
import ServiceCheckbox from "../../ServiceCheckbox";

interface ServicesSectionProps {
  services: Service[];
  handleServiceChange: (id: string, checked: boolean) => void;
  handleQuantityChange: (id: string, quantity: number) => void;
  handleObservationChange: (id: string, observations: string) => void;
  handlePhotoUpload: (id: string, files: FileList, type: "before" | "after") => void;
  onCameraCapture: (e: React.MouseEvent, serviceId: string) => void;
  formErrors: {
    services?: boolean;
    photos?: boolean;
  };
  photoRequired: boolean;
  servicesWithoutPhotos?: string[];
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
  servicesWithoutPhotos = []
}: ServicesSectionProps) {
  const hasServicesWithoutPhotos = servicesWithoutPhotos.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Serviços Necessários</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {formErrors.services && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Selecione pelo menos um serviço</AlertDescription>
          </Alert>
        )}
        
        {formErrors.photos && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Cada serviço selecionado deve ter pelo menos uma foto
              {hasServicesWithoutPhotos && (
                <div className="mt-1">
                  <strong>Serviços sem fotos:</strong>
                  <ul className="list-disc pl-5 mt-1">
                    {servicesWithoutPhotos.map((serviceName, index) => (
                      <li key={index}>{serviceName}</li>
                    ))}
                  </ul>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}
        
        {services.length === 0 ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Nenhum serviço disponível. Entre em contato com o administrador.
            </AlertDescription>
          </Alert>
        ) : (
          services.map((service) => (
            <ServiceCheckbox
              key={service.id}
              service={service}
              checked={service.selected}
              onChecked={handleServiceChange}
              onQuantityChange={handleQuantityChange}
              onObservationChange={handleObservationChange}
              onPhotoUpload={handlePhotoUpload}
              photoType="before"
              required={photoRequired}
              onCameraCapture={(e) => onCameraCapture(e, service.id)}
            />
          ))
        )}
      </CardContent>
    </Card>
  );
}
