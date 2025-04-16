
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApi } from '@/contexts/ApiContextExtended';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sector, Service } from '@/types';
import { Printer, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import PageLayoutWrapper from '@/components/layout/PageLayoutWrapper';
import PhotoComparison from '@/components/sectors/PhotoComparison';
import { toast } from 'sonner';

function printReport() {
  window.print();
}

export default function ReportPreview() {
  const [sector, setSector] = useState<Sector | null>(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams<{ id: string }>();
  const { getSectorById } = useApi();
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchSector() {
      if (!id) {
        toast.error('ID do setor não fornecido');
        navigate('/peritagem');
        return;
      }

      try {
        setLoading(true);
        const sectorData = await getSectorById(id);
        
        if (!sectorData) {
          toast.error('Setor não encontrado');
          navigate('/peritagem');
          return;
        }
        
        setSector(sectorData);
      } catch (error) {
        console.error('Erro ao carregar setor:', error);
        toast.error('Erro ao carregar dados do setor');
      } finally {
        setLoading(false);
      }
    }

    fetchSector();
  }, [id, getSectorById, navigate]);

  if (loading) {
    return (
      <PageLayoutWrapper>
        <div className="flex justify-center items-center h-96">
          <p>Carregando relatório...</p>
        </div>
      </PageLayoutWrapper>
    );
  }

  if (!sector) {
    return (
      <PageLayoutWrapper>
        <div className="flex justify-center items-center h-96">
          <p>Setor não encontrado</p>
        </div>
      </PageLayoutWrapper>
    );
  }

  // Identificar quais serviços foram selecionados
  const selectedServices = sector.services?.filter(service => service.selected) || [];

  return (
    <PageLayoutWrapper>
      <div className="space-y-6 print:py-0">
        {/* Botões visíveis apenas na tela (não impressos) */}
        <div className="flex justify-between items-center print:hidden">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <Button onClick={printReport}>
            <Printer className="mr-2 h-4 w-4" />
            Imprimir
          </Button>
        </div>

        {/* Relatório */}
        <div className="space-y-8">
          {/* Cabeçalho do relatório */}
          <Card className="border-none shadow-lg print:shadow-none print:border print:border-gray-300">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-xl font-bold">Relatório de Recuperação de Filtro</CardTitle>
                  <p className="text-sm text-gray-500">
                    Gerado em: {format(new Date(), 'dd/MM/yyyy')}
                  </p>
                </div>
                {/* Logo da empresa - visível apenas na impressão */}
                <div className="hidden print:block">
                  <img 
                    src="/logo.png" 
                    alt="Logo da Empresa" 
                    className="h-16 w-auto"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.style.display = 'none';
                    }}
                  />
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Informações do Setor */}
          <Card className="border-none shadow-lg print:shadow-none print:border print:border-gray-300">
            <CardHeader className="pb-2">
              <CardTitle>Informações do Setor</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="font-semibold">TAG do Setor:</p>
                  <p>{sector.tagNumber}</p>
                </div>
                <div>
                  <p className="font-semibold">Data de Entrada:</p>
                  <p>{sector.entryDate ? format(new Date(sector.entryDate), 'dd/MM/yyyy') : 'Não informada'}</p>
                </div>
                <div>
                  <p className="font-semibold">Nota Fiscal de Entrada:</p>
                  <p>{sector.entryInvoice || 'Não informada'}</p>
                </div>
                <div>
                  <p className="font-semibold">Data da Peritagem:</p>
                  <p>{sector.peritagemDate ? format(new Date(sector.peritagemDate), 'dd/MM/yyyy') : 'Não informada'}</p>
                </div>
                <div>
                  <p className="font-semibold">Data de Saída:</p>
                  <p>{sector.exitDate ? format(new Date(sector.exitDate), 'dd/MM/yyyy') : 'Não informada'}</p>
                </div>
                <div>
                  <p className="font-semibold">Nota Fiscal de Saída:</p>
                  <p>{sector.exitInvoice || 'Não informada'}</p>
                </div>
              </div>

              {sector.entryObservations && (
                <div className="mt-4">
                  <p className="font-semibold">Observações de Entrada:</p>
                  <p className="whitespace-pre-line">{sector.entryObservations}</p>
                </div>
              )}

              {sector.exitObservations && (
                <div className="mt-4">
                  <p className="font-semibold">Observações de Saída:</p>
                  <p className="whitespace-pre-line">{sector.exitObservations}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Foto da TAG */}
          {sector.tagPhotoUrl && (
            <Card className="border-none shadow-lg print:shadow-none print:border print:border-gray-300">
              <CardHeader className="pb-2">
                <CardTitle>Foto da TAG</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex justify-center">
                  <img 
                    src={sector.tagPhotoUrl} 
                    alt="Foto da TAG" 
                    className="max-h-64 object-contain border rounded"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Serviços Realizados */}
          <Card className="border-none shadow-lg print:shadow-none print:border print:border-gray-300">
            <CardHeader className="pb-2">
              <CardTitle>Serviços Realizados</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {selectedServices.length > 0 ? (
                <div className="space-y-6">
                  {selectedServices.map((service: Service) => (
                    <div key={service.id} className="pb-4 border-b border-gray-200 last:border-0">
                      <h4 className="font-medium mb-2">{service.name}</h4>
                      
                      {service.observations && (
                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-700">Observações:</p>
                          <p className="text-sm text-gray-600 whitespace-pre-line">{service.observations}</p>
                        </div>
                      )}
                      
                      <PhotoComparison sector={sector} service={service} />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">Nenhum serviço selecionado</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Estilos para impressão */}
      <style>
        {`
          @media print {
            @page {
              size: A4;
              margin: 1cm;
            }
            body {
              font-size: 12pt;
              line-height: 1.3;
            }
            .print\\:py-0 {
              padding-top: 0;
              padding-bottom: 0;
            }
            .card {
              break-inside: avoid;
              margin-bottom: 1rem;
            }
            img {
              max-width: 100%;
            }
          }
        `}
      </style>
    </PageLayoutWrapper>
  );
}
