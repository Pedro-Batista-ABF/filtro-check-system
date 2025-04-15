
import React from 'react';
import { Sector } from '@/types';
import { Badge } from '@/components/ui/badge';

interface SectorSummaryProps {
  sector: Sector;
}

export default function SectorSummary({ sector }: SectorSummaryProps) {
  // Formatar datas para exibição
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (e) {
      return dateString;
    }
  };
  
  // Mapear status para exibição amigável
  const getStatusDisplay = (status: string) => {
    switch(status) {
      case 'peritagemPendente': return 'Peritagem Pendente';
      case 'emExecucao': return 'Em Execução';
      case 'sucateadoPendente': return 'Sucateamento Pendente';
      case 'sucateado': return 'Sucateado';
      case 'concluido': return 'Concluído';
      default: return status;
    }
  };
  
  // Obter classe de cor para o status
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'peritagemPendente': return 'bg-gray-100 text-gray-800';
      case 'emExecucao': return 'bg-blue-100 text-blue-800';
      case 'sucateadoPendente': return 'bg-red-100 text-red-800';
      case 'sucateado': return 'bg-red-100 text-red-800';
      case 'concluido': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-bold">TAG: {sector.tagNumber}</h2>
          <p className="text-sm text-gray-500">
            NF Entrada: {sector.entryInvoice || "N/A"}
          </p>
        </div>
        <Badge className={getStatusColor(sector.status)}>
          {getStatusDisplay(sector.status)}
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <div>
          <p className="text-sm text-gray-500">Data de Entrada</p>
          <p className="font-medium">{formatDate(sector.entryDate)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Data da Peritagem</p>
          <p className="font-medium">{formatDate(sector.peritagemDate)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Número de Ciclo</p>
          <p className="font-medium">{sector.cycleCount || 1}</p>
        </div>
      </div>
      
      <div className="mt-4">
        <p className="text-sm text-gray-500">Observações da Entrada</p>
        <p className="text-gray-700 border p-2 rounded-md mt-1 bg-gray-50 min-h-[50px]">
          {sector.entryObservations || "Nenhuma observação registrada."}
        </p>
      </div>
      
      {/* Mostrar a foto da TAG se disponível */}
      {sector.tagPhotoUrl && (
        <div className="mt-4">
          <p className="text-sm text-gray-500 mb-1">Foto da TAG</p>
          <div className="border rounded-md overflow-hidden w-48 h-48">
            <img 
              src={sector.tagPhotoUrl} 
              alt="Foto da TAG" 
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/placeholder.svg';
                target.className = "w-full h-full object-contain bg-gray-100";
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
