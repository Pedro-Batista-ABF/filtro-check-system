
import React from 'react';
import { Sector, Service } from '@/types';
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SectorServicesProps {
  sector: Sector;
  onUpdateService?: (serviceId: string, completed: boolean) => void;
  onSubmit?: () => void;
  isLoading?: boolean;
  readOnly?: boolean;
}

export default function SectorServices({
  sector,
  onUpdateService,
  onSubmit,
  isLoading = false,
  readOnly = false
}: SectorServicesProps) {
  // Filter to only show selected services
  const selectedServices = sector.services.filter(service => service.selected);

  const handleServiceCompletedToggle = (serviceId: string, completed: boolean) => {
    if (onUpdateService) {
      onUpdateService(serviceId, completed);
    }
  };

  return (
    <Card className="p-0">
      <CardHeader className="pb-2">
        <CardTitle>Serviços a Executar</CardTitle>
      </CardHeader>
      <CardContent>
        {selectedServices.length === 0 ? (
          <p className="text-center py-4 text-gray-500">
            Nenhum serviço selecionado para este setor.
          </p>
        ) : (
          <div className="space-y-4">
            {selectedServices.map(service => (
              <div 
                key={service.id} 
                className={`flex items-start p-3 rounded-md border ${
                  service.completed ? 'border-green-200 bg-green-50' : 'border-gray-200'
                }`}
              >
                {!readOnly && (
                  <Checkbox
                    id={`service-${service.id}`}
                    checked={service.completed}
                    onCheckedChange={(checked) => 
                      handleServiceCompletedToggle(service.id, !!checked)
                    }
                    className="mt-0.5 mr-3"
                  />
                )}
                <div className="flex-1">
                  <div className="font-medium">{service.name}</div>
                  <div className="text-sm text-gray-500 mt-1">
                    <span>Quantidade: {service.quantity || 1}</span>
                    {readOnly && (
                      <span className={`ml-3 px-2 py-0.5 rounded-full text-xs ${
                        service.completed 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {service.completed ? 'Concluído' : 'Pendente'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {!readOnly && onSubmit && (
              <div className="mt-6 flex justify-end">
                <Button 
                  onClick={onSubmit} 
                  disabled={isLoading}
                >
                  {isLoading ? "Salvando..." : "Salvar Serviços"}
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
