import React from 'react';
import { Service } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from "@/components/ui/scroll-area"
import ServiceCheckbox from './ServiceCheckbox';

interface ServicesSectionProps {
  services: Service[];
  onChecked: (id: string, selected: boolean) => void;
  onQuantityChange: (id: string, quantity: number) => void;
  onObservationChange: (id: string, observation: string) => void;
  onPhotoUpload: (id: string, photo: File, photoType: 'before' | 'after') => void;
  editMode: boolean;
}

const ServicesSection: React.FC<ServicesSectionProps> = ({ 
  services, 
  onChecked, 
  onQuantityChange,
  onObservationChange,
  onPhotoUpload,
  editMode
}) => {
  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Serviços</CardTitle>
        <CardDescription>
          Selecione os serviços realizados e adicione informações relevantes.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[400px] w-full rounded-md">
          <div className="p-4 space-y-2">
            {services.map((service) => (
              <ServiceCheckbox
                key={service.id}
                service={service}
                selected={service.selected} // Instead of 'checked'
                onSelect={(id, selected) => onChecked(id, selected)} // Instead of 'onChecked'
                onQuantityChange={onQuantityChange}
                onObservationChange={onObservationChange}
                onPhotoUpload={onPhotoUpload}
                photoType="before"
                editMode={editMode}
              />
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default ServicesSection;
