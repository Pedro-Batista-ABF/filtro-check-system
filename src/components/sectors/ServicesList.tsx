
import React, { useState } from 'react';
import { Service } from '@/types';
import ServiceDetails from './service-parts/ServiceDetails';
import ServicePhotos from './service-parts/ServicePhotos';
import ServiceQuantity from './service-parts/ServiceQuantity';
import { useApi } from '@/contexts/ApiContextExtended';

interface ServicesListProps {
  services: Service[];
  onServiceUpdate?: (serviceId: string, quantity?: number) => void;
  onPhotoUpload?: (serviceId: string, photoUrl: string, type: 'before' | 'after') => void;
  readOnly?: boolean;
  sectorId?: string;
  stage?: 'peritagem' | 'checagem' | 'consulta';
}

export default function ServicesList({
  services,
  onServiceUpdate,
  onPhotoUpload,
  readOnly = false,
  sectorId,
  stage = 'peritagem'
}: ServicesListProps) {
  const [expandedService, setExpandedService] = useState<string | null>(null);
  const api = useApi();

  const toggleService = (serviceId: string) => {
    if (expandedService === serviceId) {
      setExpandedService(null);
    } else {
      setExpandedService(serviceId);
    }
  };

  const handleUpdateQuantity = (serviceId: string, quantity: number) => {
    if (onServiceUpdate) {
      onServiceUpdate(serviceId, quantity);
    }
  };

  const handlePhotoUpload = async (serviceId: string, file: File, type: 'before' | 'after') => {
    if (!onPhotoUpload || !sectorId) return;

    try {
      // Upload the photo
      const photoUrl = await api.uploadPhoto(file, `sectors/${sectorId}/services/${serviceId}`);
      
      // Update the service with the new photo
      await api.updateServicePhotos(sectorId, serviceId, photoUrl, type);
      
      // Call the onPhotoUpload callback
      onPhotoUpload(serviceId, photoUrl, type);
    } catch (error) {
      console.error('Erro ao fazer upload da foto:', error);
    }
  };

  if (!services || services.length === 0) {
    return <p className="text-gray-500 italic">Nenhum serviço selecionado</p>;
  }

  return (
    <div className="space-y-4">
      {services.map((service) => (
        <div 
          key={service.id} 
          className="border rounded-lg overflow-hidden bg-white shadow-sm"
        >
          <ServiceDetails 
            service={service} 
            isExpanded={expandedService === service.id}
            onToggle={() => toggleService(service.id)}
            readOnly={!!readOnly}
          />
          
          {expandedService === service.id && (
            <div className="p-4 border-t space-y-4">
              {!readOnly && (
                <ServiceQuantity 
                  service={service}
                  onUpdateQuantity={(quantity) => handleUpdateQuantity(service.id, quantity)}
                />
              )}
              
              <ServicePhotos 
                service={service}
                onPhotoUpload={(file, type) => handlePhotoUpload(service.id, file, type)}
                readOnly={readOnly}
                stage={stage}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
