
import PageLayout from "@/components/layout/PageLayout";
import { useNavigate, useLocation } from "react-router-dom";
import { useApi } from "@/contexts/ApiContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Printer, Mail } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Sector, Photo, Service } from "@/types";
import { toast } from "sonner";

export default function ReportPreview() {
  const { getSectorById } = useApi();
  const navigate = useNavigate();
  const location = useLocation();
  
  const searchParams = new URLSearchParams(location.search);
  const sectorIds = searchParams.get('sectors')?.split(',') || [];
  
  const selectedSectors = sectorIds
    .map(id => getSectorById(id))
    .filter((sector): sector is Sector => !!sector);
  
  const handlePrint = () => {
    toast.success('Relatório enviado para impressão');
    window.print();
  };

  const handleEmail = () => {
    toast.success('Relatório enviado por e-mail');
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR });
    } catch (error) {
      return dateString;
    }
  };

  const renderServicePhotos = (service: Service, sectorId: string) => {
    if (!service.photos || service.photos.length === 0) {
      return (
        <div className="text-center p-4 bg-gray-50 rounded">
          <p className="text-sm text-gray-500">Sem fotos para este serviço</p>
        </div>
      );
    }
    
    const beforePhotos = service.photos.filter(photo => photo.type === 'before');
    const afterPhotos = service.photos.filter(photo => photo.type === 'after');
    
    return (
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h5 className="text-sm font-medium mb-2">Antes</h5>
          {beforePhotos.length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
              {beforePhotos.map(photo => (
                <div key={photo.id} className="h-32 bg-gray-200 rounded overflow-hidden">
                  <img 
                    src={photo.url} 
                    alt={`Foto antes - ${service.name}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-4 bg-gray-50 rounded">
              <p className="text-sm text-gray-500">Sem fotos "antes"</p>
            </div>
          )}
        </div>
        
        <div>
          <h5 className="text-sm font-medium mb-2">Depois</h5>
          {afterPhotos.length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
              {afterPhotos.map(photo => (
                <div key={photo.id} className="h-32 bg-gray-200 rounded overflow-hidden">
                  <img 
                    src={photo.url} 
                    alt={`Foto depois - ${service.name}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-4 bg-gray-50 rounded">
              <p className="text-sm text-gray-500">Sem fotos "depois"</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderSectorContent = (sector: Sector) => {
    if (sector.status === 'sucateado') {
      return (
        <>
          <div className="bg-red-50 p-4 rounded-md border border-red-200 mb-4">
            <h3 className="text-lg font-medium text-red-700">Setor Sucateado</h3>
            {sector.scrapObservations && (
              <div className="mt-2">
                <p className="text-sm text-red-600 font-medium">Motivo do Sucateamento:</p>
                <p className="text-sm">{sector.scrapObservations}</p>
              </div>
            )}
            {sector.scrapReturnDate && (
              <p className="text-sm mt-2">
                <span className="font-medium">Data de Devolução:</span> {formatDate(sector.scrapReturnDate)}
              </p>
            )}
            {sector.scrapReturnInvoice && (
              <p className="text-sm">
                <span className="font-medium">NF de Devolução:</span> {sector.scrapReturnInvoice}
              </p>
            )}
          </div>
          
          {/* Exibir serviços que foram apontados na peritagem para contextualização */}
          <div>
            <h3 className="text-lg font-medium mb-4">Serviços Apontados na Peritagem</h3>
            <div className="space-y-4">
              {sector.services
                .filter(service => service.selected)
                .map(service => (
                  <div key={service.id} className="border rounded-md p-4">
                    <h4 className="font-medium">
                      {service.name}
                      {service.quantity ? ` (${service.quantity})` : ''}
                    </h4>
                    
                    {service.observations && (
                      <div className="mt-2">
                        <p className="text-sm text-muted-foreground font-medium">Observações:</p>
                        <p className="text-sm">{service.observations}</p>
                      </div>
                    )}
                    
                    {service.photos && service.photos.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm text-muted-foreground font-medium">Fotos do Defeito:</p>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {service.photos
                            .filter(photo => photo.type === 'before')
                            .map(photo => (
                              <div key={photo.id} className="h-32 bg-gray-200 rounded overflow-hidden">
                                <img 
                                  src={photo.url} 
                                  alt={`Foto defeito - ${service.name}`}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              }
              
              {(!sector.services.some(service => service.selected)) && (
                <p className="text-muted-foreground">Nenhum serviço apontado na peritagem</p>
              )}
            </div>
          </div>
        </>
      );
    }
    
    // Conteúdo padrão para setores concluídos
    return (
      <>
        <div>
          <h3 className="text-lg font-medium mb-4">Serviços Executados</h3>
          
          <div className="space-y-6">
            {sector.services
              .filter(service => service.selected && sector.completedServices?.includes(service.id))
              .map(service => (
                <div key={service.id} className="border rounded-md p-4 space-y-4">
                  <h4 className="font-medium">
                    {service.name}
                    {service.quantity ? ` (${service.quantity})` : ''}
                  </h4>
                  
                  {service.observations && (
                    <div>
                      <p className="text-sm text-muted-foreground font-medium">Observações:</p>
                      <p className="text-sm">{service.observations}</p>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground font-medium">Fotos:</p>
                    {renderServicePhotos(service, sector.id)}
                  </div>
                </div>
              ))
            }
            
            {(!sector.services.some(service => 
              service.selected && sector.completedServices?.includes(service.id)
            )) && (
              <p className="text-muted-foreground">Nenhum serviço executado registrado</p>
            )}
          </div>
        </div>
        
        {(sector.entryObservations || sector.exitObservations) && (
          <>
            <Separator className="my-6" />
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Observações</h3>
              
              {sector.entryObservations && (
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Iniciais:</p>
                  <p className="text-sm">{sector.entryObservations}</p>
                </div>
              )}
              
              {sector.exitObservations && (
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Finais:</p>
                  <p className="text-sm">{sector.exitObservations}</p>
                </div>
              )}
            </div>
          </>
        )}
      </>
    );
  };

  if (selectedSectors.length === 0) {
    return (
      <PageLayout>
        <div className="text-center py-12">
          <h1 className="text-xl font-bold text-red-500">Nenhum setor selecionado</h1>
          <Button 
            onClick={() => navigate('/relatorios')} 
            className="mt-4"
            variant="outline"
          >
            Voltar para Relatórios
          </Button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between print:hidden">
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => navigate('/relatorios')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="page-title">Relatório Consolidado</h1>
          </div>
          
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={handleEmail}
              className="flex items-center"
            >
              <Mail className="h-4 w-4 mr-2" />
              Enviar por E-mail
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

        <div className="text-center print:block hidden">
          <h1 className="text-2xl font-bold">Relatório Consolidado de Setores</h1>
          <p className="text-muted-foreground">
            Data de geração: {format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </p>
        </div>
        
        <div className="space-y-8">
          {selectedSectors.map(sector => (
            <Card key={sector.id} className="page-break-inside-avoid">
              <CardContent className="p-6 space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-bold">TAG: {sector.tagNumber}</h2>
                    <div className="text-muted-foreground space-y-1">
                      <div>Entrada: {formatDate(sector.entryDate)}</div>
                      <div>Peritagem: {formatDate(sector.peritagemDate)}</div>
                      {sector.exitDate && <div>Saída: {formatDate(sector.exitDate)}</div>}
                      {sector.checagemDate && <div>Checagem: {formatDate(sector.checagemDate)}</div>}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div>NF Entrada: {sector.entryInvoice}</div>
                    {sector.exitInvoice && <div>NF Saída: {sector.exitInvoice}</div>}
                    <div className="mt-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        sector.status === 'sucateado' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {sector.status === 'sucateado' ? 'Sucateado' : 'Concluído'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                {renderSectorContent(sector)}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </PageLayout>
  );
}
