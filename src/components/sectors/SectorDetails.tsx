import React, { useState, useEffect } from 'react';
import { Sector } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ServicesList } from '@/components/services/ServicesList';

interface SectorDetailsProps {
  sector: Sector;
}

const SectorDetails: React.FC<SectorDetailsProps> = ({ sector }) => {
  const [cycleServices, setCycleServices] = useState([]);

  const fetchServices = async () => {
    const { data: cycleServices } = await supabase
      .from('cycle_services')
      .select('*')
      .eq('cycle_id', sector.cycles?.[0]?.id || '');

    if (cycleServices) {
      setCycleServices(cycleServices);
    }
  };

  useEffect(() => {
    if (sector) {
      fetchServices();
    }
  }, [sector]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Detalhes do Setor</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="flex items-center space-x-4">
          <Avatar>
            <AvatarImage src={sector.tagPhotoUrl} alt={sector.tagNumber} />
            <AvatarFallback>{sector.tagNumber}</AvatarFallback>
          </Avatar>
          <div>
            <h4 className="text-lg font-semibold">{sector.tagNumber}</h4>
            <Badge variant="secondary">{sector.status}</Badge>
          </div>
        </div>

        <div className="grid gap-2">
          <div className="text-sm font-medium">Informações do Ciclo</div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <strong>Nota Fiscal de Entrada:</strong> {sector.entryInvoice}
            </div>
            <div>
              <strong>Data de Entrada:</strong> {sector.entryDate}
            </div>
            <div>
              <strong>Data de Peritagem:</strong> {sector.peritagemDate}
            </div>
          </div>
        </div>

        <div className="grid gap-2">
          <div className="text-sm font-medium">Serviços</div>
          <ScrollArea className="h-[200px] w-full rounded-md border">
            <ServicesList services={sector.services} />
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
