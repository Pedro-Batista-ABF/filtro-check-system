
import React, { useState } from 'react';
import { Service } from '@/types';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import ServiceQuantity from '../../service-parts/ServiceQuantity';
import ServicePhotos from '../../service-parts/ServicePhotos';
import { Button } from '@/components/ui/button';
import { Camera } from 'lucide-react';

interface ServiceCheckProps {
  service: Service;
  photoRequired: boolean;
  handleServiceChange: (id: string, checked: boolean) => void;
  handleQuantityChange: (id: string, quantity: number) => void;
  handleObservationChange: (id: string, observations: string) => void;
  handlePhotoUpload: (id: string, files: FileList, type: "before" | "after") => void;
  disabled?: boolean;
  phase?: 'peritagem' | 'checagem';
  onCameraCapture?: (e: React.MouseEvent) => void;
}

const ServiceCheck: React.FC<ServiceCheckProps> = ({
  service,
  photoRequired,
  handleServiceChange,
  handleQuantityChange,
  handleObservationChange,
  handlePhotoUpload,
  disabled = false,
  phase = 'peritagem',
  onCameraCapture
}) => {
  const [expanded, setExpanded] = useState(service.selected);

  const handleCheckboxChange = (checked: boolean) => {
    handleServiceChange(service.id, checked);
    setExpanded(checked);
  };

  const photoType = phase === 'peritagem' ? 'before' : 'after';

  return (
    <div className="border rounded-md p-4 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <Checkbox
            id={`service-${service.id}`}
            checked={service.selected}
            onCheckedChange={handleCheckboxChange}
            disabled={disabled}
          />
          <Label
            htmlFor={`service-${service.id}`}
            className={`font-medium ${service.selected ? '' : 'text-gray-500'}`}
          >
            {service.name}
          </Label>
        </div>

        {service.selected && (
          <ServiceQuantity
            service={service}
            onQuantityChange={handleQuantityChange}
            disabled={disabled}
          />
        )}
      </div>

      {service.selected && (
        <div className="pl-6 space-y-4">
          <div>
            <Label htmlFor={`observation-${service.id}`} className="text-sm">
              Observações
            </Label>
            <Textarea
              id={`observation-${service.id}`}
              value={service.observations || ''}
              onChange={(e) => handleObservationChange(service.id, e.target.value)}
              placeholder="Adicione observações sobre este serviço..."
              className="resize-none mt-1"
              disabled={disabled}
            />
          </div>

          <ServicePhotos
            service={service}
            photoType={photoType}
            required={photoRequired}
            onPhotoUpload={handlePhotoUpload}
            disabled={disabled}
            onCameraCapture={onCameraCapture}
          />

          {/* Botões de ação para fotos - versão inline */}
          <div className="flex space-x-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onCameraCapture}
              disabled={disabled}
              className="text-xs"
            >
              <Camera className="h-3 w-3 mr-1" />
              Usar câmera
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceCheck;
