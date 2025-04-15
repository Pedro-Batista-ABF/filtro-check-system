
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sector, Service } from '@/types';
import { format } from 'date-fns';
import { Check, X } from 'lucide-react';

interface SectorDetailsProps {
  sector: Sector;
}

export default function SectorDetails({ sector }: SectorDetailsProps) {
  // Helper function to format dates
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy');
    } catch (e) {
      return dateString;
    }
  };

  // Get status display information
  const getStatusDisplay = (status: string) => {
    const statusMap: Record<string, { label: string; color: string }> = {
      'peritagemPendente': { label: 'Peritagem Pendente', color: 'bg-yellow-100 text-yellow-800' },
      'emExecucao': { label: 'Em Execução', color: 'bg-blue-100 text-blue-800' },
      'aguardandoChecagem': { label: 'Aguardando Checagem', color: 'bg-purple-100 text-purple-800' },
      'checagemCompleta': { label: 'Checagem Completa', color: 'bg-green-100 text-green-800' },
      'sucateadoPendente': { label: 'Aguardando Validação de Sucateamento', color: 'bg-red-100 text-red-800' },
      'sucateado': { label: 'Sucateado', color: 'bg-red-100 text-red-800' }
    };
    
    return statusMap[status] || { label: status, color: 'bg-gray-100 text-gray-800' };
  };
  
  const statusInfo = getStatusDisplay(sector.status);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <CardTitle>Informações do Setor</CardTitle>
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
              {statusInfo.label}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
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
          
          {(sector.entryObservations || sector.exitObservations || sector.scrapObservations) && (
            <div className="mt-4 pt-4 border-t">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Observações</h3>
              
              {sector.entryObservations && (
                <div className="mb-2">
                  <h4 className="text-xs font-medium text-gray-500">Entrada:</h4>
                  <p className="text-sm">{sector.entryObservations}</p>
                </div>
              )}
              
              {sector.exitObservations && (
                <div className="mb-2">
                  <h4 className="text-xs font-medium text-gray-500">Saída:</h4>
                  <p className="text-sm">{sector.exitObservations}</p>
                </div>
              )}
              
              {sector.scrapObservations && (
                <div>
                  <h4 className="text-xs font-medium text-gray-500">Sucateamento:</h4>
                  <p className="text-sm">{sector.scrapObservations}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Serviços</CardTitle>
        </CardHeader>
        <CardContent>
          {sector.services.filter(s => s.selected).length === 0 ? (
            <p className="text-gray-500 text-center py-4">Nenhum serviço registrado para este setor.</p>
          ) : (
            <ul className="space-y-3">
              {sector.services.filter(s => s.selected).map(service => (
                <li key={service.id} className="flex items-start space-x-3 border-b pb-3">
                  {service.completed ? (
                    <Check className="h-5 w-5 text-green-500 mt-0.5" />
                  ) : (
                    <X className="h-5 w-5 text-gray-300 mt-0.5" />
                  )}
                  <div>
                    <span className="font-medium">{service.name}</span>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <span>Qtd: {service.quantity || 1}</span>
                      <span className={`ml-3 px-2 py-0.5 rounded-full text-xs ${
                        service.completed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {service.completed ? 'Concluído' : 'Pendente'}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
