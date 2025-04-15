
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApi } from '@/contexts/ApiContextExtended';
import { Sector, Cycle } from '@/types';
import PageLayout from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Printer } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

export default function ReportView() {
  const { id } = useParams<{ id: string }>();
  const [sector, setSector] = useState<Sector | null>(null);
  const [cycle, setCycle] = useState<Cycle | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { getSectorById } = useApi();

  useEffect(() => {
    document.title = 'Visualização de Relatório - Gestão de Recuperação';
    
    const loadData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        
        // Carregar setor
        const sectorData = await getSectorById(id);
        if (sectorData) {
          setSector(sectorData);
          
          // Carregar dados do ciclo atual
          const { data: cycleData, error } = await supabase
            .from('cycles')
            .select('*')
            .eq('sector_id', id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
            
          if (error) {
            throw error;
          }
          
          if (cycleData) {
            setCycle(cycleData as Cycle);
          }
        }
      } catch (error) {
        console.error("Erro ao carregar relatório:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [id, getSectorById]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="text-center py-12">
          <p className="text-lg text-gray-600">Carregando relatório...</p>
        </div>
      </PageLayout>
    );
  }

  if (!sector) {
    return (
      <PageLayout>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-red-600">Setor não encontrado</h2>
          <p className="text-gray-500 mt-2">O setor solicitado não existe ou foi removido.</p>
          <Button variant="outline" onClick={() => navigate('/setores')} className="mt-4">
            Voltar para Gerenciamento
          </Button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="space-y-6 print:p-0">
        <div className="flex justify-between items-center print:hidden">
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold">Relatório do Setor</h1>
          </div>
          
          <Button onClick={handlePrint} className="flex items-center space-x-2">
            <Printer className="h-4 w-4 mr-2" />
            Imprimir Relatório
          </Button>
        </div>
        
        <div className="print:shadow-none">
          <Card className="p-6 print:shadow-none print:border-none">
            <div className="space-y-8">
              {/* Cabeçalho do Relatório */}
              <div className="border-b pb-4">
                <h2 className="text-xl font-bold">TAG: {sector.tagNumber}</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <div>
                    <p className="text-sm text-gray-500">NF Entrada</p>
                    <p className="font-medium">{sector.entryInvoice || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Data Entrada</p>
                    <p className="font-medium">
                      {sector.entryDate ? new Date(sector.entryDate).toLocaleDateString() : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">NF Saída</p>
                    <p className="font-medium">{sector.exitInvoice || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Data Saída</p>
                    <p className="font-medium">
                      {sector.exitDate ? new Date(sector.exitDate).toLocaleDateString() : "N/A"}
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="font-medium">
                    {sector.status === 'concluido' ? 'Concluído' : 
                     sector.status === 'sucateado' ? 'Sucateado' :
                     sector.status === 'sucateadoPendente' ? 'Sucateamento Pendente' :
                     sector.status === 'emExecucao' ? 'Em Execução' :
                     sector.status === 'peritagemPendente' ? 'Peritagem Pendente' :
                     sector.status}
                  </p>
                </div>
              </div>
              
              {/* Lista de Serviços */}
              <div className="border-b pb-4">
                <h3 className="text-lg font-bold mb-4">Serviços Executados</h3>
                {sector.services && sector.services.length > 0 ? (
                  <div className="space-y-4">
                    {sector.services
                      .filter(service => service.selected)
                      .map(service => (
                        <div key={service.id} className="border p-4 rounded-md">
                          <div className="flex justify-between">
                            <div>
                              <p className="font-medium">{service.name}</p>
                              <p className="text-sm text-gray-500">
                                Quantidade: {service.quantity || 1}
                              </p>
                            </div>
                            <div className="flex items-center">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                service.completed 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {service.completed ? 'Concluído' : 'Pendente'}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-gray-500">Nenhum serviço registrado para este setor.</p>
                )}
              </div>
              
              {/* Fotos */}
              <div>
                <h3 className="text-lg font-bold mb-4">Fotos</h3>
                
                {/* Foto da TAG */}
                <div className="mb-6">
                  <h4 className="font-medium mb-2">Foto da TAG</h4>
                  {sector.tagPhotoUrl ? (
                    <div className="border rounded overflow-hidden w-48 h-48">
                      <img 
                        src={sector.tagPhotoUrl} 
                        alt="Foto da TAG" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder.svg';
                          target.className = "w-full h-full object-contain bg-gray-100";
                        }}
                      />
                    </div>
                  ) : (
                    <p className="text-gray-500">Sem foto da TAG</p>
                  )}
                </div>
                
                {/* Fotos de Serviços */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-medium mb-2">Fotos Antes</h4>
                    {sector.beforePhotos && sector.beforePhotos.length > 0 ? (
                      <div className="grid grid-cols-2 gap-2">
                        {sector.beforePhotos.map(photo => (
                          <div key={photo.id} className="border rounded overflow-hidden">
                            <img 
                              src={photo.url} 
                              alt="Foto antes" 
                              className="w-full h-32 object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = '/placeholder.svg';
                                target.className = "w-full h-32 object-contain bg-gray-100";
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">Sem fotos de antes</p>
                    )}
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Fotos Depois</h4>
                    {sector.afterPhotos && sector.afterPhotos.length > 0 ? (
                      <div className="grid grid-cols-2 gap-2">
                        {sector.afterPhotos.map(photo => (
                          <div key={photo.id} className="border rounded overflow-hidden">
                            <img 
                              src={photo.url} 
                              alt="Foto depois" 
                              className="w-full h-32 object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = '/placeholder.svg';
                                target.className = "w-full h-32 object-contain bg-gray-100";
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">Sem fotos de depois</p>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Observações */}
              <div>
                <h3 className="text-lg font-bold mb-2">Observações</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-1">Entrada</h4>
                    <p className="text-gray-700 border p-3 rounded-md min-h-[60px] bg-gray-50">
                      {sector.entryObservations || "Nenhuma observação de entrada registrada."}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Saída</h4>
                    <p className="text-gray-700 border p-3 rounded-md min-h-[60px] bg-gray-50">
                      {sector.exitObservations || "Nenhuma observação de saída registrada."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}
