
import React from 'react';
import { Service } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { CheckCircle } from 'lucide-react';

export interface ProductionFormProps {
  services: Service[];
  productionCompleted: boolean;
  handleProductionToggle: (checked: boolean) => void;
  sectorStatus: string;
}

export default function ProductionForm({
  services,
  productionCompleted,
  handleProductionToggle,
  sectorStatus
}: ProductionFormProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Status da Produção</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Switch
              id="prod-complete"
              checked={productionCompleted}
              onCheckedChange={handleProductionToggle}
              disabled={sectorStatus === 'concluido'}
            />
            <Label htmlFor="prod-complete" className="font-medium">
              Setor concluído pela produção?
            </Label>
            {productionCompleted && <CheckCircle className="h-5 w-5 text-green-500" />}
          </div>
          
          <p className="text-sm text-muted-foreground mt-2">
            Marque esta opção quando todos os serviços solicitados tiverem sido finalizados.
            Isto liberará o setor para a checagem de qualidade.
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Serviços a Executar</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
            {services.filter(s => s.selected).map(service => (
              <li key={service.id} className="border p-4 rounded-md">
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <h4 className="font-medium">{service.name}</h4>
                    <p className="text-sm text-gray-500">Quantidade: {service.quantity || 1}</p>
                    {service.observations && (
                      <p className="text-sm mt-1 bg-gray-50 p-2 rounded">
                        <span className="font-medium">Observações: </span>
                        {service.observations}
                      </p>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
