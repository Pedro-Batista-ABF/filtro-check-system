
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageLayout from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, ArrowLeft, CheckCircle2, Loader2, Trash } from "lucide-react";
import { useApi } from "@/contexts/ApiContextExtended";
import SectorServices from "@/components/sectors/SectorServices";
import SectorSummary from "@/components/sectors/SectorSummary";
import SectorPhotos from "@/components/sectors/SectorPhotos";
import { toast } from "sonner";
import { Sector } from "@/types";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';

export default function ExecucaoDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getSectorById, updateSector } = useApi();
  const [sector, setSector] = useState<Sector>();
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [markingScrap, setMarkingScrap] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showScrapDialog, setShowScrapDialog] = useState(false);

  useEffect(() => {
    const fetchSector = async () => {
      if (!id) return;
      
      try {
        const sectorData = await getSectorById(id);
        if (!sectorData) {
          toast.error("Setor não encontrado");
          navigate('/execucao');
          return;
        }
        
        setSector(sectorData);
      } catch (error) {
        console.error("Error fetching sector:", error);
        toast.error("Erro ao carregar dados do setor");
      } finally {
        setLoading(false);
      }
    };
    
    fetchSector();
  }, [id, getSectorById, navigate]);

  const handleMarkComplete = async () => {
    if (!sector || !id) return;
    
    try {
      setUpdatingStatus(true);
      setShowConfirmDialog(false);
      
      const updates = {
        ...sector,
        status: 'checagemFinalPendente',
        productionCompleted: true
      };
      
      await updateSector(id, updates);
      
      // Also update directly in Supabase
      await supabase.from('sectors')
        .update({
          current_status: 'checagemFinalPendente',
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
        
      // Update the cycle status
      const { data: cycleData } = await supabase
        .from('cycles')
        .select('id')
        .eq('sector_id', id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
        
      if (cycleData) {
        await supabase
          .from('cycles')
          .update({
            status: 'checagemFinalPendente',
            production_completed: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', cycleData.id);
      }
      
      toast.success("Setor marcado como concluído com sucesso!");
      navigate('/execucao');
    } catch (error) {
      console.error("Error updating sector status:", error);
      toast.error("Erro ao marcar setor como concluído");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleMarkScrap = async () => {
    if (!sector || !id) return;
    
    try {
      setMarkingScrap(true);
      setShowScrapDialog(false);
      
      const updates = {
        ...sector,
        status: 'sucateadoPendente',
        outcome: 'scrapped'
      };
      
      await updateSector(id, updates);
      
      // Also update directly in Supabase
      await supabase.from('sectors')
        .update({
          current_status: 'sucateadoPendente',
          current_outcome: 'scrapped',
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
        
      // Update the cycle status
      const { data: cycleData } = await supabase
        .from('cycles')
        .select('id')
        .eq('sector_id', id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
        
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
      
      toast.success("Setor marcado para sucateamento com sucesso!");
      navigate('/sucateamento');
    } catch (error) {
      console.error("Error marking sector for scrap:", error);
      toast.error("Erro ao marcar setor para sucateamento");
    } finally {
      setMarkingScrap(false);
    }
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="flex justify-center items-center h-48">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          <p className="ml-2">Carregando dados do setor...</p>
        </div>
      </PageLayout>
    );
  }

  if (!sector) {
    return (
      <PageLayout>
        <div className="text-center py-12">
          <h1 className="text-xl font-bold text-red-500">
            Setor não encontrado
          </h1>
          <Button 
            onClick={() => navigate('/execucao')} 
            className="mt-4"
            variant="outline"
          >
            Voltar para Execução
          </Button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => navigate('/execucao')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="page-title">
              Detalhes do Setor: {sector.tagNumber}
            </h1>
          </div>
          
          <div className="flex gap-2">
            <Dialog open={showScrapDialog} onOpenChange={setShowScrapDialog}>
              <DialogTrigger asChild>
                <Button variant="destructive">
                  <Trash className="mr-2 h-4 w-4" />
                  Marcar para Sucateamento
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirmar Sucateamento</DialogTitle>
                  <DialogDescription>
                    Tem certeza que deseja marcar este setor para sucateamento? 
                    Esta ação enviará o setor para validação de sucateamento.
                  </DialogDescription>
                </DialogHeader>
                <Alert variant="destructive" className="mt-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Atenção</AlertTitle>
                  <AlertDescription>
                    O setor <strong>{sector.tagNumber}</strong> será marcado como sucateado.
                    Esta ação é irreversível e requer validação posterior pela qualidade.
                  </AlertDescription>
                </Alert>
                <DialogFooter className="mt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowScrapDialog(false)}
                    disabled={markingScrap}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={handleMarkScrap}
                    disabled={markingScrap}
                  >
                    {markingScrap ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processando...
                      </>
                    ) : (
                      <>
                        <Trash className="mr-2 h-4 w-4" />
                        Confirmar Sucateamento
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
              <DialogTrigger asChild>
                <Button>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Marcar como Concluído
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirmar Conclusão</DialogTitle>
                  <DialogDescription>
                    Tem certeza que deseja marcar este setor como concluído pela produção? 
                    Esta ação enviará o setor para checagem de qualidade.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowConfirmDialog(false)}
                    disabled={updatingStatus}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleMarkComplete}
                    disabled={updatingStatus}
                  >
                    {updatingStatus ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processando...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Confirmar Conclusão
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <SectorSummary sector={sector} />
          </div>
          
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="pt-6">
                <SectorServices 
                  sector={sector} 
                  allowCompletion={true}
                  onUpdateCompletion={(serviceId, completed) => {
                    // Update service completion locally
                    const updatedServices = sector.services?.map(service => 
                      service.id === serviceId 
                        ? { ...service, completed } 
                        : service
                    ) || [];
                    
                    setSector(prev => prev ? { ...prev, services: updatedServices } : prev);
                  }}
                />
              </CardContent>
            </Card>
            
            <SectorPhotos sector={sector} />
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
