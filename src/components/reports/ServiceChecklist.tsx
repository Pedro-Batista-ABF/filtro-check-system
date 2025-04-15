
import React from 'react';
import { Service } from '@/types';
import { CheckCircle2, Circle } from 'lucide-react';

interface ServiceChecklistProps {
  services: Service[];
}

export default function ServiceChecklist({ services }: ServiceChecklistProps) {
  const selectedServices = services.filter(service => service.selected);
  
  if (selectedServices.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-gray-500">Nenhum serviço registrado para este setor.</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-bold mb-4">Serviços Executados</h3>
      <div className="space-y-4">
        {selectedServices.map(service => (
          <div key={service.id} className="flex items-start space-x-2 border-b pb-2">
            {service.completed ? (
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
            ) : (
              <Circle className="h-5 w-5 text-gray-300 mt-0.5" />
            )}
            <div>
              <p className="font-medium">{service.name}</p>
              <div className="flex items-center text-sm text-gray-500 mt-1">
                <span className="mr-3">Quantidade: {service.quantity || 1}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  service.completed 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {service.completed ? 'Concluído' : 'Pendente'}
                </span>
              </div>
              {service.observations && (
                <p className="text-sm text-gray-600 mt-1">{service.observations}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
