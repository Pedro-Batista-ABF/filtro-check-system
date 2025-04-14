
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sector, Service } from '@/types';
import { format } from 'date-fns';

interface SectorSummaryProps {
  sector: Sector;
}

export default function SectorSummary({ sector }: SectorSummaryProps) {
  // Filter selected services
  const selectedServices = sector.services?.filter(service => service.selected) || [];
  
  return (
    <div className="space-y-6">
      <Card className="border-none shadow-lg">
        <CardHeader>
          <CardTitle>Informações Básicas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-500">TAG</h3>
              <p className="text-lg">{sector.tagNumber}</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-500">Nota Fiscal de Entrada</h3>
              <p className="text-lg">{sector.entryInvoice}</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-500">Data de Entrada</h3>
              <p className="text-lg">
                {sector.entryDate ? format(new Date(sector.entryDate), 'dd/MM/yyyy') : '-'}
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-500">Data da Peritagem</h3>
              <p className="text-lg">
                {sector.peritagemDate ? format(new Date(sector.peritagemDate), 'dd/MM/yyyy') : '-'}
              </p>
            </div>
            {sector.exitDate && (
              <div>
                <h3 className="font-medium text-gray-500">Data de Saída</h3>
                <p className="text-lg">{format(new Date(sector.exitDate), 'dd/MM/yyyy')}</p>
              </div>
            )}
            {sector.exitInvoice && (
              <div>
                <h3 className="font-medium text-gray-500">Nota Fiscal de Saída</h3>
                <p className="text-lg">{sector.exitInvoice}</p>
              </div>
            )}
            {sector.checagemDate && (
              <div>
                <h3 className="font-medium text-gray-500">Data da Checagem Final</h3>
                <p className="text-lg">{format(new Date(sector.checagemDate), 'dd/MM/yyyy')}</p>
              </div>
            )}
            <div>
              <h3 className="font-medium text-gray-500">Status</h3>
              <p className="text-lg">{sector.status}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {sector.entryObservations && (
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle>Observações de Entrada</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{sector.entryObservations}</p>
          </CardContent>
        </Card>
      )}

      {sector.exitObservations && (
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle>Observações de Saída</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{sector.exitObservations}</p>
          </CardContent>
        </Card>
      )}

      {selectedServices.length > 0 && (
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle>Serviços Selecionados</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {selectedServices.map((service) => (
                <li key={service.id} className="flex justify-between items-center border-b pb-2">
                  <span>{service.name}</span>
                  <span className="text-gray-500">Qtd: {service.quantity || 1}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
