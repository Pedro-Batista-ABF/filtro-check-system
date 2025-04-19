
import React from 'react';
import { Service } from '@/types';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Clock } from 'lucide-react';
import ServicePhotos from '../../service-parts/ServicePhotos';

interface ServiceCheckProps {
  service: Service;
  onPhotoUpload?: (id: string, files: FileList, type: "before" | "after") => Promise<void>;
  onCameraCapture: (serviceId: string, photoType: "before" | "after") => void;
  disabled?: boolean;
}

const ServiceCheck: React.FC<ServiceCheckProps> = ({
  service,
  onPhotoUpload,
  onCameraCapture,
  disabled = false
}) => {
  if (!service.selected) return null;
  
  // Formatação do nome do serviço para ser mais legível
  const formatServiceName = (name: string): string => {
    return name
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  };

  // Verifica se o serviço tem fotos "antes"
  const hasBeforePhotos = (service.photos || []).some(p => p.type === 'before');
  
  // Verifica se o serviço tem fotos "depois"
  const hasAfterPhotos = (service.photos || []).some(p => p.type === 'after');

  return (
    <div className="p-4 border rounded-md mb-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-medium">{formatServiceName(service.name)}</h3>
          {service.description && (
            <p className="text-sm text-gray-500 mt-1">{service.description}</p>
          )}
        </div>
        <div className="text-sm text-gray-500 flex items-center">
          <Clock className="h-3 w-3 mr-1" />
          <span>QTD: {service.quantity || 1}</span>
        </div>
      </div>
      
      {service.observations && (
        <div className="mb-4">
          <Label className="text-xs font-medium mb-1 block">Observações</Label>
          <div className="text-sm p-2 bg-gray-50 rounded border">{service.observations}</div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
        <div>
          <ServicePhotos 
            service={service}
            photoType="before"
            required={false}
            onFileInputChange={() => {}}
            disabled={true}
          />
          {!hasBeforePhotos && (
            <div className="p-2 bg-amber-50 text-amber-800 rounded text-xs mt-1">
              Nenhuma foto "antes" disponível
            </div>
          )}
        </div>
        
        <div>
          <ServicePhotos 
            service={service}
            photoType="after"
            required={true}
            onFileInputChange={(files) => {
              if (onPhotoUpload) onPhotoUpload(service.id, files, "after");
            }}
            disabled={disabled}
            onCameraCapture={(e) => {
              e.preventDefault();
              onCameraCapture(service.id, "after");
            }}
            onPhotoUpload={onPhotoUpload}
          />
          {!hasAfterPhotos && !disabled && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onCameraCapture(service.id, "after")}
              className="mt-2 text-xs"
              disabled={disabled}
            >
              Adicionar foto do resultado
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceCheck;
