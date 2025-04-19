
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Service } from "@/types";
import ServicePhotos from "../service-parts/ServicePhotos";
import { PhotoWithFile } from "@/types";
import { Camera } from "lucide-react";

interface ServiceFormProps {
  services: Service[];
  setServices: React.Dispatch<React.SetStateAction<Service[]>>;
  onServiceSelect: (id: string, checked: boolean) => void;
  onQuantityChange: (id: string, quantity: number) => void;
  onObservationsChange: (id: string, observations: string) => void;
  onPhotoUpload?: (id: string, files: FileList, type: "before" | "after") => Promise<void>;
  disabled?: boolean;
  disableSelection?: boolean;
  status?: string;
  stage?: "peritagem" | "execucao" | "checagem" | "all";
  error?: boolean;
  onCameraCapture: (serviceId: string, photoType: "before" | "after") => void;
}

const ServiceForm: React.FC<ServiceFormProps> = ({
  services,
  setServices,
  onServiceSelect,
  onQuantityChange,
  onObservationsChange,
  onPhotoUpload,
  disabled = false,
  disableSelection = false,
  status,
  stage = "all",
  error = false,
  onCameraCapture
}) => {
  // Estado para a fase atual (antes/depois) para a captura da câmera
  const [currentPhotoService, setCurrentPhotoService] = useState<{id: string, type: "before" | "after"} | null>(null);

  // Filtra os serviços com base no status
  const filteredServices = services.filter(
    service => status === undefined || (
      status === "completed" ? service.completed :
      status === "incomplete" ? !service.completed :
      true
    )
  );

  // Formata o nome do serviço para ser mais legível
  const formatServiceName = (name: string): string => {
    return name
      .replace(/([A-Z])/g, ' $1') // Insere espaço antes de cada letra maiúscula
      .replace(/^./, str => str.toUpperCase()) // Primeira letra maiúscula
      .trim(); // Remove espaços extras
  };

  const handleCameraClick = (serviceId: string, photoType: "before" | "after") => {
    setCurrentPhotoService({id: serviceId, type: photoType});
    onCameraCapture(serviceId, photoType);
  };

  // Se não houver serviços filtrados, exibe uma mensagem
  if (filteredServices.length === 0) {
    return (
      <Card className={`border ${error ? 'border-red-500' : ''}`}>
        <CardContent className="p-4 text-center">
          <p className="text-gray-500">Nenhum serviço disponível.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`border ${error ? 'border-red-500' : ''}`}>
      <CardContent className="p-4">
        <div className="space-y-6">
          {filteredServices.map((service) => {
            // Decide se permite fotos "after" com base no estágio
            const showBeforePhotos = stage === "all" || stage === "peritagem";
            const showAfterPhotos = stage === "all" || stage === "checagem";
            
            return (
              <div key={service.id} className="p-4 border rounded-md">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id={`service-${service.id}`}
                    checked={service.selected}
                    onCheckedChange={(checked) => onServiceSelect(service.id, !!checked)}
                    disabled={disabled || disableSelection}
                    className="mt-1"
                  />
                  <div className="flex-1 space-y-4">
                    <div>
                      <Label htmlFor={`service-${service.id}`} className="font-medium">
                        {formatServiceName(service.name)}
                      </Label>
                      {service.description && (
                        <p className="text-sm text-gray-500 mt-1">{service.description}</p>
                      )}
                    </div>

                    {service.selected && (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor={`quantity-${service.id}`} className="text-sm">
                              Quantidade
                            </Label>
                            <Input
                              id={`quantity-${service.id}`}
                              type="number"
                              min={1}
                              value={service.quantity || 1}
                              onChange={(e) => onQuantityChange(service.id, parseInt(e.target.value) || 1)}
                              className="mt-1"
                              disabled={disabled}
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor={`observations-${service.id}`} className="text-sm">
                            Observações
                          </Label>
                          <Textarea
                            id={`observations-${service.id}`}
                            value={service.observations || ""}
                            onChange={(e) => onObservationsChange(service.id, e.target.value)}
                            className="mt-1"
                            disabled={disabled}
                          />
                        </div>

                        {showBeforePhotos && (
                          <div>
                            <ServicePhotos 
                              service={service}
                              photoType="before"
                              required={stage === "peritagem" || stage === "all"}
                              onFileInputChange={(files) => {
                                if (onPhotoUpload) onPhotoUpload(service.id, files, "before");
                              }}
                              disabled={disabled}
                              onCameraCapture={(e) => {
                                e.preventDefault();
                                handleCameraClick(service.id, "before");
                              }}
                              onPhotoUpload={onPhotoUpload}
                            />
                            <div className="flex space-x-2 mt-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => handleCameraClick(service.id, "before")}
                                disabled={disabled}
                                className="text-xs"
                              >
                                <Camera className="h-3 w-3 mr-1" />
                                Usar câmera
                              </Button>
                            </div>
                          </div>
                        )}

                        {showAfterPhotos && (
                          <div>
                            <ServicePhotos 
                              service={service}
                              photoType="after"
                              required={stage === "checagem"}
                              onFileInputChange={(files) => {
                                if (onPhotoUpload) onPhotoUpload(service.id, files, "after");
                              }}
                              disabled={disabled}
                              onCameraCapture={(e) => {
                                e.preventDefault();
                                handleCameraClick(service.id, "after");
                              }}
                              onPhotoUpload={onPhotoUpload}
                            />
                            <div className="flex space-x-2 mt-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => handleCameraClick(service.id, "after")}
                                disabled={disabled}
                                className="text-xs"
                              >
                                <Camera className="h-3 w-3 mr-1" />
                                Usar câmera
                              </Button>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default ServiceForm;
