
import React from 'react';
import { Service } from '@/types';
import { Check } from 'lucide-react';

interface ServiceChecklistProps {
  services: Service[];
}

export default function ServiceChecklist({ services }: ServiceChecklistProps) {
  // Filtrar apenas serviços selecionados
  const selectedServices = services.filter(service => service.selected);
  
  if (selectedServices.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-500">Nenhum serviço selecionado para este setor.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b">
            <th className="py-2 text-left">Serviço</th>
            <th className="py-2 text-center">Quantidade</th>
            <th className="py-2 text-center">Executado</th>
          </tr>
        </thead>
        <tbody>
          {selectedServices.map((service) => (
            <tr key={service.id} className="border-b">
              <td className="py-3">{service.name}</td>
              <td className="py-3 text-center">{service.quantity || 1}</td>
              <td className="py-3 text-center">
                {service.completed ? (
                  <div className="flex justify-center">
                    <Check className="h-5 w-5 text-green-500" />
                  </div>
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {/* Observações dos serviços, se houver */}
      {selectedServices.some(service => service.observations) && (
        <div className="mt-6">
          <h3 className="font-medium mb-2">Observações de Serviços</h3>
          <div className="space-y-2">
            {selectedServices
              .filter(service => service.observations)
              .map(service => (
                <div key={`obs-${service.id}`} className="border-b pb-2">
                  <p className="font-medium text-sm">{service.name}:</p>
                  <p className="text-sm">{service.observations}</p>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
