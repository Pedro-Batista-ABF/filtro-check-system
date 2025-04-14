
import React from 'react';
import { Sector } from '@/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ReportHeaderProps {
  sector: Sector;
}

export default function ReportHeader({ sector }: ReportHeaderProps) {
  // Format date function
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Não definida";
    try {
      return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="border-b pb-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Relatório de Setor</h1>
          <p className="text-gray-500">Gerado em {formatDate(new Date().toISOString())}</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold">TAG: {sector.tagNumber}</p>
          <p className="text-sm">Status: {getStatusText(sector.status)}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div>
          <h3 className="font-medium text-gray-600">Informações de Entrada</h3>
          <ul className="mt-1">
            <li><span className="font-medium">NF de Entrada:</span> {sector.entryInvoice || "Não informada"}</li>
            <li><span className="font-medium">Data de Entrada:</span> {formatDate(sector.entryDate)}</li>
            <li><span className="font-medium">Data de Peritagem:</span> {formatDate(sector.peritagemDate)}</li>
          </ul>
        </div>
        
        {sector.status === 'concluido' && (
          <div>
            <h3 className="font-medium text-gray-600">Informações de Saída</h3>
            <ul className="mt-1">
              <li><span className="font-medium">NF de Saída:</span> {sector.exitInvoice || "Não informada"}</li>
              <li><span className="font-medium">Data de Saída:</span> {formatDate(sector.exitDate)}</li>
              <li><span className="font-medium">Data de Checagem:</span> {formatDate(sector.checagemDate)}</li>
            </ul>
          </div>
        )}
        
        {(sector.status === 'sucateadoPendente' || sector.status === 'sucateado') && (
          <div>
            <h3 className="font-medium text-gray-600 text-red-600">Informações de Sucateamento</h3>
            <ul className="mt-1">
              <li><span className="font-medium">Observações:</span> {sector.scrapObservations || "Não informadas"}</li>
              {sector.scrapReturnDate && (
                <li><span className="font-medium">Data de Devolução:</span> {formatDate(sector.scrapReturnDate.toString())}</li>
              )}
              {sector.scrapReturnInvoice && (
                <li><span className="font-medium">NF de Devolução:</span> {sector.scrapReturnInvoice}</li>
              )}
            </ul>
          </div>
        )}
      </div>
      
      {(sector.entryObservations || sector.exitObservations) && (
        <div className="mt-4">
          <h3 className="font-medium text-gray-600">Observações</h3>
          {sector.entryObservations && (
            <p className="mt-1"><span className="font-medium">Entrada:</span> {sector.entryObservations}</p>
          )}
          {sector.exitObservations && (
            <p className="mt-1"><span className="font-medium">Saída:</span> {sector.exitObservations}</p>
          )}
        </div>
      )}
    </div>
  );
}

// Helper function to get formatted status text
function getStatusText(status: string): string {
  switch(status) {
    case 'peritagemPendente': return 'Peritagem Pendente';
    case 'emExecucao': return 'Em Execução';
    case 'checagemFinalPendente': return 'Checagem Pendente';
    case 'concluido': return 'Concluído';
    case 'sucateadoPendente': return 'Sucateamento Pendente';
    case 'sucateado': return 'Sucateado';
    default: return status;
  }
}
