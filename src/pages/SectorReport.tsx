
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApi } from '@/contexts/ApiContextExtended';
import { Sector, Cycle, PhotoWithMetadata } from '@/types';
import PageLayout from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Printer } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import ReportHeader from '@/components/reports/ReportHeader';
import ServicePhotosList from '@/components/reports/ServicePhotosList';
import ServiceChecklist from '@/components/reports/ServiceChecklist';

export default function SectorReport() {
  const { id } = useParams<{ id: string }>();
  const [sector, setSector] = useState<Sector | null>(null);
  const [cycle, setCycle] = useState<Cycle | null>(null);
  const [photos, setPhotos] = useState<PhotoWithMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { getSectorById } = useApi();

  useEffect(() => {
    document.title = 'Relatório do Setor - Gestão de Recuperação';
    
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
            
            // Carregar todas as fotos com metadados
            const { data: photosData, error: photosError } = await supabase
              .from('photos')
              .select('*')
              .eq('cycle_id', cycleData.id);
              
            if (photosError) {
              throw photosError;
            }
            
            setPhotos(photosData as PhotoWithMetadata[]);
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
              onClick={() => navigate('/setores')}
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
              <ReportHeader sector={sector} />
              
              {/* Lista de Serviços */}
              <ServiceChecklist services={sector.services} />
              
              {/* Fotos dos Serviços */}
              <ServicePhotosList sector={sector} />
              
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
