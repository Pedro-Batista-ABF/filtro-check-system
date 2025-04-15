
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageLayout from '@/components/layout/PageLayout';
import { useApi } from '@/contexts/ApiContextExtended';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Clipboard, AlertTriangle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Sector, Service, SectorStatus, CycleOutcome } from '@/types';
import { toast } from 'sonner';
import SectorServices from '@/components/sectors/SectorServices';
import SectorSummary from '@/components/sectors/SectorSummary';
import SectorPhotos from '@/components/sectors/SectorPhotos';
import { supabase } from '@/integrations/supabase/client';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function ExecucaoDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getSectorById, updateSector } = useApi();
  const [sector, setSector] = useState<Sector | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [productionCompleted, setProductionCompleted] = useState(false);

  useEffect(() => {
    document.title = 'Detalhes da Execução - Gestão de Recuperação';
    
    const loadSector = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const sectorData = await getSectorById(id);
        
        if (sectorData) {
          setSector(sectorData);
          setProductionCompleted(sectorData.productionCompleted || false);
        } else {
          toast.error("Setor não encontrado");
          navigate('/execucao');
        }
      } catch (error) {
        console.error("Erro ao carregar setor:", error);
        toast.error("Erro ao carregar setor");
      } finally {
        setLoading(false);
      }
    };
    
    loadSector();
  }, [id, getSectorById, navigate]);

  const handleServiceCompletion = (serviceId: string, completed: boolean) => {
    if (!sector) return;
    
    const updatedServices = sector.services.map(service => 
      service.id === serviceId ? { ...service, completed } : service
    );
    
    setSector({ ...sector, services: updatedServices });
  };

  const handleMarkAsCompleted = async () => {
    if (!sector) return;
    
    try {
      setSaving(true);
      
      // Atualizar os dados do setor
      const updatedSector: Partial<Sector> = {
        ...sector,
        status: 'emExecucao' as SectorStatus,
        productionCompleted: true
      };
      
      await updateSector(updatedSector);
      
      // Atualizar diretamente no Supabase também
      try {
        await supabase
          .from('sectors')
          .update({
            current_status: 'emExecucao',
            updated_at: new Date().toISOString()
          })
          .eq('id', sector.id);
          
        // Atualizar o ciclo atual
        const { data: cycleData } = await supabase
          .from('cycles')
          .select('id')
          .eq('sector_id', sector.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
          
        if (cycleData) {
          await supabase
            .from('cycles')
            .update({
              production_completed: true,
              status: 'emExecucao',
              updated_at: new Date().toISOString()
            })
            .eq('id', cycleData.id);
        }
      } catch (dbError) {
        console.error("Erro na atualização direta:", dbError);
      }
      
      toast.success("Setor marcado como concluído", {
        description: "Agora o setor está disponível para checagem final."
      });
      
      // Atualizar o estado local
      setProductionCompleted(true);
      setSector({ ...sector, productionCompleted: true });
    } catch (error) {
      console.error("Erro ao marcar como concluído:", error);
      toast.error("Erro ao salvar", {
        description: "Não foi possível marcar o setor como concluído."
      });
    } finally {
      setSaving(false);
    }
  };

  const handleMarkForScrap = async () => {
    if (!sector) return;
    
    try {
      setSaving(true);
      
      // Atualizar os dados do setor
      const updatedSector: Partial<Sector> = {
        ...sector,
        status: 'sucateadoPendente' as SectorStatus,
        outcome: 'scrapped' as CycleOutcome
      };
      
      await updateSector(updatedSector);
      
      // Atualizar diretamente no Supabase também
      try {
        await supabase
          .from('sectors')
          .update({
            current_status: 'sucateadoPendente',
            current_outcome: 'scrapped',
            updated_at: new Date().toISOString()
          })
          .eq('id', sector.id);
          
        // Atualizar o ciclo atual
        const { data: cycleData } = await supabase
          .from('cycles')
          .select('id')
          .eq('sector_id', sector.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
          
        if (cycleData) {
          await supabase
            .from('cycles')
            .update({
              status: 'sucateadoPendente',
              outcome: 'scrapped',
              updated_at: new Date().toISOString()
            })
            .eq('id', cycleData.id);
        }
      } catch (dbError) {
        console.error("Erro na atualização direta:", dbError);
      }
      
      toast.success("Setor marcado para sucateamento", {
        description: "O setor foi enviado para validação de sucateamento."
      });
      
      navigate('/execucao');
    } catch (error) {
      console.error("Erro ao marcar para sucateamento:", error);
      toast.error("Erro ao salvar", {
        description: "Não foi possível marcar o setor para sucateamento."
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="text-center py-12">
          <p className="text-lg text-gray-600">Carregando...</p>
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
          <Button variant="outline" onClick={() => navigate('/execucao')} className="mt-4">
            Voltar para Execução
          </Button>
        </div>
      </PageLayout>
    );
  }

  const allServicesCompleted = sector.services
    .filter(service => service.selected)
    .every(service => service.completed);

  return (
    <PageLayout>
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => navigate('/execucao')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Detalhes da Execução</h1>
        </div>
        
        <Card className="p-6">
          <SectorSummary sector={sector} />
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Serviços a Executar</CardTitle>
          </CardHeader>
          <CardContent>
            <SectorServices 
              services={sector.services} 
              onMarkCompleted={handleServiceCompletion}
              readonly={productionCompleted}
            />
            
            {sector.services.filter(s => s.selected).length === 0 && (
              <div className="text-center py-6">
                <p className="text-gray-500">Nenhum serviço registrado para este setor.</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Fotos da Peritagem</CardTitle>
          </CardHeader>
          <CardContent>
            <SectorPhotos 
              photos={sector.beforePhotos || []} 
              title="Fotos dos Serviços (Antes)" 
              emptyMessage="Nenhuma foto de peritagem disponível."
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Conclusão da Produção</CardTitle>
              {productionCompleted && (
                <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                  Produção Concluída
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {productionCompleted ? (
              <div className="bg-green-50 border border-green-200 p-4 rounded-md">
                <p className="text-green-800">
                  Este setor foi marcado como concluído pela produção e está disponível para checagem final.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-start space-x-2">
                  <Checkbox 
                    id="production-completed" 
                    checked={allServicesCompleted}
                    disabled={true}
                  />
                  <div>
                    <label 
                      htmlFor="production-completed" 
                      className="font-medium cursor-pointer"
                    >
                      Todos os serviços foram concluídos?
                    </label>
                    <p className="text-sm text-gray-500">
                      Marque todos os serviços como concluídos antes de finalizar a produção.
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 justify-end">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="destructive"
                        className="flex items-center"
                        disabled={saving}
                      >
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Marcar para Sucateamento
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar Sucateamento</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja marcar este setor para sucateamento? 
                          Esta ação exigirá validação posterior e não poderá ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleMarkForScrap}>
                          Confirmar Sucateamento
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  
                  <Button 
                    onClick={handleMarkAsCompleted}
                    disabled={!allServicesCompleted || saving}
                    className="flex items-center"
                  >
                    <Clipboard className="h-4 w-4 mr-2" />
                    Concluir Produção
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
