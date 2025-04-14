
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
  onChange?: (service: Service) => void;
  onChecked?: (id: string, checked: boolean) => void;
  onQuantityChange?: (id: string, quantity: number) => void;
  onObservationChange?: (id: string, observations: string) => void;
  onPhotoUpload?: (id: string, files: FileList, type: "before" | "after") => void;
  onCameraCapture?: (e: React.MouseEvent) => void;
  readOnly?: boolean;
  hidePhotos?: boolean;
  showObservations?: boolean;
  photoType?: "before" | "after";
  required?: boolean;
  selected?: boolean;
  checked?: boolean;
}

const ServiceCheckbox: React.FC<ServiceCheckboxProps> = ({
  service,
  onChange,
  onChecked,
  onQuantityChange,
  onObservationChange,
  onPhotoUpload,
  onCameraCapture,
  readOnly = false,
  hidePhotos = false,
  showObservations = false,
  photoType = "before",
  required = false,
  checked: externalChecked,
}) => {
  const [isSelected, setIsSelected] = useState(externalChecked !== undefined ? externalChecked : service.selected);
  const [photos, setPhotos] = useState<PhotoWithFile[]>(service.photos || []);
  const [quantity, setQuantity] = useState<number | undefined>(service.quantity);
  const [observations, setObservations] = useState<string | undefined>(service.observations);

  // Sincroniza o estado local com as props
  useEffect(() => {
    if (externalChecked !== undefined) {
      setIsSelected(externalChecked);
    } else {
      setIsSelected(service.selected);
    }
    setPhotos(service.photos || []);
    setQuantity(service.quantity);
    setObservations(service.observations);
  }, [service, externalChecked]);

  // Função para atualizar o serviço quando houver alterações
  const updateService = (updates: Partial<Service>) => {
    if (onChange) {
      onChange({
        ...service,
        ...updates
      });
    }
  };

  // Handler para alteração do checkbox
  const handleCheckboxChange = (checked: boolean) => {
    setIsSelected(checked);
    if (onChecked) {
      onChecked(service.id, checked);
    } else {
      updateService({ selected: checked });
    }
  };

  // Handler para alteração da quantidade
  const handleQuantityChange = (value: string) => {
    const numValue = parseInt(value, 10);
    const newQuantity = isNaN(numValue) ? undefined : numValue;
    setQuantity(newQuantity);
    
    if (onQuantityChange) {
      onQuantityChange(service.id, newQuantity || 0);
    } else {
      updateService({ quantity: newQuantity });
    }
  };

  // Handler para alteração das observações
  const handleObservationsChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const newObservations = e.target.value;
    setObservations(newObservations);
    
    if (onObservationChange) {
      onObservationChange(service.id, newObservations);
    } else {
      updateService({ observations: newObservations });
    }
  };

  // Handler para alteração das fotos
  const handlePhotoChange = (files: FileList) => {
    if (onPhotoUpload) {
      onPhotoUpload(service.id, files, photoType);
    } else {
      // Processamento local de fotos quando onChange for usado
      const newPhotos: PhotoWithFile[] = Array.from(files).map(file => ({
        id: `local-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        url: URL.createObjectURL(file),
        file,
        type: photoType,
        serviceId: service.id
      }));
      
      const updatedPhotos = [...photos, ...newPhotos];
      setPhotos(updatedPhotos);
      updateService({ photos: updatedPhotos });
    }
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
                onChange={handlePhotoChange}
                disabled={readOnly}
                title={`Fotos - ${service.name}`}
                required={required}
                onCameraCapture={onCameraCapture}
              />
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};

export default ServiceCheckbox;
