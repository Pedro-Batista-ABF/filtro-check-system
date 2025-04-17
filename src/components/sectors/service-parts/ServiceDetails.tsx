
import React from 'react';
import { Service } from '@/types';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle } from 'lucide-react';

interface ServiceDetailsProps {
  service: Service;
  isCompleted?: boolean;
  completedCheckboxId?: string;
  isMissingPhotos?: boolean;
}

interface ObservationsProps {
  service: Service;
  onObservationChange: (id: string, observations: string) => void;
}

function ServiceDetails({ service, isCompleted, completedCheckboxId, isMissingPhotos }: ServiceDetailsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Label
        htmlFor={`service-${service.id}`}
        className="text-lg font-medium cursor-pointer"
      >
        {service.name}
      </Label>
      
      {isMissingPhotos && (
        <span className="text-xs text-red-500 flex items-center">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Foto obrigatória
        </span>
      )}
      
      {isCompleted && completedCheckboxId && (
        <span className="text-xs text-green-600 font-medium ml-2">
          Serviço concluído
        </span>
      )}
    </div>
  );
}

function Observations({ service, onObservationChange }: ObservationsProps) {
  return (
    <div className="space-y-1">
      <Label htmlFor={`observations-${service.id}`} className="text-sm">
        Observações
      </Label>
      <Textarea
        id={`observations-${service.id}`}
        value={service.observations || ""}
        onChange={(e) => onObservationChange(service.id, e.target.value)}
        placeholder="Detalhes sobre o serviço..."
        className="resize-none h-20"
      />
    </div>
  );
}

ServiceDetails.Observations = Observations;

export default ServiceDetails;
