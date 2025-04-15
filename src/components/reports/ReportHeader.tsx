
import React from 'react';
import { Sector } from '@/types';

interface ReportHeaderProps {
  sector: Sector;
}

export default function ReportHeader({ sector }: ReportHeaderProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="border-b pb-4">
      <div className="flex justify-between items-start">
        <h2 className="text-xl font-bold">TAG: {sector.tagNumber}</h2>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          sector.status === 'concluido' ? 'bg-green-100 text-green-800' : 
          sector.status === 'sucateado' ? 'bg-red-100 text-red-800' :
          'bg-blue-100 text-blue-800'
        }`}>
          {sector.status === 'concluido' ? 'Concluído' : 
           sector.status === 'sucateado' ? 'Sucateado' :
           sector.status === 'emExecucao' ? 'Em Execução' :
           sector.status === 'peritagemPendente' ? 'Peritagem Pendente' :
           sector.status === 'sucateadoPendente' ? 'Sucateamento Pendente' :
           sector.status}
        </span>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
        <div>
          <p className="text-sm text-gray-500">NF Entrada</p>
          <p className="font-medium">{sector.entryInvoice || "N/A"}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Data Entrada</p>
          <p className="font-medium">{formatDate(sector.entryDate)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">NF Saída</p>
          <p className="font-medium">{sector.exitInvoice || "N/A"}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Data Saída</p>
          <p className="font-medium">{formatDate(sector.exitDate)}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
        <div>
          <p className="text-sm text-gray-500">Data da Peritagem</p>
          <p className="font-medium">{formatDate(sector.peritagemDate)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Data da Checagem</p>
          <p className="font-medium">{formatDate(sector.checagemDate)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Ciclo</p>
          <p className="font-medium">{sector.cycleCount || 1}</p>
        </div>
      </div>
    </div>
  );
}
