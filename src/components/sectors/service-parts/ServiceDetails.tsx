
import React from 'react';
import { Service } from '@/types';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';

export interface ServiceDetailsProps {
  service: Service;
  expanded: boolean;
  onToggle: () => void;
  readOnly: boolean;
}

const ServiceDetails: React.FC<ServiceDetailsProps> = ({
  service,
  expanded,
  onToggle,
  readOnly
}) => {
  return (
    <div className="flex items-center justify-between p-4">
      <div className="flex-1">
        <h3 className="font-medium">{service.name}</h3>
        <p className="text-sm text-gray-500">
          {service.description || 'Sem descrição'}
        </p>
      </div>
      
      <div className="flex items-center gap-2">
        {service.completed && (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Concluído
          </span>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          disabled={readOnly}
        >
          {expanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
};

export default ServiceDetails;
