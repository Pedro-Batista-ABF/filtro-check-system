
import React from 'react';
import { Service } from '@/types';
import ServiceCheckbox from './ServiceCheckbox';
import ServiceQuantity from './service-parts/ServiceQuantity';
import ServicePhotos from './service-parts/ServicePhotos';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface ServicesListProps {
  services: Service[];
  error: boolean;
  photoRequired: boolean;
  onServiceChange: (id: string, checked: boolean) => void;
  onQuantityChange: (id: string, quantity: number) => void;
  onObservationChange: (id: string, observations: string) => void;
  onServicePhotoUpload: (id: string, files: FileList, type: "before" | "after") => void;
  disabled?: boolean;
}

const ServicesList: React.FC<ServicesListProps> = ({
  services,
  error,
  photoRequired,
  onServiceChange,
  onQuantityChange,
  onObservationChange,
  onServicePhotoUpload,
  disabled = false
}) => {
  console.log("🔄 ServicesList render", Date.now());
  console.log("🔄 services:", services.length);
  console.log("🔄 error:", error);

  return (
    <div className="space-y-4">
      {error && (
        <div className="text-red-500 text-sm">
          Por favor, selecione pelo menos um serviço e adicione uma foto para cada serviço selecionado.
        </div>
      )}

      {services.length === 0 ? (
        <div className="bg-gray-50 p-4 rounded-md text-gray-500 text-center">
          Nenhum serviço disponível.
        </div>
      ) : (
        <ul className="space-y-4">
          {services.map((service) => (
            <li key={service.id} className="border rounded-md p-4">
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <ServiceCheckbox
                    service={service}
                    onServiceChange={onServiceChange}
                    disabled={disabled}
                  />
                  
                  <ServiceQuantity
                    service={service}
                    onQuantityChange={onQuantityChange}
                    enabled={service.selected}
                    disabled={disabled}
                  />
                </div>
                
                {service.selected && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor={`observation-${service.id}`} className="text-sm">
                        Observações
                      </Label>
                      <Textarea
                        id={`observation-${service.id}`}
                        value={service.observations || ""}
                        onChange={(e) => onObservationChange(service.id, e.target.value)}
                        placeholder="Observações sobre este serviço..."
                        className="resize-none"
                        disabled={disabled}
                      />
                    </div>
                    
                    <ServicePhotos
                      service={service}
                      photoType={disabled ? "after" : "before"}
                      required={photoRequired}
                      onPhotoUpload={onServicePhotoUpload}
                      disabled={!service.selected}
                    />
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ServicesList;
