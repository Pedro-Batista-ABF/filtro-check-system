
import React from 'react';
import { Service } from '@/types';
import { ServiceCheck } from './ServiceCheck';
import { QuantityInput } from '../../QuantityInput';

export interface ServicesSectionProps {
  services: Service[];
  handleServiceChange: (id: string, checked: boolean) => void;
  handleQuantityChange: (id: string, quantity: number) => void;
  handleObservationChange: (id: string, observations: string) => void;
  handlePhotoUpload: (id: string, file: File) => Promise<void>;
  handleRemovePhoto: (id: string, photoId: string) => void;
  readOnly?: boolean;
  servicesWithoutPhotos: string[];
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({
  services,
  handleServiceChange,
  handleQuantityChange,
  handleObservationChange,
  handlePhotoUpload,
  handleRemovePhoto,
  readOnly = false,
  servicesWithoutPhotos,
}) => {
  return (
    <div className="space-y-4">
      {services.map((service) => (
        <div key={service.id} className="p-4 border rounded-lg">
          <ServiceCheck
            service={service}
            onChange={(checked) => handleServiceChange(service.id, checked)}
            checked={service.selected}
          />
          {service.selected && (
            <div className="mt-2 space-y-2">
              <QuantityInput
                value={service.quantity || 1}
                onChange={(value) => handleQuantityChange(service.id, value)}
                disabled={readOnly}
              />
              {/* Additional service fields as needed */}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
