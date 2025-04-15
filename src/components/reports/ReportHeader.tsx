
import React from 'react';
import { Sector } from '@/types';
import { format } from 'date-fns';
import { Card, CardContent } from "@/components/ui/card";

interface ReportHeaderProps {
  sector: Sector;
  showPrint?: boolean;
}

export default function ReportHeader({ sector, showPrint = false }: ReportHeaderProps) {
  // Helper function to format date
  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy');
    } catch (e) {
      return dateString;
    }
  };

  return (
    <Card className="border-none shadow-sm print:shadow-none">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-2xl font-bold mb-2">Relatório de Recuperação</h1>
            <p className="text-gray-500">Setor: {sector.tagNumber}</p>
          </div>
          
          {showPrint && (
            <button 
              onClick={() => window.print()}
              className="mt-4 md:mt-0 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded text-gray-700 flex items-center print:hidden"
            >
              <span className="mr-2">Imprimir Relatório</span>
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Informações do Setor</h3>
            <div className="mt-2 space-y-1">
              <p><span className="font-medium">TAG:</span> {sector.tagNumber}</p>
              <p><span className="font-medium">NF Entrada:</span> {sector.entryInvoice || 'N/A'}</p>
              <p><span className="font-medium">Data Entrada:</span> {formatDate(sector.entryDate)}</p>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500">Peritagem</h3>
            <div className="mt-2 space-y-1">
              <p><span className="font-medium">Data:</span> {formatDate(sector.peritagemDate)}</p>
              <p><span className="font-medium">Serviços:</span> {sector.services.filter(s => s.selected).length}</p>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500">Saída</h3>
            <div className="mt-2 space-y-1">
              <p>
                <span className="font-medium">NF Saída:</span> {sector.exitInvoice || 'N/A'}
              </p>
              <p>
                <span className="font-medium">Data Checagem:</span> {formatDate(sector.checagemDate)}
              </p>
              <p>
                <span className="font-medium">Status:</span> {
                  sector.status === 'sucateado' ? 'Sucateado' : 
                  sector.status === 'checagemCompleta' ? 'Completo' : 
                  'Em Processamento'
                }
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
