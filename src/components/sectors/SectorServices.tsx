
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sector, Service } from '@/types';
import { Checkbox } from '@/components/ui/checkbox';

interface SectorServicesProps {
  sector: Sector;
  allowCompletion?: boolean;
  onUpdateCompletion?: (serviceId: string, completed: boolean) => void;
}

export default function SectorServices({ 
  sector, 
  allowCompletion = false,
  onUpdateCompletion
}: SectorServicesProps) {
  // Filter selected services
  const selectedServices = sector.services?.filter(service => service.selected) || [];
  
  if (selectedServices.length === 0) {
    return (
      <Card className="border-none shadow-lg">
        <CardContent className="text-center py-8">
          <p className="text-gray-500">Nenhum serviço selecionado para este setor.</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-4">
      {selectedServices.map((service) => (
        <Card key={service.id} className="border-none shadow-lg">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">{service.name}</CardTitle>
              {allowCompletion && onUpdateCompletion && (
                <div className="flex items-center gap-2">
                  <Checkbox 
                    id={`service-completed-${service.id}`}
                    checked={service.completed || false}
                    onCheckedChange={(checked) => {
                      onUpdateCompletion(service.id, checked === true);
                    }}
                  />
                  <label 
                    htmlFor={`service-completed-${service.id}`}
                    className="text-sm font-medium cursor-pointer"
                  >
                    Concluído
                  </label>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Quantidade</h3>
                <p>{service.quantity || 1}</p>
              </div>
              {service.observations && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Observações</h3>
                  <p>{service.observations}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
