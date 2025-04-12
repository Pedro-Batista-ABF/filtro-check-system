
import PageLayout from "@/components/layout/PageLayout";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useApi } from "@/contexts/ApiContextExtended";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Printer, FileText, Eye } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Sector } from "@/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function ReportPreview() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { getSectorById } = useApi();
  
  const [sectorIds, setSectorIds] = useState<string[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Parse sector IDs from URL query parameters
  useEffect(() => {
    const sectorParam = searchParams.get('sectors');
    if (sectorParam) {
      const ids = sectorParam.split(',');
      setSectorIds(ids);
    } else {
      navigate('/relatorio');
    }
  }, [searchParams, navigate]);
  
  // Fetch sector data
  useEffect(() => {
    const fetchSectors = async () => {
      if (sectorIds.length === 0) return;
      
      setLoading(true);
      try {
        const promises = sectorIds.map(id => getSectorById(id));
        const sectorsData = await Promise.all(promises);
        const validSectors = sectorsData.filter((sector): sector is Sector => !!sector);
        setSectors(validSectors);
      } catch (error) {
        console.error("Error fetching sectors:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSectors();
  }, [sectorIds, getSectorById]);

  const handlePrint = () => {
    window.print();
  };

  // Service types organization
  const getServicesByType = (sector: Sector) => {
    const groupedServices = sector.services.reduce((groups, service) => {
      const type = service.type;
      if (!groups[type]) {
        groups[type] = [];
      }
      groups[type].push(service);
      return groups;
    }, {} as Record<string, typeof sector.services>);
    
    return groupedServices;
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="flex justify-center items-center min-h-screen">
          <p className="text-lg">Carregando relatório...</p>
        </div>
      </PageLayout>
    );
  }

  if (sectors.length === 0) {
    return (
      <PageLayout>
        <div className="flex flex-col items-center justify-center min-h-screen">
          <p className="text-lg mb-4">Nenhum setor encontrado para gerar relatório.</p>
          <Button onClick={() => navigate('/relatorio')} variant="outline">
            Voltar para Seleção
          </Button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="space-y-6 print:pt-0">
        {/* Header - Hidden when printing */}
        <div className="flex items-center justify-between print:hidden">
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => navigate('/relatorio')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold">
              Relatório Consolidado ({sectors.length} setores)
            </h1>
          </div>
          
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={() => navigate('/relatorio')}
              className="flex items-center"
            >
              <Eye className="h-4 w-4 mr-2" />
              Editar Seleção
            </Button>
            <Button 
              onClick={handlePrint}
              className="flex items-center"
            >
              <Printer className="h-4 w-4 mr-2" />
              Imprimir
            </Button>
          </div>
        </div>
        
        {/* Report Title - Visible when printing */}
        <div className="hidden print:block text-center border-b pb-4 mb-6">
          <h1 className="text-2xl font-bold">
            Relatório de Serviços de Recuperação de Setores
          </h1>
          <p className="text-gray-500">
            Data de geração: {format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </p>
        </div>
        
        {/* Sectors List */}
        {sectors.map((sector) => (
          <div key={sector.id} className="mb-8 break-inside-avoid-page">
            <div className="flex items-center justify-between border-b pb-2 mb-4">
              <h2 className="text-xl font-bold">
                TAG: {sector.tagNumber}
              </h2>
              <div className="text-sm text-gray-500">
                Entrada: {format(new Date(sector.entryDate), "dd/MM/yyyy", { locale: ptBR })}
                {sector.peritagemDate && ` • Peritagem: ${format(new Date(sector.peritagemDate), "dd/MM/yyyy", { locale: ptBR })}`}
                {sector.exitDate && ` • Saída: ${format(new Date(sector.exitDate), "dd/MM/yyyy", { locale: ptBR })}`}
                {sector.checagemDate && ` • Checagem: ${format(new Date(sector.checagemDate), "dd/MM/yyyy", { locale: ptBR })}`}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div><strong>Nota Fiscal Entrada:</strong> {sector.entryInvoice}</div>
              {sector.exitInvoice && <div><strong>Nota Fiscal Saída:</strong> {sector.exitInvoice}</div>}
            </div>
            
            <div className="mb-4">
              <strong>Status:</strong> <span className={`px-2 py-1 rounded-full text-sm ${
                sector.status === 'concluido' ? 'bg-green-100 text-green-800' : 
                sector.status === 'sucateado' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
              }`}>
                {sector.status === 'concluido' ? 'Concluído' : 
                 sector.status === 'sucateado' ? 'Sucateado' : 'Em Processamento'}
              </span>
            </div>
            
            <Tabs defaultValue="services">
              <TabsList className="print:hidden">
                <TabsTrigger value="services">Serviços</TabsTrigger>
                <TabsTrigger value="photos">Fotos</TabsTrigger>
              </TabsList>
              
              <TabsContent value="services" className="print:block">
                <ServicesList sector={sector} />
              </TabsContent>
              
              <TabsContent value="photos" className="print:block">
                <PhotosComparison sector={sector} />
              </TabsContent>
            </Tabs>
          </div>
        ))}
      </div>
    </PageLayout>
  );
}

// Services List Component
const ServicesList = ({ sector }: { sector: Sector }) => {
  const servicesByType = getServicesByType(sector);
  
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg border-b pb-2">Serviços Executados</h3>
      
      {Object.entries(servicesByType).map(([type, services]) => (
        <div key={type} className="mb-4">
          <h4 className="font-medium mb-2 bg-gray-100 p-2 rounded">
            {type === 'lavagem' ? 'Lavagem' : 
             type === 'pintura' ? 'Pintura' : 
             type === 'troca_elemento' ? 'Troca de Elemento' : type}
          </h4>
          
          <div className="space-y-2 pl-4">
            {services.map(service => (
              <div key={service.id} className="flex items-center justify-between">
                <div className="flex items-center">
                  <FileText className="h-4 w-4 mr-2 text-gray-400" />
                  <span>{service.name}</span>
                </div>
                <div>
                  {service.quantity > 1 && (
                    <span className="text-sm text-gray-500">Qtd: {service.quantity}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      
      {Object.keys(servicesByType).length === 0 && (
        <p className="text-gray-500 italic">Nenhum serviço registrado para este setor.</p>
      )}
    </div>
  );
};

// Photos Comparison Component
const PhotosComparison = ({ sector }: { sector: Sector }) => {
  const hasBeforePhotos = sector.beforePhotos && sector.beforePhotos.length > 0;
  const hasAfterPhotos = sector.afterPhotos && sector.afterPhotos.length > 0;
  
  const servicesByType = getServicesByType(sector);
  
  if (!hasBeforePhotos && !hasAfterPhotos) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-500 italic">Nenhuma foto registrada para este setor.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <h3 className="font-semibold text-lg border-b pb-2">Comparativo de Fotos</h3>
      
      {Object.entries(servicesByType).map(([type, services]) => (
        <div key={type} className="mb-6">
          <h4 className="font-medium mb-4 bg-gray-100 p-2 rounded">
            {type === 'lavagem' ? 'Lavagem' : 
             type === 'pintura' ? 'Pintura' : 
             type === 'troca_elemento' ? 'Troca de Elemento' : type}
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map(service => {
              // Find photos for this service
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
  );
};

// Helper function to group services by type
function getServicesByType(sector: Sector) {
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
