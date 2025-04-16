
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Service } from '@/types';

export interface ServiceCheckboxProps {
  service: Service;
  onServiceChange: (id: string, checked: boolean) => void;
  disabled?: boolean;
}

const ServiceCheckbox: React.FC<ServiceCheckboxProps> = ({
  service,
  onServiceChange,
  disabled = false
}) => {
  return (
    <div className="flex items-start gap-2 flex-1">
      <Checkbox
        id={`service-${service.id}`}
        checked={service.selected}
        onCheckedChange={(checked) => onServiceChange(service.id, !!checked)}
        disabled={disabled}
        className="mt-1"
      />
      <label
        htmlFor={`service-${service.id}`}
        className={`text-sm font-medium ${disabled ? 'text-gray-500' : 'text-gray-700'} cursor-pointer`}
      >
        {service.name}
      </label>
    </div>
  );
};

export default ServiceCheckbox;
