
import React from 'react';
import { Service } from '@/types';
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

interface SectorServicesProps {
  services: Service[];
  onMarkCompleted?: (serviceId: string, completed: boolean) => void;
  readonly?: boolean;
}

export default function SectorServices({ 
  services, 
  onMarkCompleted,
  readonly = false
}: SectorServicesProps) {
  const selectedServices = services.filter(service => service.selected);
  
  if (selectedServices.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-gray-500">Nenhum serviço registrado para este setor.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {selectedServices.map((service) => (
        <div key={service.id} className="border p-4 rounded-md">
          <div className="flex justify-between items-start">
            <div className="flex items-start space-x-3">
              {!readonly && onMarkCompleted && (
                <Checkbox 
                  id={`service-completed-${service.id}`}
                  checked={service.completed || false}
                  onCheckedChange={(checked) => onMarkCompleted(service.id, !!checked)}
                />
              )}
              <div>
                <div className="flex items-center">
                  <label 
                    htmlFor={`service-completed-${service.id}`} 
                    className="font-medium cursor-pointer"
                  >
                    {service.name}
                  </label>
                  
                  {readonly && (
                    <Badge 
                      className={service.completed ? 
                        "ml-2 bg-green-100 text-green-800 hover:bg-green-100" : 
                        "ml-2 bg-yellow-100 text-yellow-800 hover:bg-yellow-100"}
                    >
                      {service.completed ? "Concluído" : "Pendente"}
                    </Badge>
                  )}
                </div>
                
                <p className="text-sm text-gray-500 mt-1">
                  Quantidade: {service.quantity || 1}
                </p>
                
                {service.observations && (
                  <p className="text-sm mt-2 text-gray-600">
                    <span className="font-medium">Observações:</span> {service.observations}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
