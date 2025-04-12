
import { Sector } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface SectorDetailsProps {
  sector: Sector;
}

export default function SectorDetails({ sector }: SectorDetailsProps) {
  const entryDate = new Date(sector.entryDate);
  const exitDate = sector.exitDate ? new Date(sector.exitDate) : null;

  const getStatusInfo = (status: Sector['status']) => {
    switch (status) {
      case 'peritagemPendente':
        return {
          label: 'Peritagem Pendente',
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200'
        };
      case 'emExecucao':
        return {
          label: 'Em Execução',
          color: 'bg-blue-100 text-blue-800 border-blue-200'
        };
      case 'checagemFinalPendente':
        return {
          label: 'Checagem Pendente',
          color: 'bg-purple-100 text-purple-800 border-purple-200'
        };
      case 'concluido':
        return {
          label: 'Concluído',
          color: 'bg-green-100 text-green-800 border-green-200'
        };
      default:
        return {
          label: 'Status Desconhecido',
          color: 'bg-gray-100 text-gray-800 border-gray-200'
        };
    }
  };

  const status = getStatusInfo(sector.status);
  const selectedServices = sector.services.filter(service => service.selected);
  
  return (
    <Card className="shadow-md">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl">Detalhes do Setor</CardTitle>
        <Badge className={status.color}>
          {status.label}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Número da Tag</p>
            <p className="font-medium text-lg">{sector.tagNumber}</p>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Nota Fiscal de Entrada</p>
            <p className="font-medium text-lg">{sector.entryInvoice}</p>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Data de Entrada</p>
            <p className="font-medium">
              {format(entryDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </p>
          </div>
          
          {exitDate && (
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Data de Saída</p>
              <p className="font-medium">
                {format(exitDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </p>
            </div>
          )}
          
          {sector.exitInvoice && (
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Nota Fiscal de Saída</p>
              <p className="font-medium text-lg">{sector.exitInvoice}</p>
            </div>
          )}
        </div>
        
        <Separator />
        
        <div>
          <h3 className="text-lg font-medium mb-3">Serviços Requisitados</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2">
            {selectedServices.length > 0 ? (
              selectedServices.map((service) => (
                <div key={service.id} className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-primary mr-2"></div>
                  <span>
                    {service.name}
                    {service.quantity ? ` (${service.quantity})` : ''}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">Nenhum serviço selecionado</p>
            )}
          </div>
        </div>
        
        {sector.completedServices && sector.completedServices.length > 0 && (
          <>
            <Separator />
            
            <div>
              <h3 className="text-lg font-medium mb-3">Serviços Realizados</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2">
                {sector.services
                  .filter(service => sector.completedServices?.includes(service.id))
                  .map((service) => (
                    <div key={service.id} className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                      <span>
                        {service.name}
                        {service.quantity ? ` (${service.quantity})` : ''}
                      </span>
                    </div>
                  ))
                }
              </div>
            </div>
          </>
        )}
        
        {sector.entryObservations && (
          <>
            <Separator />
            
            <div>
              <h3 className="text-lg font-medium mb-2">Observações Iniciais</h3>
              <p className="text-gray-700">{sector.entryObservations}</p>
            </div>
          </>
        )}
        
        {sector.exitObservations && (
          <>
            <Separator />
            
            <div>
              <h3 className="text-lg font-medium mb-2">Observações Finais</h3>
              <p className="text-gray-700">{sector.exitObservations}</p>
            </div>
          </>
        )}
        
        <Separator />
        
        <div>
          <h3 className="text-lg font-medium mb-3">Imagens</h3>
          
          {sector.beforePhotos && sector.beforePhotos.length > 0 && (
            <div className="mb-4">
              <h4 className="font-medium mb-2">Fotos Antes</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {sector.beforePhotos.map((photo) => (
                  <div key={photo.id} className="h-40 bg-gray-200 rounded overflow-hidden">
                    <img 
                      src={photo.url} 
                      alt="Foto antes"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {sector.afterPhotos && sector.afterPhotos.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Fotos Depois</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {sector.afterPhotos.map((photo) => (
                  <div key={photo.id} className="h-40 bg-gray-200 rounded overflow-hidden">
                    <img 
                      src={photo.url} 
                      alt="Foto depois"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {(!sector.beforePhotos || sector.beforePhotos.length === 0) && 
           (!sector.afterPhotos || sector.afterPhotos.length === 0) && (
            <p className="text-muted-foreground">Nenhuma imagem disponível</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
