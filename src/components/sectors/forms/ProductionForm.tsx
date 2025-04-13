
import React from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Service } from "@/types";

interface ProductionFormProps {
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
      <div className="flex items-center justify-between py-4 border-b">
        <div>
          <h3 className="text-lg font-medium">Progresso da Execução</h3>
          <p className="text-sm text-gray-500">Marque como concluído após finalizar os serviços</p>
        </div>
        <div className="flex items-center space-x-2">
          <Switch 
            id="productionCompleted" 
            checked={productionCompleted} 
            onCheckedChange={handleProductionToggle} 
            disabled={sectorStatus === "concluido" || sectorStatus === "sucateado"} 
          />
          <Label htmlFor="productionCompleted">Setor concluído pela produção?</Label>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Serviços Necessários</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {services.filter(service => service.selected).map((service) => (
            <div key={service.id} className="border-b pb-4 last:border-b-0">
              <h3 className="font-medium">{service.name}</h3>
              <p className="text-sm text-gray-500 my-1">
                Quantidade: {service.quantity}
              </p>
              {service.observations && (
                <p className="text-sm mt-2 bg-gray-50 p-2 rounded">
                  <strong>Observações:</strong> {service.observations}
                </p>
              )}
              
              {service.photos && service.photos.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs font-medium mb-1">Fotos do defeito:</p>
                  <div className="flex flex-wrap gap-2">
                    {service.photos
                      .filter(photo => typeof photo === 'object' && photo.type === 'before')
                      .map((photo) => (
                        typeof photo === 'object' && photo.url && (
                          <img 
                            key={photo.id} 
                            src={photo.url} 
                            alt={service.name} 
                            className="w-20 h-20 object-cover rounded border"
                          />
                        )
                      ))
                    }
                  </div>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
