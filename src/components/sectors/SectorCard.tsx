
import { Sector } from "@/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckSquare, ClipboardCheck, AlertTriangle, CheckCircle2, Clock, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface SectorCardProps {
  sector: Sector;
}

export default function SectorCard({ sector }: SectorCardProps) {
  const getStatusInfo = (status: Sector['status']) => {
    switch (status) {
      case 'peritagemPendente':
        return {
          label: 'Peritagem Pendente',
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: <AlertTriangle className="h-4 w-4 mr-1" />
        };
      case 'emExecucao':
        return {
          label: 'Em Execução',
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: <ClipboardCheck className="h-4 w-4 mr-1" />
        };
      case 'checagemFinalPendente':
        return {
          label: 'Checagem Pendente',
          color: 'bg-purple-100 text-purple-800 border-purple-200',
          icon: <CheckSquare className="h-4 w-4 mr-1" />
        };
      case 'concluido':
        return {
          label: 'Concluído',
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: <CheckSquare className="h-4 w-4 mr-1" />
        };
      case 'sucateadoPendente':
        return {
          label: 'Sucateamento Pendente',
          color: 'bg-orange-100 text-orange-800 border-orange-200',
          icon: <Trash2 className="h-4 w-4 mr-1" />
        };
      case 'sucateado':
        return {
          label: 'Sucateado',
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: <Trash2 className="h-4 w-4 mr-1" />
        };
      default:
        return {
          label: 'Status Desconhecido',
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: null
        };
    }
  };

  const status = getStatusInfo(sector.status);
  const selectedServices = sector.services.filter(service => service.selected);

  return (
    <Card className="h-full flex flex-col shadow-md hover:shadow-lg transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-bold">{sector.tagNumber}</CardTitle>
          <Badge className={`flex items-center ${status.color}`}>
            {status.icon}
            {status.label}
          </Badge>
        </div>
        <CardDescription>
          NF Entrada: {sector.entryInvoice}
        </CardDescription>
        <CardDescription>
          Data: {new Date(sector.entryDate).toLocaleDateString('pt-BR')}
        </CardDescription>
        
        {/* Production Completion Badge */}
        {(sector.status === 'emExecucao' || sector.status === 'checagemFinalPendente') && (
          <div className="mt-2 flex items-center text-xs">
            {sector.productionCompleted ? (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Produção Concluída
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Produção em Andamento
              </Badge>
            )}
          </div>
        )}
      </CardHeader>
      <CardContent className="pb-2 flex-grow">
        <div className="text-sm">
          <p className="font-medium mb-1">Serviços ({selectedServices.length}):</p>
          <ul className="list-disc pl-5 space-y-1">
            {selectedServices.length > 0 ? (
              selectedServices.slice(0, 3).map((service) => (
                <li key={service.id} className="text-xs">
                  {service.name}
                  {service.quantity ? ` (${service.quantity})` : ''}
                </li>
              ))
            ) : (
              <li className="text-xs text-gray-500">Nenhum serviço selecionado</li>
            )}
            {selectedServices.length > 3 && (
              <li className="text-xs italic">
                ...e mais {selectedServices.length - 3} serviço(s)
              </li>
            )}
          </ul>
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        {sector.status === 'peritagemPendente' && (
          <Button asChild className="w-full" variant="outline">
            <Link to={`/peritagem/${sector.id}`}>Completar Peritagem</Link>
          </Button>
        )}
        {sector.status === 'emExecucao' && (
          <Button asChild className="w-full" variant="outline">
            <Link to={`/execucao/${sector.id}`}>Ver Detalhes</Link>
          </Button>
        )}
        {sector.status === 'checagemFinalPendente' && (
          <Button asChild className="w-full" variant="outline">
            <Link to={`/checagem/${sector.id}`}>Realizar Checagem</Link>
          </Button>
        )}
        {sector.status === 'concluido' && (
          <Button asChild className="w-full" variant="outline">
            <Link to={`/setor/${sector.id}`}>Ver Relatório</Link>
          </Button>
        )}
        {sector.status === 'sucateadoPendente' && (
          <Button asChild className="w-full" variant="outline">
            <Link to={`/sucateamento/${sector.id}`}>Validar Sucateamento</Link>
          </Button>
        )}
        {sector.status === 'sucateado' && (
          <Button asChild className="w-full" variant="outline">
            <Link to={`/setor/${sector.id}`}>Ver Relatório</Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
