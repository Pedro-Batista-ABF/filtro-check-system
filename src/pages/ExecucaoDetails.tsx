
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useApi } from '@/contexts/ApiContextExtended';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sector, Service } from '@/types';
import PageLayoutWrapper from '@/components/layout/PageLayoutWrapper';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import SectorServices from '@/components/sectors/SectorServices';
import SectorSummary from '@/components/sectors/SectorSummary';
import SectorPhotos from '@/components/sectors/SectorPhotos';
import { supabase } from '@/integrations/supabase/client';

export default function ExecucaoDetails() {
  const { id } = useParams<{ id: string }>();
  const [sector, setSector] = useState<Sector | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { getSectorById, updateSector } = useApi();
  const navigate = useNavigate();

  useEffect(() => {
    const loadSector = async () => {
      try {
        if (!id) return;
        
        setLoading(true);
        const sectorData = await getSectorById(id);
        
        if (!sectorData) {
          toast.error('Setor não encontrado');
          navigate('/execucao');
          return;
        }
        
        setSector(sectorData);
      } catch (error) {
        console.error('Erro ao carregar setor:', error);
        toast.error('Erro ao carregar dados do setor');
      } finally {
        setLoading(false);
      }
    };
    
    loadSector();
  }, [id, getSectorById, navigate]);

  const handleUpdateService = (serviceId: string, completed: boolean) => {
    if (!sector) return;
    
    const updatedServices = sector.services.map(service => 
      service.id === serviceId ? { ...service, completed } : service
    );
    
    setSector({ ...sector, services: updatedServices });
  };

  const handleSubmit = async () => {
    try {
      if (!sector) return;
      
      setIsSaving(true);
      
      // Check if all services are completed
      const allServicesCompleted = sector.services
        .filter(s => s.selected)
        .every(s => s.completed);
      
      // Prepare updated sector data
      const updatedSectorData = {
        ...sector,
        productionCompleted: allServicesCompleted,
        status: allServicesCompleted ? 'aguardandoChecagem' : 'emExecucao'
      };
      
      // Update sector in database
      await updateSector(sector.id, updatedSectorData);
      
      // Also directly update in Supabase for better traceability
      await supabase
        .from('cycles')
        .update({
          status: updatedSectorData.status,
          production_completed: updatedSectorData.productionCompleted,
          updated_at: new Date().toISOString()
        })
        .eq('sector_id', sector.id)
        .order('created_at', { ascending: false })
        .limit(1);
      
      // Also update services completion in cycle_services
      for (const service of sector.services.filter(s => s.selected)) {
        // Get current cycle
        const { data: cycleData } = await supabase
          .from('cycles')
          .select('id')
          .eq('sector_id', sector.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
          
        if (cycleData) {
          await supabase
            .from('cycle_services')
            .update({
              completed: service.completed
            })
            .eq('cycle_id', cycleData.id)
            .eq('service_id', service.id);
        }
      }
      
      toast.success(allServicesCompleted ? 
        'Produção concluída com sucesso!' : 
        'Serviços atualizados com sucesso!'
      );
      
      if (allServicesCompleted) {
        navigate('/execucao');
      }
    } catch (error) {
      console.error('Erro ao salvar produção:', error);
      toast.error('Erro ao salvar dados de produção');
    } finally {
      setIsSaving(false);
    }
  };

  const handleMarkScrapped = async () => {
    try {
      if (!sector) return;
      
      setIsSaving(true);
      
      // Update sector to scrapped pending status
      const updatedSectorData = {
        ...sector,
        status: 'sucateadoPendente',
        outcome: 'EmProcessoSucateamento'
      };
      
      // Update in database
      await updateSector(sector.id, updatedSectorData);
      
      // Direct update in Supabase for traceability
      await supabase
        .from('sectors')
        .update({
          current_status: 'sucateadoPendente',
          current_outcome: 'EmProcessoSucateamento',
          updated_at: new Date().toISOString()
        })
        .eq('id', sector.id);
        
      // Update cycle status too
      await supabase
        .from('cycles')
        .update({
          status: 'sucateadoPendente',
          outcome: 'EmProcessoSucateamento',
          updated_at: new Date().toISOString()
        })
        .eq('sector_id', sector.id)
        .order('created_at', { ascending: false })
        .limit(1);
      
      toast.success('Setor marcado para sucateamento. Aguardando validação.');
      navigate('/execucao');
    } catch (error) {
      console.error('Erro ao marcar para sucateamento:', error);
      toast.error('Erro ao marcar setor para sucateamento');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <PageLayoutWrapper>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          <span className="ml-3 text-gray-500">Carregando dados do setor...</span>
        </div>
      </PageLayoutWrapper>
    );
  }

  if (!sector) {
    return (
      <PageLayoutWrapper>
        <div className="text-center py-12">
          <h2 className="text-lg font-medium text-gray-700">Setor não encontrado</h2>
          <p className="text-gray-500 mt-2">O setor solicitado não foi encontrado ou não está disponível.</p>
          <Button className="mt-4" onClick={() => navigate('/execucao')}>
            Voltar para Lista
          </Button>
        </div>
      </PageLayoutWrapper>
    );
  }

  return (
    <PageLayoutWrapper>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Execução de Serviços</h1>
          <div className="space-x-2">
            <Button 
              variant="outline" 
              onClick={() => navigate('/execucao')}
              disabled={isSaving}
            >
              Voltar
            </Button>
            
            <Button 
              variant="destructive" 
              onClick={handleMarkScrapped}
              disabled={isSaving}
            >
              Marcar para Sucateamento
            </Button>
          </div>
        </div>
        
        <SectorSummary sector={sector} />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SectorServices 
            sector={sector}
            onUpdateService={handleUpdateService}
            onSubmit={handleSubmit}
            isLoading={isSaving}
          />
          
          <SectorPhotos 
            sector={sector} 
            title="Fotos da Peritagem"
          />
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Ações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
              <Button 
                onClick={handleSubmit} 
                disabled={isSaving}
                className="flex-1"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  'Salvar Serviços'
                )}
              </Button>
              
              <Button 
                onClick={() => {
                  const allCompleted = sector.services
                    .filter(s => s.selected)
                    .every(s => s.completed);
                    
                  if (!allCompleted) {
                    sector.services.forEach(s => {
                      if (s.selected) handleUpdateService(s.id, true);
                    });
                    toast.info('Todos os serviços marcados como concluídos');
                  } else {
                    sector.services.forEach(s => {
                      if (s.selected) handleUpdateService(s.id, false);
                    });
                    toast.info('Todos os serviços marcados como pendentes');
                  }
                }}
                variant="outline"
                className="flex-1"
                disabled={isSaving || sector.services.filter(s => s.selected).length === 0}
              >
                {sector.services.filter(s => s.selected).every(s => s.completed)
                  ? 'Desmarcar Todos'
                  : 'Marcar Todos como Concluídos'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayoutWrapper>
  );
}
