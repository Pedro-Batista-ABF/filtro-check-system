
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApi } from '@/contexts/ApiContextExtended';
import PageLayout from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Download, FileText, Printer, Camera, Check } from "lucide-react";
import { Sector, Service } from '@/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from "sonner";

export default function ReportPreview() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { sectors, loading, getSectorById } = useApi();
  const [selectedSectors, setSelectedSectors] = useState<Sector[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    document.title = "Prévia do Relatório - Gestão de Recuperação";
  }, []);

  useEffect(() => {
    const fetchSelectedSectors = async () => {
      setIsLoading(true);
      const sectorIds = searchParams.get('sectors')?.split(',') || [];
      
      try {
        if (sectorIds.length === 0) {
          navigate('/relatorio');
          return;
        }
        
        const fetchedSectors: Sector[] = [];
        for (const id of sectorIds) {
          const sector = await getSectorById(id);
          if (sector) {
            fetchedSectors.push(sector);
          }
        }
        
        setSelectedSectors(fetchedSectors);
      } catch (error) {
        console.error("Erro ao buscar setores:", error);
        toast.error("Erro ao buscar detalhes dos setores");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSelectedSectors();
  }, [searchParams, getSectorById, navigate]);

  const handleDownload = () => {
    toast.success("Relatório baixado com sucesso");
  };

  const handlePrint = () => {
    window.print();
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'concluido':
        return 'Concluído';
      case 'sucateado':
        return 'Sucateado';
      default:
        return status;
    }
  };

  // Função para agrupar serviços semelhantes de diferentes setores
  const groupServicesByType = (sectors: Sector[]) => {
    const serviceGroups: { [key: string]: { service: Service, count: number, sectors: string[] } } = {};
    
    sectors.forEach(sector => {
      const selectedServices = sector.services?.filter(s => s.selected) || [];
      selectedServices.forEach(service => {
        if (!serviceGroups[service.id]) {
          serviceGroups[service.id] = {
            service: { ...service },
            count: 0,
            sectors: []
          };
        }
        
        serviceGroups[service.id].count += service.quantity || 1;
        serviceGroups[service.id].sectors.push(sector.tagNumber);
      });
    });
    
    return Object.values(serviceGroups);
  };

  if (isLoading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <p>Carregando prévia do relatório...</p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-between print:hidden">
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => navigate('/relatorio')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="page-title">Prévia do Relatório</h1>
          </div>
          
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={handleDownload}
            >
              <Download className="h-4 w-4 mr-2" />
              Baixar PDF
            </Button>
            <Button 
              variant="outline"
              onClick={handlePrint}
            >
              <Printer className="h-4 w-4 mr-2" />
              Imprimir
            </Button>
          </div>
        </div>
        
        <div className="print:mt-0">
          <div className="text-center mb-6 print:mb-4">
            <h1 className="text-2xl font-bold">Relatório de Recuperação de Setores</h1>
            <p className="text-gray-500">Data de emissão: {format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</p>
          </div>
          
          <Card className="mb-6 print:shadow-none print:border-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Resumo do Relatório</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="border rounded-md p-3 text-center">
                  <p className="text-sm text-gray-500">Total de Setores</p>
                  <p className="text-xl font-bold">{selectedSectors.length}</p>
                </div>
                <div className="border rounded-md p-3 text-center">
                  <p className="text-sm text-gray-500">Concluídos</p>
                  <p className="text-xl font-bold">{selectedSectors.filter(s => s.status === 'concluido').length}</p>
                </div>
                <div className="border rounded-md p-3 text-center">
                  <p className="text-sm text-gray-500">Sucateados</p>
                  <p className="text-xl font-bold">{selectedSectors.filter(s => s.status === 'sucateado').length}</p>
                </div>
                <div className="border rounded-md p-3 text-center">
                  <p className="text-sm text-gray-500">Serviços Realizados</p>
                  <p className="text-xl font-bold">
                    {selectedSectors.reduce((acc, sector) => {
                      const selectedServices = sector.services?.filter(s => s.selected) || [];
                      return acc + selectedServices.length;
                    }, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="mb-6">
            <h2 className="text-lg font-bold mb-4">Lista de Setores</h2>
            {selectedSectors.map((sector) => (
              <Card key={sector.id} className="mb-4 print:break-inside-avoid print:shadow-none print:border">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-base">TAG: {sector.tagNumber}</CardTitle>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      sector.status === 'sucateado' 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {getStatusLabel(sector.status)}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="grid grid-cols-2 mb-2 text-sm gap-y-1">
                    <div><strong>NF Entrada:</strong> {sector.entryInvoice}</div>
                    <div><strong>Data Entrada:</strong> {sector.entryDate ? format(new Date(sector.entryDate), "dd/MM/yyyy", { locale: ptBR }) : "N/A"}</div>
                    <div><strong>NF Saída:</strong> {sector.exitInvoice || "N/A"}</div>
                    <div><strong>Data Saída:</strong> {sector.exitDate ? format(new Date(sector.exitDate), "dd/MM/yyyy", { locale: ptBR }) : "N/A"}</div>
                  </div>
                  
                  {sector.status === 'sucateado' ? (
                    <div className="border-t pt-2 mt-2">
                      <p className="font-medium">Motivo do Sucateamento:</p>
                      <p className="text-sm">{sector.scrapObservations || "Não informado"}</p>
                      
                      {sector.scrapPhotos && sector.scrapPhotos.length > 0 && (
                        <div className="mt-2">
                          <p className="font-medium mb-1">Fotos do Sucateamento:</p>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {sector.scrapPhotos.map((photo, index) => (
                              <div key={`scrap-${index}`} className="border rounded overflow-hidden aspect-square">
                                <img 
                                  src={photo.url} 
                                  alt={`Foto de sucateamento ${index + 1}`} 
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="border-t pt-2 mt-2">
                      <p className="font-medium mb-1">Serviços Realizados:</p>
                      <ul className="list-disc pl-5 text-sm">
                        {sector.services
                          ?.filter(service => service.selected)
                          .map(service => (
                            <li key={`${sector.id}-${service.id}`}>
                              {service.name}
                              {service.quantity && service.quantity > 1 ? ` (${service.quantity}x)` : ''}
                            </li>
                          ))
                        }
                      </ul>
                      
                      {sector.exitObservations && (
                        <div className="mt-2">
                          <p className="font-medium">Observações Finais:</p>
                          <p className="text-sm">{sector.exitObservations}</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="mb-6 print:break-before-page">
            <h2 className="text-lg font-bold mb-4">Serviços Realizados por Tipo</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {groupServicesByType(selectedSectors)
                .sort((a, b) => b.count - a.count)
                .map((group) => (
                  <Card key={group.service.id} className="print:break-inside-avoid print:shadow-none print:border">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center">
                        <Check className="h-4 w-4 mr-2 text-green-500" />
                        {group.service.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center text-sm mb-2">
                        <span className="font-medium">Total:</span>
                        <span className="font-bold text-base">{group.count}</span>
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Setores:</span>
                        <p className="text-gray-600">{group.sectors.join(', ')}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
          
          <div className="print:break-before-page">
            <h2 className="text-lg font-bold mb-4">Registro Fotográfico</h2>
            {selectedSectors.filter(s => s.status !== 'sucateado').map((sector) => {
              const servicesWithPhotos = sector.services?.filter(s => 
                s.selected && 
                s.photos && 
                s.photos.length > 0
              ) || [];
              
              if (servicesWithPhotos.length === 0) return null;
              
              return (
                <Card key={`photos-${sector.id}`} className="mb-6 print:break-inside-avoid print:shadow-none print:border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">
                      Registro Fotográfico - TAG: {sector.tagNumber}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {servicesWithPhotos.map(service => {
                      const beforePhotos = service.photos?.filter(p => p.type === 'before') || [];
                      const afterPhotos = service.photos?.filter(p => p.type === 'after') || [];
                      
                      return (
                        <div key={`${sector.id}-${service.id}`} className="mb-4 pb-4 border-b last:border-0">
                          <h3 className="font-medium mb-2">{service.name}</h3>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm font-medium mb-1 flex items-center">
                                <Camera className="h-3 w-3 mr-1" />
                                Antes
                              </p>
                              <div className="grid grid-cols-2 gap-2">
                                {beforePhotos.map((photo, index) => (
                                  <div key={`before-${photo.id || index}`} className="border rounded overflow-hidden aspect-square">
                                    <img 
                                      src={photo.url} 
                                      alt={`Antes ${index + 1}`} 
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                            
                            <div>
                              <p className="text-sm font-medium mb-1 flex items-center">
                                <Camera className="h-3 w-3 mr-1" />
                                Depois
                              </p>
                              <div className="grid grid-cols-2 gap-2">
                                {afterPhotos.map((photo, index) => (
                                  <div key={`after-${photo.id || index}`} className="border rounded overflow-hidden aspect-square">
                                    <img 
                                      src={photo.url} 
                                      alt={`Depois ${index + 1}`} 
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                ))}
                                {afterPhotos.length === 0 && (
                                  <div className="border rounded p-2 flex items-center justify-center text-gray-500 text-sm aspect-square">
                                    Sem fotos após execução
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
