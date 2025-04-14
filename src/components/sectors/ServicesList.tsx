
import { Service } from "@/types";
import { Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ServicesListProps {
  services: Service[];
}

export default function ServicesList({ services }: ServicesListProps) {
  // Filtramos apenas os serviços selecionados
  const selectedServices = services.filter(service => service.selected);

  if (selectedServices.length === 0) {
    return <p className="text-gray-500">Nenhum serviço selecionado</p>;
  }

  return (
    <div className="space-y-3">
      {selectedServices.map(service => (
        <div key={service.id} className="flex items-start space-x-2 border-b pb-2">
          <div className="flex-1">
            <div className="flex items-center">
              <span className="font-medium">{service.name}</span>
              {service.quantity && service.quantity > 1 && (
                <Badge variant="outline" className="ml-2">
                  Qtd: {service.quantity}
                </Badge>
              )}
            </div>
            {service.observations && (
              <p className="text-sm text-gray-600 mt-1">{service.observations}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
