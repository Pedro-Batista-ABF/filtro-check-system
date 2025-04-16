
import React, { useState } from "react";
import { Service, Photo, Sector } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Circle, Camera } from "lucide-react";
import ServiceCheck from "./ServiceCheck";

interface ServicesSectionProps {
  services: Service[];
  sector: Sector;
  onChange: (updatedServices: Service[]) => void;
  readOnly?: boolean;
}

const ServicesSection: React.FC<ServicesSectionProps> = ({
  services,
  sector,
  onChange,
  readOnly = false,
}) => {
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  const handleServiceCheck = (service: Service) => {
    if (readOnly) return;

    const updatedServices = services.map((s) => {
      if (s.id === service.id) {
        return {
          ...s,
          selected: !s.selected,
        };
      }
      return s;
    });

    onChange(updatedServices);
  };

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
  };

  const handleCloseServiceDetails = () => {
    setSelectedService(null);
  };

  const handleServiceUpdate = (updatedService: Service) => {
    const updatedServices = services.map((s) => {
      if (s.id === updatedService.id) {
        return updatedService;
      }
      return s;
    });

    onChange(updatedServices);
    setSelectedService(null);
  };

  const countSelectedServices = () => {
    return services.filter((s) => s.selected).length;
  };

  const countTotalPhotos = () => {
    return services.reduce((total, service) => {
      return total + (service.photos?.length || 0);
    }, 0);
  };

  // Verifica se cada serviço selecionado tem pelo menos uma foto
  const checkAllSelectedServicesHavePhotos = () => {
    return services
      .filter((s) => s.selected)
      .every((s) => s.photos && s.photos.length > 0);
  };

  // Renderizar o ícone de status para cada serviço
  const renderServiceStatusIcon = (service: Service) => {
    if (service.selected) {
      const hasPhotos = service.photos && service.photos.length > 0;
      
      if (hasPhotos) {
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      } else {
        return <Camera className="h-5 w-5 text-amber-500" />;
      }
    } else {
      return <Circle className="h-5 w-5 text-gray-300" />;
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                Serviços Selecionados ({countSelectedServices()})
              </h3>
              <div className="text-sm text-gray-500">
                {countTotalPhotos()} foto(s) registrada(s)
              </div>
            </div>

            <div className="space-y-2">
              {services.map((service) => (
                <div
                  key={service.id}
                  className={`p-3 rounded-md border flex items-center justify-between cursor-pointer
                    ${service.selected ? "bg-gray-50" : ""}
                    ${readOnly ? "" : "hover:bg-gray-50"}`}
                  onClick={() => (readOnly ? null : handleServiceSelect(service))}
                >
                  <div className="flex items-center flex-1">
                    <div className="mr-3">
                      {renderServiceStatusIcon(service)}
                    </div>
                    <div>
                      <p className={`${service.selected ? "font-medium" : ""}`}>
                        {service.name}
                      </p>
                      {service.selected && service.quantity && service.quantity > 0 && (
                        <p className="text-sm text-gray-500">
                          Quantidade: {service.quantity}
                        </p>
                      )}
                    </div>
                  </div>
                  {!readOnly && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleServiceCheck(service);
                      }}
                    >
                      {service.selected ? "Remover" : "Selecionar"}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedService && (
        <ServiceCheck
          service={selectedService}
          onClose={handleCloseServiceDetails}
          onSave={handleServiceUpdate}
          beforePhotos={sector.beforePhotos.filter(
            (photo: Photo) => photo.serviceId === selectedService.id
          ) as Photo[]}
          readOnly={readOnly}
        />
      )}
    </div>
  );
};

export default ServicesSection;
