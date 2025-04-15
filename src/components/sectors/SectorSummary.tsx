
import React from 'react';
import { Sector } from '@/types';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SectorSummaryProps {
  sector: Sector;
}

// Helper function to format dates
const formatDate = (dateString?: string) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return format(date, 'dd/MM/yyyy');
  } catch (e) {
    return dateString;
  }
};

// Helper to get status label and color
const getStatusInfo = (status: string) => {
  const statusMap: Record<string, { label: string; color: string }> = {
    peritagemPendente: { label: 'Peritagem Pendente', color: 'bg-yellow-100 text-yellow-800' },
    emExecucao: { label: 'Em Execução', color: 'bg-blue-100 text-blue-800' },
    aguardandoChecagem: { label: 'Aguardando Checagem', color: 'bg-indigo-100 text-indigo-800' },
    checagemCompleta: { label: 'Checagem Completa', color: 'bg-green-100 text-green-800' },
    sucateadoPendente: { label: 'Sucateamento Pendente', color: 'bg-red-100 text-red-800' },
    sucateado: { label: 'Sucateado', color: 'bg-red-100 text-red-800' },
    default: { label: 'Status Desconhecido', color: 'bg-gray-100 text-gray-800' }
  };

  return statusMap[status] || statusMap.default;
};

export default function SectorSummary({ sector }: SectorSummaryProps) {
  const statusInfo = getStatusInfo(sector.status);
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle>Informações do Setor</CardTitle>
          <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">TAG</h3>
            <p className="text-lg font-semibold">{sector.tagNumber}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500">NF Entrada</h3>
            <p>{sector.entryInvoice || 'N/A'}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500">Data de Entrada</h3>
            <p>{formatDate(sector.entryDate)}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500">Data da Peritagem</h3>
            <p>{formatDate(sector.peritagemDate)}</p>
          </div>
          
          {sector.checagemDate && (
            <div>
              <h3 className="text-sm font-medium text-gray-500">Data da Checagem</h3>
              <p>{formatDate(sector.checagemDate)}</p>
            </div>
          )}
          
          {sector.exitDate && (
            <>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Data de Saída</h3>
                <p>{formatDate(sector.exitDate)}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">NF Saída</h3>
                <p>{sector.exitInvoice || 'N/A'}</p>
              </div>
            </>
          )}
        </div>
        
        {sector.entryObservations && (
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-500">Observações de Entrada</h3>
            <p className="text-sm mt-1">{sector.entryObservations}</p>
          </div>
        )}
        
        {sector.exitObservations && (
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-500">Observações de Saída</h3>
            <p className="text-sm mt-1">{sector.exitObservations}</p>
          </div>
        )}
        
        {sector.scrapObservations && (
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-500">Observações de Sucateamento</h3>
            <p className="text-sm mt-1">{sector.scrapObservations}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
