
import React from 'react';
import { Service } from '@/types';
import { Checkbox } from '@/components/ui/checkbox';

interface ServiceCheckProps {
  service: Service;
  onChange: (checked: boolean) => void;
  checked: boolean;
}

export const ServiceCheck: React.FC<ServiceCheckProps> = ({ service, onChange, checked }) => {
  return (
    <div className="flex items-center space-x-2">
      <Checkbox
        id={`service-${service.id}`}
        checked={checked}
        onCheckedChange={onChange}
      />
      <label
        htmlFor={`service-${service.id}`}
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        {service.name}
      </label>
    </div>
  );
};

export default ServiceCheck;
