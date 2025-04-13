
import React, { useState, useEffect } from 'react';
import { Sector, Service } from '@/types';
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Printer } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import PageLayout from "@/components/layout/PageLayout";
import { useApi } from '@/contexts/ApiContextExtended';
import PhotoComparison from '@/components/sectors/PhotoComparison';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const ReportPreview: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { getSectorById } = useApi();
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState(true);

  // Parse URL params to get sector IDs
  useEffect(() => {
    const fetchSectors = async () => {
      const params = new URLSearchParams(location.search);
      const sectorIdsParam = params.get('sectors');
      
      if (sectorIdsParam) {
        const sectorIds = sectorIdsParam.split(',');
        const fetchedSectors: Sector[] = [];
        
        for (const id of sectorIds) {
          try {
            const sector = await getSectorById(id);
            if (sector) {
              fetchedSectors.push(sector);
            }
          } catch (error) {
            console.error(`Erro ao carregar setor ${id}:`, error);
          }
        }
        
        setSectors(fetchedSectors);
      }
      
      setLoading(false);
    };

    fetchSectors();
  }, [location.search, getSectorById]);

  // Função para agrupar serviços por tipo
  const getServicesByType = (sector: Sector) => {
    const groupedServices = sector.services.reduce((groups, service) => {
      const type = service.type;
      if (!groups[type]) {
        groups[type] = [];
      }
      if (service.selected) {
        groups[type].push(service);
      }
      return groups;
    }, {} as Record<string, typeof sector.services>);
    
    return groupedServices;
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="text-center py-12">
          <h1 className="text-xl font-semibold">Carregando...</h1>
        </div>
      </PageLayout>
    );
  }

  if (sectors.length === 0) {
    return (
      <PageLayout>
        <div className="text-center py-12">
          <h1 className="text-xl font-bold text-red-500">Nenhum setor encontrado</h1>
          <Button
            onClick={() => navigate('/relatorio')}
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
      <div className="space-y-6 print:p-0">
        <div className="flex items-center justify-between print:hidden">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate('/relatorio')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="page-title">Relatório Consolidado</h1>
          </div>
          
          <div className="flex space-x-2">
            <Button
              onClick={handlePrint}
              className="flex items-center"
            >
              <Printer className="h-4 w-4 mr-2" />
              Imprimir Relatório
            </Button>
          </div>
        </div>
        
        <div className="print:hidden border-b pb-2 mb-6">
          <p className="text-muted-foreground">
            Exibindo relatório consolidado com {sectors.length} {sectors.length === 1 ? 'setor' : 'setores'}
          </p>
        </div>

        {/* Cabeçalho para impressão */}
        <div className="hidden print:block mb-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Relatório Consolidado de Recuperação</h1>
            <p className="text-base text-gray-600">
              Data de geração: {format(new Date(), 'dd/MM/yyyy', { locale: ptBR })}
            </p>
          </div>
        </div>

        {sectors.map((sector, index) => {
          const servicesByType = getServicesByType(sector);
          return (
            <Card key={sector.id} id={`sector-${sector.id}`} className="mb-8 break-inside-avoid print:border print:shadow-none">
              <CardHeader className="border-b">
                <CardTitle className="text-lg flex justify-between items-center">
                  <span>Setor: {sector.tagNumber}</span>
                  <span className={`text-sm px-2 py-1 rounded-full ${
                    sector.status === 'sucateado' 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {sector.status === 'sucateado' ? 'Sucateado' : 'Concluído'}
                  </span>
                </CardTitle>
              </CardHeader>
              
              <CardContent className="p-4 space-y-6">
                {/* Detalhes do Setor */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p><strong>Nota Fiscal de Entrada:</strong> {sector.entryInvoice}</p>
                    <p><strong>Data de Entrada:</strong> {format(new Date(sector.entryDate), 'dd/MM/yyyy', { locale: ptBR })}</p>
                    <p><strong>Data da Peritagem:</strong> {sector.peritagemDate ? format(new Date(sector.peritagemDate), 'dd/MM/yyyy', { locale: ptBR }) : '-'}</p>
                  </div>
                  <div className="space-y-2">
                    <p><strong>Nota Fiscal de Saída:</strong> {sector.exitInvoice || '-'}</p>
                    <p><strong>Data de Saída:</strong> {sector.exitDate ? format(new Date(sector.exitDate), 'dd/MM/yyyy', { locale: ptBR }) : '-'}</p>
                    <p><strong>Data da Checagem:</strong> {sector.checagemDate ? format(new Date(sector.checagemDate), 'dd/MM/yyyy', { locale: ptBR }) : '-'}</p>
                  </div>
                </div>
                
                {/* Observações */}
                {(sector.entryObservations || sector.exitObservations) && (
                  <div className="mt-4 space-y-2">
                    <h3 className="font-semibold text-md border-b pb-1">Observações</h3>
                    {sector.entryObservations && (
                      <div>
                        <p><strong>Observações de Entrada:</strong> {sector.entryObservations}</p>
                      </div>
                    )}
                    {sector.exitObservations && (
                      <div>
                        <p><strong>Observações de Saída:</strong> {sector.exitObservations}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Serviços executados */}
                <div className="mt-4">
                  <h3 className="font-semibold text-md border-b pb-1 mb-2">Serviços Executados</h3>
                  
                  {Object.entries(servicesByType).length > 0 ? (
                    <div className="space-y-4">
                      {Object.entries(servicesByType).map(([type, services]) => (
                        <div key={type} className="mb-4">
                          <h4 className="font-medium mb-2 bg-gray-100 p-2 rounded">
                            {type === 'lavagem' ? 'Lavagem' : 
                             type === 'pintura' ? 'Pintura' : 
                             type === 'troca_elemento' ? 'Troca de Elemento' : type}
                          </h4>
                          
                          <div className="space-y-2 pl-4">
                            {services.map(service => (
                              <div key={service.id} className="border-l-2 border-gray-300 pl-4">
                                <p className="text-sm">{service.name} {service.quantity && service.quantity > 1 ? `(${service.quantity})` : ''}</p>
                                {service.observations && (
                                  <p className="text-xs text-gray-600 mt-1">Obs: {service.observations}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic">Nenhum serviço selecionado para este setor.</p>
                  )}
                </div>
                
                {/* Comparativo de fotos */}
                <div className="mt-6">
                  <h3 className="font-semibold text-md border-b pb-1 mb-4">Comparativo de Fotos</h3>
                  
                  <div className="space-y-6">
                    {Object.entries(servicesByType).map(([type, services]) => (
                      <div key={`photo-${type}`} className="mb-6">
                        <h4 className="font-medium mb-2 bg-gray-100 p-2 rounded">
                          {type === 'lavagem' ? 'Lavagem' : 
                           type === 'pintura' ? 'Pintura' : 
                           type === 'troca_elemento' ? 'Troca de Elemento' : type}
                        </h4>
                        
                        <div className="space-y-4">
                          {services.map(service => (
                            <PhotoComparison 
                              key={service.id} 
                              sector={sector} 
                              service={service} 
                              sectorId={sector.id}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Assinaturas (apenas para impressão) */}
                <div className="hidden print:block mt-10">
                  <div className="flex justify-between">
                    <div className="w-1/3 border-t border-black pt-1 text-center">
                      <p>Responsável pela Peritagem</p>
                    </div>
                    <div className="w-1/3 border-t border-black pt-1 text-center">
                      <p>Responsável pela Execução</p>
                    </div>
                    <div className="w-1/3 border-t border-black pt-1 text-center">
                      <p>Responsável pela Qualidade</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        
        {/* Separador de página para impressão com múltiplos setores */}
        <div className="hidden print:block page-break-after"></div>
        
        <style jsx>{`
          @media print {
            .page-break-after {
              page-break-after: always;
            }
          }
        `}</style>
      </div>
    </PageLayout>
  );
};

export default ReportPreview;
