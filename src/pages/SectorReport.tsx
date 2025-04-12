
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useApi } from "@/contexts/ApiContextExtended";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Calendar, Printer } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import PageLayout from "@/components/layout/PageLayout";
import { Sector } from "@/types";

export default function SectorReport() {
  const { id } = useParams<{ id: string }>();
  const { getSectorById } = useApi();
  const navigate = useNavigate();
  
  const [sector, setSector] = useState<Sector | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchSector = async () => {
      if (!id) return;
      
      try {
        const sectorData = await getSectorById(id);
        if (sectorData) {
          setSector(sectorData);
        }
      } catch (error) {
        console.error("Error fetching sector:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSector();
  }, [id, getSectorById]);
  
  const handlePrint = () => {
    window.print();
  };
  
  if (loading) {
    return (
      <PageLayout>
        <div className="py-20 text-center">
          <p className="text-gray-500">Carregando dados do setor...</p>
        </div>
      </PageLayout>
    );
  }
  
  if (!sector) {
    return (
      <PageLayout>
        <div className="py-20 text-center">
          <p className="text-red-500 font-medium">Setor não encontrado</p>
          <Button 
            variant="outline" 
            onClick={() => navigate(-1)}
            className="mt-4"
          >
            Voltar
          </Button>
        </div>
      </PageLayout>
    );
  }
  
  // Check for previous cycles data
  const hasPreviousCycles = sector.previousCycles && sector.previousCycles.length > 0;
  
  return (
    <PageLayout>
      <div className="space-y-6 print:space-y-12">
        {/* Navigation bar - Hide when printing */}
        <div className="flex items-center justify-between print:hidden">
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold">
              Relatório do Setor: {sector.tagNumber}
            </h1>
          </div>
          
          <Button onClick={handlePrint} className="flex items-center space-x-2">
            <Printer className="h-4 w-4 mr-2" />
            <span>Imprimir</span>
          </Button>
        </div>
        
        {/* Report Title - Show only when printing */}
        <div className="hidden print:block text-center mb-8">
          <h1 className="text-3xl font-bold">Relatório de Recuperação</h1>
          <p className="text-xl mt-2">Setor: {sector.tagNumber}</p>
          <p className="text-gray-500 mt-2">
            Ciclo: {sector.cycleCount || 1}
            {sector.cycleCount && sector.cycleCount > 1 && ` (${sector.cycleCount - 1} recuperação(ões) anterior(es))`}
          </p>
          
          <div className="mt-4">
            <Badge className={
              sector.outcome === 'recovered' ? 'bg-green-100 text-green-800 hover:bg-green-200' :
              sector.outcome === 'scrapped' ? 'bg-red-100 text-red-800 hover:bg-red-200' :
              'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
            }>
              {sector.outcome === 'recovered' ? 'Recuperado com Sucesso' :
               sector.outcome === 'scrapped' ? 'Sucateado' : 'Em Processamento'}
            </Badge>
          </div>
        </div>
        
        {/* Setor Summary Card */}
        <Card className="print:shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="flex justify-between items-center">
              <span>Detalhes do Setor</span>
              {hasPreviousCycles && (
                <Badge variant="outline" className="bg-blue-50">
                  {sector.previousCycles.length} ciclo(s) anterior(es)
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SectorInfoItem label="TAG" value={sector.tagNumber} />
              <SectorInfoItem label="Status" value={
                sector.status === 'concluido' ? 'Concluído' :
                sector.status === 'sucateado' ? 'Sucateado' :
                sector.status === 'checagemFinalPendente' ? 'Checagem Final Pendente' :
                sector.status === 'emExecucao' ? 'Em Execução' :
                sector.status === 'peritagemPendente' ? 'Peritagem Pendente' :
                sector.status === 'sucateadoPendente' ? 'Sucateamento Pendente' : 'Desconhecido'
              } />
              <SectorInfoItem label="Nota Fiscal de Entrada" value={sector.entryInvoice} />
              {sector.exitInvoice && (
                <SectorInfoItem label="Nota Fiscal de Saída" value={sector.exitInvoice} />
              )}
              <SectorInfoItem 
                label="Data de Entrada" 
                value={format(new Date(sector.entryDate), "dd/MM/yyyy", { locale: ptBR })} 
                icon={<Calendar className="h-4 w-4 text-gray-400" />}
              />
              {sector.exitDate && (
                <SectorInfoItem 
                  label="Data de Saída" 
                  value={format(new Date(sector.exitDate), "dd/MM/yyyy", { locale: ptBR })} 
                  icon={<Calendar className="h-4 w-4 text-gray-400" />}
                />
              )}
              {sector.peritagemDate && (
                <SectorInfoItem 
                  label="Data da Peritagem" 
                  value={format(new Date(sector.peritagemDate), "dd/MM/yyyy", { locale: ptBR })} 
                  icon={<Calendar className="h-4 w-4 text-gray-400" />}
                />
              )}
              {sector.checagemDate && (
                <SectorInfoItem 
                  label="Data da Checagem Final" 
                  value={format(new Date(sector.checagemDate), "dd/MM/yyyy", { locale: ptBR })} 
                  icon={<Calendar className="h-4 w-4 text-gray-400" />}
                />
              )}
            </div>
          </CardContent>
        </Card>
        
        <Tabs defaultValue="services" className="print:block">
          <TabsList className="print:hidden">
            <TabsTrigger value="services">Serviços Executados</TabsTrigger>
            <TabsTrigger value="photos">Fotos Comparativas</TabsTrigger>
            {hasPreviousCycles && (
              <TabsTrigger value="history">Histórico</TabsTrigger>
            )}
          </TabsList>
          
          <TabsContent value="services" className="print:block">
            <ServicesCard sector={sector} />
          </TabsContent>
          
          <TabsContent value="photos" className="print:block">
            <PhotosCard sector={sector} />
          </TabsContent>
          
          {hasPreviousCycles && (
            <TabsContent value="history">
              <HistoryCard sector={sector} />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </PageLayout>
  );
}

// Helper components
const SectorInfoItem = ({ 
  label, 
  value, 
  icon 
}: { 
  label: string; 
  value: string | number | JSX.Element; 
  icon?: JSX.Element;
}) => {
  return (
    <div className="flex flex-col">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="flex items-center">
        {icon && <span className="mr-1">{icon}</span>}
        <span className="font-medium">{value}</span>
      </span>
    </div>
  );
};

const ServicesCard = ({ sector }: { sector: Sector }) => {
  const servicesByType = groupServicesByType(sector);
  
  return (
    <Card className="print:shadow-none print:border-none">
      <CardHeader className="pb-2 print:px-0">
        <CardTitle>Serviços Executados</CardTitle>
      </CardHeader>
      <CardContent className="print:px-0">
        {Object.entries(servicesByType).length > 0 ? (
          <div className="space-y-6">
            {Object.entries(servicesByType).map(([type, services]) => (
              <div key={type} className="space-y-2">
                <h3 className="font-medium px-3 py-2 bg-gray-50 rounded-md">
                  {type === 'lavagem' ? 'Lavagem' : 
                   type === 'pintura' ? 'Pintura' : 
                   type === 'troca_elemento' ? 'Troca de Elemento' : type}
                </h3>
                
                <div className="space-y-1 pl-3">
                  {services.map(service => (
                    <div key={service.id} className="flex items-center justify-between py-1">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-2 text-gray-400" />
                        <span>{service.name}</span>
                      </div>
                      {service.quantity > 1 && (
                        <Badge variant="outline">
                          Qtd: {service.quantity}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-500">Nenhum serviço registrado para este setor.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const PhotosCard = ({ sector }: { sector: Sector }) => {
  const servicesByType = groupServicesByType(sector);
  const hasBeforePhotos = sector.beforePhotos && sector.beforePhotos.length > 0;
  const hasAfterPhotos = sector.afterPhotos && sector.afterPhotos.length > 0;
  
  if (!hasBeforePhotos && !hasAfterPhotos) {
    return (
      <Card className="print:shadow-none print:border-none">
        <CardHeader className="pb-2 print:px-0">
          <CardTitle>Fotos Comparativas</CardTitle>
        </CardHeader>
        <CardContent className="print:px-0">
          <div className="text-center py-6">
            <p className="text-gray-500">Nenhuma foto registrada para este setor.</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="print:shadow-none print:border-none">
      <CardHeader className="pb-2 print:px-0">
        <CardTitle>Fotos Comparativas</CardTitle>
      </CardHeader>
      <CardContent className="print:px-0">
        <div className="space-y-8">
          {Object.entries(servicesByType).map(([type, services]) => (
            <div key={type} className="space-y-4">
              <h3 className="font-medium px-3 py-2 bg-gray-50 rounded-md">
                {type === 'lavagem' ? 'Lavagem' : 
                 type === 'pintura' ? 'Pintura' : 
                 type === 'troca_elemento' ? 'Troca de Elemento' : type}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.map(service => {
                  const beforePhotos = sector.beforePhotos?.filter(p => p.serviceId === service.id) || [];
                  const afterPhotos = sector.afterPhotos?.filter(p => p.serviceId === service.id) || [];
                  
                  if (beforePhotos.length === 0 && afterPhotos.length === 0) {
                    return null;
                  }
                  
                  return (
                    <Card key={service.id} className="overflow-hidden">
                      <div className="bg-gray-50 p-3 font-medium border-b">
                        {service.name}
                      </div>
                      <CardContent className="p-0">
                        <div className="grid grid-cols-2 divide-x">
                          <div className="p-3 text-center">
                            <p className="text-sm font-medium mb-2">Antes</p>
                            {beforePhotos.length > 0 ? (
                              <div className="space-y-2">
                                {beforePhotos.map(photo => (
                                  <img 
                                    key={photo.id}
                                    src={photo.url} 
                                    alt={`Antes - ${service.name}`}
                                    className="mx-auto max-h-36 object-contain rounded border"
                                  />
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-400 italic">Sem foto</p>
                            )}
                          </div>
                          
                          <div className="p-3 text-center">
                            <p className="text-sm font-medium mb-2">Depois</p>
                            {afterPhotos.length > 0 ? (
                              <div className="space-y-2">
                                {afterPhotos.map(photo => (
                                  <img 
                                    key={photo.id}
                                    src={photo.url} 
                                    alt={`Depois - ${service.name}`}
                                    className="mx-auto max-h-36 object-contain rounded border"
                                  />
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-400 italic">Sem foto</p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const HistoryCard = ({ sector }: { sector: Sector }) => {
  if (!sector.previousCycles || sector.previousCycles.length === 0) {
    return null;
  }
  
  // Sort cycles by date, newest first
  const sortedCycles = [...sector.previousCycles].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  return (
    <Card className="print:shadow-none print:border-none">
      <CardHeader className="pb-2 print:px-0">
        <CardTitle>Histórico de Recuperações Anteriores</CardTitle>
      </CardHeader>
      <CardContent className="print:px-0">
        <div className="space-y-4">
          {sortedCycles.map((cycle, index) => (
            <div key={index} className="border rounded-md p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-medium">
                    Ciclo {sortedCycles.length - index} de {sortedCycles.length}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {format(new Date(cycle.date), "dd/MM/yyyy", { locale: ptBR })}
                  </p>
                </div>
                <Badge className={
                  cycle.outcome === 'recovered' ? 'bg-green-100 text-green-800' :
                  cycle.outcome === 'scrapped' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }>
                  {cycle.outcome === 'recovered' ? 'Recuperado' :
                   cycle.outcome === 'scrapped' ? 'Sucateado' : 'Status Desconhecido'}
                </Badge>
              </div>
              
              {cycle.notes && (
                <div className="mt-3 bg-gray-50 p-3 rounded-md">
                  <p className="text-sm">{cycle.notes}</p>
                </div>
              )}
              
              {cycle.technician && (
                <p className="text-sm mt-3">
                  <strong>Técnico:</strong> {cycle.technician}
                </p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Helper function to group services by type
function groupServicesByType(sector: Sector) {
  const groupedServices = sector.services.reduce((groups, service) => {
    const type = service.type;
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(service);
    return groups;
  }, {} as Record<string, typeof sector.services>);
  
  return groupedServices;
}
