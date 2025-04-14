
import { Sector } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ServicesList from "./ServicesList";
import { format, parseISO } from "date-fns";
import { Badge } from "@/components/ui/badge";
import TagPhoto from "./TagPhoto";

interface SectorDetailsProps {
  sector: Sector;
}

export default function SectorDetails({ sector }: SectorDetailsProps) {
  // Função para formatar data
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return format(parseISO(dateString), "dd/MM/yyyy");
    } catch (error) {
      return dateString;
    }
  };
  
  // Status badge
  const renderStatusBadge = () => {
    const statusMap: Record<string, { label: string, variant: "default" | "secondary" | "destructive" | "outline" }> = {
      peritagemPendente: { label: "Peritagem Pendente", variant: "outline" },
      emExecucao: { label: "Em Execução", variant: "default" },
      checagemFinalPendente: { label: "Checagem Pendente", variant: "secondary" },
      concluido: { label: "Concluído", variant: "default" },
      sucateado: { label: "Sucateado", variant: "destructive" },
      sucateadoPendente: { label: "Sucateamento Pendente", variant: "destructive" }
    };
    
    const status = statusMap[sector.status] || { label: sector.status, variant: "outline" };
    
    return (
      <Badge variant={status.variant} className="ml-2">
        {status.label}
      </Badge>
    );
  };
  
  return (
    <div className="space-y-6">
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center">
            TAG: {sector.tagNumber}
            {renderStatusBadge()}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-medium mb-4">Informações do Setor</h3>
              <div className="space-y-2">
                <div className="grid grid-cols-2">
                  <span className="text-gray-500">Nota Fiscal Entrada:</span>
                  <span>{sector.entryInvoice}</span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="text-gray-500">Data de Entrada:</span>
                  <span>{formatDate(sector.entryDate)}</span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="text-gray-500">Data de Peritagem:</span>
                  <span>{formatDate(sector.peritagemDate)}</span>
                </div>
                {sector.entryObservations && (
                  <div className="grid grid-cols-2">
                    <span className="text-gray-500">Observações:</span>
                    <span>{sector.entryObservations}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-4">Foto da TAG</h3>
              <TagPhoto sector={sector} />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Tabs defaultValue="services">
        <TabsList className="grid grid-cols-2 w-full max-w-md">
          <TabsTrigger value="services">Serviços Solicitados</TabsTrigger>
          <TabsTrigger value="photos">Fotos</TabsTrigger>
        </TabsList>
        
        <TabsContent value="services" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Serviços</CardTitle>
            </CardHeader>
            <CardContent>
              <ServicesList services={sector.services} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="photos" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Fotos do Setor</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sector.beforePhotos && sector.beforePhotos.length > 0 ? (
                  sector.beforePhotos.map((photo) => (
                    <div key={photo.id} className="rounded overflow-hidden border">
                      <img 
                        src={photo.url} 
                        alt="Foto antes do serviço" 
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-2 bg-gray-50">
                        <Badge variant="outline">Antes</Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="col-span-full text-gray-500">Nenhuma foto registrada</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
