
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sector } from "@/types";
import { ArrowUpRight, Calendar, FileText, Tag } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface SectorSummaryProps {
  sector: Sector;
}

export default function SectorSummary({ sector }: SectorSummaryProps) {
  // Format dates appropriately
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Não definida";
    try {
      return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR });
    } catch (e) {
      return dateString;
    }
  };

  // Get selected services count
  const selectedServicesCount = sector.services?.filter(service => service.selected).length || 0;
  
  // Determine the status text and color
  const getStatusInfo = (status: string) => {
    switch(status) {
      case 'peritagemPendente':
        return { text: 'Peritagem Pendente', color: 'text-yellow-600 bg-yellow-50' };
      case 'emExecucao':
        return { text: 'Em Execução', color: 'text-blue-600 bg-blue-50' };
      case 'checagemFinalPendente':
        return { text: 'Checagem Pendente', color: 'text-purple-600 bg-purple-50' };
      case 'concluido':
        return { text: 'Concluído', color: 'text-green-600 bg-green-50' };
      case 'sucateadoPendente':
        return { text: 'Sucateamento Pendente', color: 'text-red-600 bg-red-50' };
      case 'sucateado':
        return { text: 'Sucateado', color: 'text-red-600 bg-red-50' };
      default:
        return { text: status, color: 'text-gray-600 bg-gray-50' };
    }
  };
  
  const statusInfo = getStatusInfo(sector.status);

  return (
    <Card className="border-none shadow-lg">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Informações do Setor</CardTitle>
          <span className={`text-sm font-medium px-3 py-1 rounded-full ${statusInfo.color}`}>
            {statusInfo.text}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3">
              <Tag className="h-5 w-5 text-gray-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-500">TAG do Setor</p>
                <p className="font-medium">{sector.tagNumber}</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <FileText className="h-5 w-5 text-gray-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-500">NF de Entrada</p>
                <p className="font-medium">{sector.entryInvoice || "Não informada"}</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-500">Data de Entrada</p>
                <p className="font-medium">{formatDate(sector.entryDate)}</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-500">Data da Peritagem</p>
                <p className="font-medium">{formatDate(sector.peritagemDate)}</p>
              </div>
            </div>
            
            {sector.status === 'concluido' && (
              <>
                <div className="flex items-start space-x-3">
                  <FileText className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">NF de Saída</p>
                    <p className="font-medium">{sector.exitInvoice || "Não informada"}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Data de Saída</p>
                    <p className="font-medium">{formatDate(sector.exitDate)}</p>
                  </div>
                </div>
              </>
            )}
            
            {(sector.status === 'sucateadoPendente' || sector.status === 'sucateado') && (
              <div className="flex items-start space-x-3">
                <ArrowUpRight className="h-5 w-5 text-red-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-500">Setor Sucateado</p>
                  <p className="font-medium">{
                    sector.scrapObservations || "Sem observações"
                  }</p>
                </div>
              </div>
            )}
          </div>
          
          <div className="pt-4 border-t">
            <h3 className="font-medium mb-2">Serviços Selecionados</h3>
            <p>{selectedServicesCount} serviço(s) selecionado(s) para este setor</p>
          </div>
          
          {sector.entryObservations && (
            <div className="pt-4 border-t">
              <h3 className="font-medium mb-2">Observações de Entrada</h3>
              <p className="text-sm">{sector.entryObservations}</p>
            </div>
          )}
          
          {sector.exitObservations && (
            <div className="pt-4 border-t">
              <h3 className="font-medium mb-2">Observações de Saída</h3>
              <p className="text-sm">{sector.exitObservations}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
