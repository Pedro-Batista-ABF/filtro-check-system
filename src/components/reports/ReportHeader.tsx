
import React from 'react';
import { Sector, Cycle } from '@/types';
import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';

interface ReportHeaderProps {
  sector: Sector;
  cycle: Cycle;
}

export default function ReportHeader({ sector, cycle }: ReportHeaderProps) {
  return (
    <div className="space-y-6">
      <div className="bg-gray-100 p-6 print:bg-white">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-2xl font-bold mb-2 print:text-3xl">Relatório de Recuperação</h1>
            <p className="text-gray-600 print:text-gray-800">
              TAG: <span className="font-semibold">{sector.tagNumber}</span>
            </p>
          </div>
          <div className="mt-4 md:mt-0 text-right">
            <p className="text-sm text-gray-600 print:text-gray-800">
              Data do Relatório: {format(new Date(), 'dd/MM/yyyy')}
            </p>
          </div>
        </div>
      </div>
      
      <Card className="border-none shadow-lg print:shadow-none print:border print:border-gray-300">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 print:text-gray-700">Informações do Setor</h3>
              <div className="mt-2 space-y-2">
                <div className="grid grid-cols-2">
                  <p className="text-sm font-medium">TAG:</p>
                  <p className="text-sm">{sector.tagNumber}</p>
                </div>
                <div className="grid grid-cols-2">
                  <p className="text-sm font-medium">NF Entrada:</p>
                  <p className="text-sm">{sector.entryInvoice}</p>
                </div>
                <div className="grid grid-cols-2">
                  <p className="text-sm font-medium">Data Entrada:</p>
                  <p className="text-sm">
                    {sector.entryDate ? format(new Date(sector.entryDate), 'dd/MM/yyyy') : '-'}
                  </p>
                </div>
                <div className="grid grid-cols-2">
                  <p className="text-sm font-medium">Data Peritagem:</p>
                  <p className="text-sm">
                    {sector.peritagemDate ? format(new Date(sector.peritagemDate), 'dd/MM/yyyy') : '-'}
                  </p>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 print:text-gray-700">Informações de Saída</h3>
              <div className="mt-2 space-y-2">
                <div className="grid grid-cols-2">
                  <p className="text-sm font-medium">NF Saída:</p>
                  <p className="text-sm">{sector.exitInvoice || '-'}</p>
                </div>
                <div className="grid grid-cols-2">
                  <p className="text-sm font-medium">Data Saída:</p>
                  <p className="text-sm">
                    {sector.exitDate ? format(new Date(sector.exitDate), 'dd/MM/yyyy') : '-'}
                  </p>
                </div>
                <div className="grid grid-cols-2">
                  <p className="text-sm font-medium">Data Checagem:</p>
                  <p className="text-sm">
                    {sector.checagemDate ? format(new Date(sector.checagemDate), 'dd/MM/yyyy') : '-'}
                  </p>
                </div>
                <div className="grid grid-cols-2">
                  <p className="text-sm font-medium">Status:</p>
                  <p className="text-sm">{sector.status}</p>
                </div>
              </div>
            </div>
          </div>
          
          {(sector.entryObservations || sector.exitObservations) && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-500 print:text-gray-700">Observações</h3>
              {sector.entryObservations && (
                <div className="mt-2">
                  <p className="text-sm font-medium">Observações de Entrada:</p>
                  <p className="text-sm mt-1">{sector.entryObservations}</p>
                </div>
              )}
              {sector.exitObservations && (
                <div className="mt-2">
                  <p className="text-sm font-medium">Observações de Saída:</p>
                  <p className="text-sm mt-1">{sector.exitObservations}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
