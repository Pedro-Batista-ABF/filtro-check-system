
import React from 'react';
import { Service } from '@/types';

interface ServicesListProps {
  services: Service[];
  onServiceSelect?: (service: Service) => void;
}

export const ServicesList: React.FC<ServicesListProps> = ({ services, onServiceSelect }) => {
  if (!services || services.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        Nenhum serviço disponível
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {services.map((service) => (
        <div 
          key={service.id}
          className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
          onClick={() => onServiceSelect?.(service)}
        >
          <h3 className="font-medium">{service.name}</h3>
          {service.description && (
            <p className="text-sm text-gray-600">{service.description}</p>
          )}
        </div>
      ))}
    </div>
  );
};
