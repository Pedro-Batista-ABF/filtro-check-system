
import React, { useState, useEffect, ChangeEvent } from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Service, PhotoWithFile } from '@/types';
import { Label } from "@/components/ui/label";
import QuantityInput from './QuantityInput';
import { Textarea } from "@/components/ui/textarea";
import PhotoUpload from './PhotoUpload';

interface ServiceCheckboxProps {
  service: Service;
  onChange: (service: Service) => void;
  readOnly?: boolean;
  hidePhotos?: boolean;
  showObservations?: boolean;
}

const ServiceCheckbox: React.FC<ServiceCheckboxProps> = ({
  service,
  onChange,
  readOnly = false,
  hidePhotos = false,
  showObservations = false
}) => {
  const [isSelected, setIsSelected] = useState(service.selected);
  const [photos, setPhotos] = useState<PhotoWithFile[]>(service.photos || []);
  const [quantity, setQuantity] = useState<number | undefined>(service.quantity);
  const [observations, setObservations] = useState<string | undefined>(service.observations);

  // Sincroniza o estado local com as props
  useEffect(() => {
    setIsSelected(service.selected);
    setPhotos(service.photos || []);
    setQuantity(service.quantity);
    setObservations(service.observations);
  }, [service]);

  // Função para atualizar o serviço quando houver alterações
  const updateService = (updates: Partial<Service>) => {
    onChange({
      ...service,
      ...updates
    });
  };

  // Handler para alteração do checkbox
  const handleCheckboxChange = (checked: boolean) => {
    setIsSelected(checked);
    updateService({ selected: checked });
  };

  // Handler para alteração da quantidade
  const handleQuantityChange = (value: string) => {
    const numValue = parseInt(value, 10);
    const newQuantity = isNaN(numValue) ? undefined : numValue;
    setQuantity(newQuantity);
    updateService({ quantity: newQuantity });
  };

  // Handler para alteração das observações
  const handleObservationsChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const newObservations = e.target.value;
    setObservations(newObservations);
    updateService({ observations: newObservations });
  };

  // Handler para alteração das fotos
  const handlePhotosChange = (newPhotos: PhotoWithFile[]) => {
    setPhotos(newPhotos);
    updateService({ photos: newPhotos });
  };

  return (
    <Card className={`border ${isSelected ? 'border-primary' : 'border-muted'}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center space-x-2">
          <Checkbox
            id={`service-${service.id}`}
            checked={isSelected}
            onCheckedChange={handleCheckboxChange}
            disabled={readOnly}
          />
          <Label
            htmlFor={`service-${service.id}`}
            className="text-base font-medium cursor-pointer"
          >
            {service.name}
          </Label>
        </div>
      </CardHeader>
      {isSelected && (
        <CardContent className="space-y-4 pt-0">
          <QuantityInput
            value={quantity?.toString() || ''}
            onChange={handleQuantityChange}
            disabled={readOnly}
          />
          
          {showObservations && (
            <div className="space-y-2">
              <Label htmlFor={`observations-${service.id}`}>Observações</Label>
              <Textarea
                id={`observations-${service.id}`}
                value={observations || ''}
                onChange={handleObservationsChange}
                placeholder="Adicione observações sobre o serviço..."
                disabled={readOnly}
              />
            </div>
          )}
          
          {!hidePhotos && (
            <div className="mt-4">
              <PhotoUpload
                photos={photos}
                onChange={handlePhotosChange}
                disabled={readOnly}
                title={`Fotos - ${service.name}`}
              />
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};

export default ServiceCheckbox;
