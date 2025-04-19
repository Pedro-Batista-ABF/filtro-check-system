
import React, { useState, useEffect } from 'react';
import { Sector, Service } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import TagPhoto from './TagPhoto';

interface SectorDetailsProps {
  sector: Sector;
}

const SectorDetails: React.FC<SectorDetailsProps> = ({ sector }) => {
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    if (sector && sector.services) {
      setServices(sector.services);
    }
  }, [sector]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Detalhes do Setor</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 overflow-hidden rounded-md">
            {sector.tagPhotoUrl ? (
              <TagPhoto sector={sector} />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
                {sector.tagNumber?.substring(0, 2) || "TAG"}
              </div>
            )}
          </div>
          <div>
            <h4 className="text-lg font-semibold">{sector.tagNumber}</h4>
            <Badge variant="secondary">{sector.status}</Badge>
          </div>
        </div>

        <div className="grid gap-2">
          <div className="text-sm font-medium">Informações do Setor</div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <strong>Nota Fiscal de Entrada:</strong> {sector.entryInvoice}
            </div>
            <div>
              <strong>Data de Entrada:</strong> {sector.entryDate}
            </div>
          </div>
        </div>

        <div className="grid gap-2">
          <div className="text-sm font-medium">Serviços</div>
          <ScrollArea className="h-[200px] w-full rounded-md border p-2">
            {services && services.length > 0 ? (
              <ul className="space-y-2">
                {services.map(service => (
                  <li key={service.id} className="p-2 hover:bg-gray-50 rounded">
                    <div className="flex items-center">
                      <div className={`w-4 h-4 mr-2 rounded-full ${service.selected ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <span>{service.name}</span>
                    </div>
                    {service.selected && service.observations && (
                      <p className="text-sm text-gray-500 mt-1">
                        {service.observations}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center text-gray-500 py-4">
                Nenhum serviço registrado
              </div>
            )}
          </ScrollArea>
        </div>

        <div className="flex justify-end">
          <Button asChild>
            <Link to={`/peritagem/${sector.id}`}>Editar</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SectorDetails;
