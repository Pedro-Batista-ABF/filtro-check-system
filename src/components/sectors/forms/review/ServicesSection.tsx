
import React from 'react';
import { Service } from "@/types";
import { Label } from "@/components/ui/label";
import ServiceCheck from "./ServiceCheck";
import { Textarea } from "@/components/ui/textarea";
import ServicePhotoUpload from "@/components/sectors/PhotoUpload";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface ServicesSectionProps {
  services: Service[];
  handleServiceChange: (id: string, checked: boolean) => void;
  handleQuantityChange: (id: string, quantity: number) => void;
  handleObservationChange: (id: string, observations: string) => void;
  handlePhotoUpload: (id: string, files: FileList, type: "before" | "after") => void;
  onCameraCapture: (e: React.MouseEvent, serviceId?: string) => void;
  formErrors: {
    services?: boolean;
    photos?: boolean;
  };
  photoRequired: boolean;
  servicesWithoutPhotos: string[];
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({
  services,
  handleServiceChange,
  handleQuantityChange,
  handleObservationChange,
  handlePhotoUpload,
  onCameraCapture,
  formErrors,
  photoRequired,
  servicesWithoutPhotos
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Serviços</h3>
      </div>

      {formErrors.services && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Selecione pelo menos um serviço.
          </AlertDescription>
        </Alert>
      )}

      {photoRequired && formErrors.photos && servicesWithoutPhotos.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Adicione pelo menos uma foto para cada serviço selecionado:
            <ul className="list-disc pl-5 mt-1">
              {servicesWithoutPhotos.map(service => (
                <li key={service}>{service}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-3">
        {services.map((service) => (
          <div
            key={service.id}
            className="border rounded-md p-3 space-y-3"
          >
            <div className="flex items-start justify-between">
              <ServiceCheck
                service={service}
                checked={service.selected}
                onChange={(checked) => handleServiceChange(service.id, checked)}
              />

              {service.selected && (
                <div className="flex items-center space-x-2">
                  <Label htmlFor={`quantity-${service.id}`} className="text-sm">Quantidade:</Label>
                  <input
                    id={`quantity-${service.id}`}
                    type="number"
                    min="1"
                    value={service.quantity}
                    onChange={(e) => handleQuantityChange(service.id, parseInt(e.target.value))}
                    className="w-16 h-8 rounded-md border border-gray-300 px-2 text-sm"
                  />
                </div>
              )}
            </div>

            {service.selected && (
              <>
                <div>
                  <Label htmlFor={`observation-${service.id}`} className="text-sm mb-1 block">
                    Observações:
                  </Label>
                  <Textarea
                    id={`observation-${service.id}`}
                    value={service.observations || ""}
                    onChange={(e) => handleObservationChange(service.id, e.target.value)}
                    placeholder="Adicione observações sobre este serviço..."
                    className="resize-none min-h-[80px]"
                  />
                </div>
                <div>
                  <Label className="text-sm mb-1 block">
                    Fotos do defeito {photoRequired && <span className="text-red-500">*</span>}:
                  </Label>
                  <ServicePhotoUpload
                    serviceId={service.id}
                    photos={service.photos?.filter(p => p.type === "before") || []}
                    onUpload={(files) => handlePhotoUpload(service.id, files, "before")}
                    hasError={photoRequired && 
                      service.selected && 
                      (!service.photos || service.photos.filter(p => p.type === "before").length === 0)}
                    onCameraCapture={(e) => onCameraCapture(e, service.id)}
                  />
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
