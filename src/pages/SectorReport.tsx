import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useApi } from "@/contexts/ApiContextExtended";
import PageLayout from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Printer, Download } from "lucide-react";
import { Sector, Cycle, Service, Photo } from "@/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// Update serviceTypeMap to use proper type handling
const serviceTypeMap: Record<string, string> = {
  'substituicao_parafusos': 'Substituição de Parafusos',
  'troca_trecho': 'Troca de Trecho',
  'desempeno': 'Desempeno',
  'troca_tela_lado_a': 'Troca de Tela - Lado A',
  'troca_tela_lado_b': 'Troca de Tela - Lado B',
  'troca_ambos_lados': 'Troca de Tela - Ambos os Lados',
  'fabricacao_canaleta': 'Fabricação de Canaleta',
  'fabricacao_setor_completo': 'Fabricação de Setor Completo',
  'lavagem': 'Lavagem',
  'pintura': 'Pintura',
  'troca_elemento': 'Troca de Elemento'
};

export default function SectorReport() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getSectorById } = useApi();
  const [sector, setSector] = useState<Sector | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);

  useEffect(() => {
    document.title = "Relatório do Setor - Gestão de Recuperação";
    
    const fetchData = async () => {
      try {
        setLoading(true);
        
        if (!id) {
          setError("ID do setor não fornecido");
          return;
        }
        
        // Buscar o setor
        const sectorData = await getSectorById(id);
        
        if (!sectorData) {
          setError("Setor não encontrado");
          return;
        }
        
        setSector(sectorData);
        
        // Buscar todas as fotos diretamente do Supabase para garantir que temos tudo
        try {
          // Primeiro buscar o ciclo atual
          const { data: cycleData, error: cycleError } = await supabase
            .from('cycles')
            .select('id')
            .eq('sector_id', id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();
            
          if (cycleError || !cycleData) {
            console.error("Erro ao buscar ciclo para fotos:", cycleError);
            return;
          }
          
          // Buscar todas as fotos do ciclo
          const { data: photosData, error: photosError } = await supabase
            .from('photos')
            .select('*')
            .eq('cycle_id', cycleData.id);
            
          if (photosError) {
            console.error("Erro ao buscar fotos:", photosError);
            return;
          }
          
          // Mapear fotos para o formato da aplicação
          const mappedPhotos: Photo[] = (photosData || []).map(photo => ({
            id: photo.id,
            url: photo.url,
            type: photo.type as 'before' | 'after' | 'service' | 'tag' | 'scrap',
            serviceId: photo.service_id,
            metadata: photo.metadata,
            created_at: photo.created_at,
            updated_at: photo.updated_at
          }));
          
          setPhotos(mappedPhotos);
          console.log(`Carregadas ${mappedPhotos.length} fotos para o relatório`);
        } catch (photosError) {
          console.error("Erro ao buscar fotos:", photosError);
        }
      } catch (err) {
        console.error("Erro ao carregar dados do setor:", err);
        setError("Erro ao carregar dados do setor");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, getSectorById]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    toast.info("Gerando PDF...", {
      description: "Esta funcionalidade será implementada em breve."
    });
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="flex justify-center items-center min-h-[400px]">
          <p className="text-gray-500">Carregando relatório...</p>
        </div>
      </PageLayout>
    );
  }

  if (error || !sector) {
    return (
      <PageLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <h2 className="text-xl font-bold text-red-500 mb-4">{error || "Erro ao carregar setor"}</h2>
          <Button onClick={() => navigate(-1)} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </div>
      </PageLayout>
    );
  }

  // Obter o ciclo atual
  const currentCycle: Cycle = sector.cycles && sector.cycles.length > 0 
    ? sector.cycles[0] 
    : {
        id: "",
        sector_id: sector.id,
        tag_number: sector.tagNumber,
        entry_invoice: sector.entryInvoice,
        entry_date: sector.entryDate,
        peritagem_date: sector.peritagemDate,
        production_completed: sector.productionCompleted,
        status: sector.status,
        outcome: sector.outcome || 'EmAndamento'
      };

  const getCycleDateInfo = (cycle: Cycle) => {
    return {
      entryDate: cycle.entry_date ? format(new Date(cycle.entry_date), 'dd/MM/yyyy') : 'N/A',
      peritagemDate: cycle.peritagem_date ? format(new Date(cycle.peritagem_date), 'dd/MM/yyyy') : 'N/A',
      exitDate: cycle.exit_date ? format(new Date(cycle.exit_date), 'dd/MM/yyyy') : 'N/A',
      created_at: cycle.created_at ? format(new Date(cycle.created_at), 'dd/MM/yyyy') : 'N/A'
    };
  };

  const dateInfo = getCycleDateInfo(currentCycle);
  
  // Filtrar fotos por tipo e serviço
  const getServicePhotos = (serviceId: string, type: 'before' | 'after') => {
    return photos.filter(photo => 
      photo.serviceId === serviceId && photo.type === type
    );
  };
  
  // Obter fotos gerais (não associadas a serviços)
  const getGeneralPhotos = (type: 'before' | 'after' | 'tag' | 'scrap') => {
    return photos.filter(photo => 
      photo.type === type && !photo.serviceId
    );
  };
  
  // Verificar se há fotos para um serviço
  const hasServicePhotos = (serviceId: string) => {
    return photos.some(photo => photo.serviceId === serviceId);
  };

  // Render technician information if available
  const technician = currentCycle.technician_id 
    ? `Técnico: ${currentCycle.technician_id}`
    : '';

  return (
    <PageLayout>
      <div className="space-y-6 print:space-y-4">
        {/* Header with navigation and print buttons */}
        <div className="flex items-center justify-between print:hidden">
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="page-title">Relatório do Setor</h1>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleDownloadPDF}>
              <Download className="mr-2 h-4 w-4" />
              Baixar PDF
            </Button>
            <Button onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Imprimir
            </Button>
          </div>
        </div>

        {/* Print header */}
        <div className="hidden print:block">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Relatório de Setor</h1>
            <p className="text-sm text-gray-500">
              {format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR })}
            </p>
          </div>
          <Separator className="my-4" />
        </div>

        {/* Sector information */}
        <Card>
          <CardHeader>
            <CardTitle>Informações do Setor</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-sm text-gray-500">TAG</h3>
                <p>{sector.tagNumber}</p>
              </div>
              <div>
                <h3 className="font-semibold text-sm text-gray-500">Status</h3>
                <p className="capitalize">{sector.status}</p>
              </div>
              <div>
                <h3 className="font-semibold text-sm text-gray-500">Nota Fiscal de Entrada</h3>
                <p>{sector.entryInvoice || "N/A"}</p>
              </div>
              <div>
                <h3 className="font-semibold text-sm text-gray-500">Data de Entrada</h3>
                <p>{dateInfo.entryDate}</p>
              </div>
              <div>
                <h3 className="font-semibold text-sm text-gray-500">Data da Peritagem</h3>
                <p>{dateInfo.peritagemDate}</p>
              </div>
              <div>
                <h3 className="font-semibold text-sm text-gray-500">Data de Saída</h3>
                <p>{dateInfo.exitDate}</p>
              </div>
              <div>
                <h3 className="font-semibold text-sm text-gray-500">Ciclo</h3>
                <p>{sector.cycleCount}</p>
              </div>
              <div>
                <h3 className="font-semibold text-sm text-gray-500">Resultado</h3>
                <p className="capitalize">{sector.outcome === 'EmAndamento' ? 'Em Andamento' : sector.outcome}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs for different sections */}
        <Tabs defaultValue="services" className="print:hidden">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="services">Serviços</TabsTrigger>
            <TabsTrigger value="photos">Fotos</TabsTrigger>
            <TabsTrigger value="observations">Observações</TabsTrigger>
          </TabsList>
          
          {/* Services Tab */}
          <TabsContent value="services" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Serviços Realizados</CardTitle>
              </CardHeader>
              <CardContent>
                {sector.services && sector.services.filter(s => s.selected).length > 0 ? (
                  <div className="space-y-4">
                    {sector.services
                      .filter(service => service.selected)
                      .map(service => (
                        <div key={service.id} className="border rounded-md p-4">
                          <h3 className="font-semibold">{service.name}</h3>
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            <div>
                              <span className="text-sm text-gray-500">Quantidade:</span>
                              <span className="ml-2">{service.quantity || 1}</span>
                            </div>
                            {service.observations && (
                              <div className="col-span-2">
                                <span className="text-sm text-gray-500">Observações:</span>
                                <p className="mt-1 text-sm">{service.observations}</p>
                              </div>
                            )}
                          </div>
                          
                          {/* Service Photos */}
                          {hasServicePhotos(service.id) && (
                            <div className="mt-3">
                              <h4 className="text-sm font-medium mb-2">Fotos do Serviço</h4>
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <h5 className="text-xs text-gray-500 mb-1">Antes</h5>
                                  <div className="flex flex-wrap gap-2">
                                    {getServicePhotos(service.id, 'before').map(photo => (
                                      <img 
                                        key={photo.id} 
                                        src={photo.url} 
                                        alt={`Antes - ${service.name}`}
                                        className="w-20 h-20 object-cover rounded border"
                                        onError={(e) => {
                                          const target = e.target as HTMLImageElement;
                                          target.src = '/placeholder.svg';
                                        }}
                                      />
                                    ))}
                                    {getServicePhotos(service.id, 'before').length === 0 && (
                                      <p className="text-xs text-gray-400">Sem fotos</p>
                                    )}
                                  </div>
                                </div>
                                <div>
                                  <h5 className="text-xs text-gray-500 mb-1">Depois</h5>
                                  <div className="flex flex-wrap gap-2">
                                    {getServicePhotos(service.id, 'after').map(photo => (
                                      <img 
                                        key={photo.id} 
                                        src={photo.url} 
                                        alt={`Depois - ${service.name}`}
                                        className="w-20 h-20 object-cover rounded border"
                                        onError={(e) => {
                                          const target = e.target as HTMLImageElement;
                                          target.src = '/placeholder.svg';
                                        }}
                                      />
                                    ))}
                                    {getServicePhotos(service.id, 'after').length === 0 && (
                                      <p className="text-xs text-gray-400">Sem fotos</p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-gray-500">Nenhum serviço selecionado para este setor.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Photos Tab */}
          <TabsContent value="photos" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Fotos do Setor</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* TAG Photo */}
                  <div>
                    <h3 className="font-semibold mb-2">Foto da TAG</h3>
                    <div className="flex flex-wrap gap-2">
                      {getGeneralPhotos('tag').map(photo => (
                        <img 
                          key={photo.id} 
                          src={photo.url} 
                          alt="Foto da TAG"
                          className="w-32 h-32 object-cover rounded border"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/placeholder.svg';
                          }}
                        />
                      ))}
                      {sector.tagPhotoUrl && getGeneralPhotos('tag').length === 0 && (
                        <img 
                          src={sector.tagPhotoUrl} 
                          alt="Foto da TAG"
                          className="w-32 h-32 object-cover rounded border"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/placeholder.svg';
                          }}
                        />
                      )}
                      {!sector.tagPhotoUrl && getGeneralPhotos('tag').length === 0 && (
                        <p className="text-gray-500">Nenhuma foto da TAG disponível.</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Before Photos */}
                  <div>
                    <h3 className="font-semibold mb-2">Fotos Antes</h3>
                    <div className="flex flex-wrap gap-2">
                      {getGeneralPhotos('before').map(photo => (
                        <img 
                          key={photo.id} 
                          src={photo.url} 
                          alt="Foto Antes"
                          className="w-32 h-32 object-cover rounded border"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/placeholder.svg';
                          }}
                        />
                      ))}
                      {getGeneralPhotos('before').length === 0 && (
                        <p className="text-gray-500">Nenhuma foto "antes" disponível.</p>
                      )}
                    </div>
                  </div>
                  
                  {/* After Photos */}
                  <div>
                    <h3 className="font-semibold mb-2">Fotos Depois</h3>
                    <div className="flex flex-wrap gap-2">
                      {getGeneralPhotos('after').map(photo => (
                        <img 
                          key={photo.id} 
                          src={photo.url} 
                          alt="Foto Depois"
                          className="w-32 h-32 object-cover rounded border"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/placeholder.svg';
                          }}
                        />
                      ))}
                      {getGeneralPhotos('after').length === 0 && (
                        <p className="text-gray-500">Nenhuma foto "depois" disponível.</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Scrap Photos */}
                  {sector.status === 'sucateado' || sector.status === 'sucateadoPendente' && (
                    <div>
                      <h3 className="font-semibold mb-2">Fotos de Sucateamento</h3>
                      <div className="flex flex-wrap gap-2">
                        {getGeneralPhotos('scrap').map(photo => (
                          <img 
                            key={photo.id} 
                            src={photo.url} 
                            alt="Foto de Sucateamento"
                            className="w-32 h-32 object-cover rounded border"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = '/placeholder.svg';
                            }}
                          />
                        ))}
                        {getGeneralPhotos('scrap').length === 0 && (
                          <p className="text-gray-500">Nenhuma foto de sucateamento disponível.</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Observations Tab */}
          <TabsContent value="observations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Observações</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Entry Observations */}
                  <div>
                    <h3 className="font-semibold mb-1">Observações de Entrada</h3>
                    <p className="text-gray-700">
                      {sector.entryObservations || "Nenhuma observação registrada."}
                    </p>
                  </div>
                  
                  {/* Exit Observations */}
                  <div>
                    <h3 className="font-semibold mb-1">Observações de Saída</h3>
                    <p className="text-gray-700">
                      {sector.exitObservations || "Nenhuma observação registrada."}
                    </p>
                  </div>
                  
                  {/* Scrap Observations */}
                  {(sector.status === 'sucateado' || sector.status === 'sucateadoPendente') && (
                    <div>
                      <h3 className="font-semibold mb-1">Observações de Sucateamento</h3>
                      <p className="text-gray-700">
                        {sector.scrapObservations || "Nenhuma observação registrada."}
                      </p>
                    </div>
                  )}
                  
                  {/* Technician */}
                  {technician && (
                    <div>
                      <h3 className="font-semibold mb-1">Técnico Responsável</h3>
                      <p className="text-gray-700">{technician}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* Print version - all content visible */}
        <div className="hidden print:block space-y-6">
          {/* Services */}
          <div className="mt-6">
            <h2 className="text-xl font-bold mb-4">Serviços Realizados</h2>
            {sector.services && sector.services.filter(s => s.selected).length > 0 ? (
              <div className="space-y-4">
                {sector.services
                  .filter(service => service.selected)
                  .map(service => (
                    <div key={service.id} className="border rounded-md p-4">
                      <h3 className="font-semibold">{service.name}</h3>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <div>
                          <span className="text-sm text-gray-500">Quantidade:</span>
                          <span className="ml-2">{service.quantity || 1}</span>
                        </div>
                        {service.observations && (
                          <div className="col-span-2">
                            <span className="text-sm text-gray-500">Observações:</span>
                            <p className="mt-1 text-sm">{service.observations}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-gray-500">Nenhum serviço selecionado para este setor.</p>
            )}
          </div>
          
          {/* Observations */}
          <div className="mt-6">
            <h2 className="text-xl font-bold mb-4">Observações</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-1">Observações de Entrada</h3>
                <p className="text-gray-700">
                  {sector.entryObservations || "Nenhuma observação registrada."}
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-1">Observações de Saída</h3>
                <p className="text-gray-700">
                  {sector.exitObservations || "Nenhuma observação registrada."}
                </p>
              </div>
              
              {(sector.status === 'sucateado' || sector.status === 'sucateadoPendente') && (
                <div>
                  <h3 className="font-semibold mb-1">Observações de Sucateamento</h3>
                  <p className="text-gray-700">
                    {sector.scrapObservations || "Nenhuma observação registrada."}
                  </p>
                </div>
              )}
              
              {technician && (
                <div>
                  <h3 className="font-semibold mb-1">Técnico Responsável</h3>
                  <p className="text-gray-700">{technician}</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Photos */}
          <div className="mt-6 page-break-before">
            <h2 className="text-xl font-bold mb-4">Fotos</h2>
            
            {/* TAG Photo */}
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Foto da TAG</h3>
              <div className="flex flex-wrap gap-2">
                {getGeneralPhotos('tag').map(photo => (
                  <img 
                    key={photo.id} 
                    src={photo.url} 
                    alt="Foto da TAG"
                    className="w-32 h-32 object-cover rounded border"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder.svg';
                    }}
                  />
                ))}
                {sector.tagPhotoUrl && getGeneralPhotos('tag').length === 0 && (
                  <img 
                    src={sector.tagPhotoUrl} 
                    alt="Foto da TAG"
                    className="w-32 h-32 object-cover rounded border"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder.svg';
                    }}
                  />
                )}
                {!sector.tagPhotoUrl && getGeneralPhotos('tag').length === 0 && (
                  <p className="text-gray-500">Nenhuma foto da TAG disponível.</p>
                )}
              </div>
            </div>
            
            {/* Before/After Photos */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <h3 className="font-semibold mb-2">Fotos Antes</h3>
                <div className="flex flex-wrap gap-2">
                  {getGeneralPhotos('before').map(photo => (
                    <img 
                      key={photo.id} 
                      src={photo.url} 
                      alt="Foto Antes"
                      className="w-32 h-32 object-cover rounded border"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder.svg';
                      }}
                    />
                  ))}
                  {getGeneralPhotos('before').length === 0 && (
                    <p className="text-gray-500">Nenhuma foto "antes" disponível.</p>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Fotos Depois</h3>
                <div className="flex flex-wrap gap-2">
                  {getGeneralPhotos('after').map(photo => (
                    <img 
                      key={photo.id} 
                      src={photo.url} 
                      alt="Foto Depois"
                      className="w-32 h-32 object-cover rounded border"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder.svg';
                      }}
                    />
                  ))}
                  {getGeneralPhotos('after').length === 0 && (
                    <p className="text-gray-500">Nenhuma foto "depois" disponível.</p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Service Photos */}
            {sector.services && sector.services.filter(s => s.selected && hasServicePhotos(s.id)).length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Fotos dos Serviços</h3>
                <div className="space-y-4">
                  {sector.services
                    .filter(service => service.selected && hasServicePhotos(service.id))
                    .map(service => (
                      <div key={service.id} className="border rounded-md p-4">
                        <h4 className="font-medium mb-2">{service.name}</h4>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <h5 className="text-xs text-gray-500 mb-1">Antes</h5>
                            <div className="flex flex-wrap gap-2">
                              {getServicePhotos(service.id, 'before').map(photo => (
                                <img 
                                  key={photo.id} 
                                  src={photo.url} 
                                  alt={`Antes - ${service.name}`}
                                  className="w-20 h-20 object-cover rounded border"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = '/placeholder.svg';
                                  }}
                                />
                              ))}
                              {getServicePhotos(service.id, 'before').length === 0 && (
                                <p className="text-xs text-gray-400">Sem fotos</p>
                              )}
                            </div>
                          </div>
                          <div>
                            <h5 className="text-xs text-gray-500 mb-1">Depois</h5>
                            <div className="flex flex-wrap gap-2">
                              {getServicePhotos(service.id, 'after').map(photo => (
                                <img 
                                  key={photo.id} 
                                  src={photo.url} 
                                  alt={`Depois - ${service.name}`}
                                  className="w-20 h-20 object-cover rounded border"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = '/placeholder.svg';
                                  }}
                                />
                              ))}
                              {getServicePhotos(service.id, 'after').length === 0 && (
                                <p className="text-xs text-gray-400">Sem fotos</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
            
            {/* Scrap Photos */}
            {(sector.status === 'sucateado' || sector.status === 'sucateadoPendente') && (
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Fotos de Sucateamento</h3>
                <div className="flex flex-wrap gap-2">
                  {getGeneralPhotos('scrap').map(photo => (
                    <img 
                      key={photo.id} 
                      src={photo.url} 
                      alt="Foto de Sucateamento"
                      className="w-32 h-32 object-cover rounded border"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder.svg';
                      }}
                    />
                  ))}
                  {getGeneralPhotos('scrap').length === 0 && (
                    <p className="text-gray-500">Nenhuma foto de sucateamento disponível.</p>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div className="mt-8 pt-4 border-t">
            <div className="flex justify-between">
              <p className="text-sm text-gray-500">
                Relatório gerado em {format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR })}
              </p>
              <p className="text-sm text-gray-500">
                Página <span className="page-number"></span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
