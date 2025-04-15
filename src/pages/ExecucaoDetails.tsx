
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageLayout from "@/components/layout/PageLayout";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApi } from "@/contexts/ApiContextExtended";
import { Sector, Service } from "@/types";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import SectorServices from "@/components/sectors/SectorServices";
import SectorSummary from "@/components/sectors/SectorSummary";
import SectorPhotos from "@/components/sectors/SectorPhotos";
import { supabase } from "@/integrations/supabase/client";

export default function ExecucaoDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getSectorById, updateSector } = useApi();
  const [sector, setSector] = useState<Sector | null>(null);
  const [loading, setLoading] = useState(true);
  const [completingProduction, setCompletingProduction] = useState(false);
  const [sucateando, setSucateando] = useState(false);
  const [activeTab, setActiveTab] = useState("services");

  useEffect(() => {
    document.title = "Detalhes de Execução - Gestão de Recuperação";
    
    const fetchSector = async () => {
      if (!id) {
        navigate('/execucao');
        return;
      }
      
      try {
        const sectorData = await getSectorById(id);
        
        if (!sectorData) {
          toast.error("Setor não encontrado");
          navigate('/execucao');
          return;
        }
        
        // Verifica se o setor está em execução
        if (sectorData.status !== 'emExecucao') {
          toast.error("Status inválido", { 
            description: `Este setor está com status "${sectorData.status}" e não é válido para execução.` 
          });
          navigate('/execucao');
          return;
        }
        
        // Garantir que todos os campos necessários estejam presentes
        if (!sectorData.scrapPhotos) {
          sectorData.scrapPhotos = [];
        }
        
        if (!sectorData.outcome) {
          sectorData.outcome = 'EmAndamento';
        }
        
        setSector(sectorData);
      } catch (error) {
        console.error("Erro ao carregar setor:", error);
        toast.error("Erro ao carregar dados do setor");
        navigate('/execucao');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSector();
  }, [id, getSectorById, navigate]);

  const handleCompleteProduction = async () => {
    if (!sector) return;
    
    try {
      setCompletingProduction(true);
      
      // Preparar os dados para atualização
      const updateData = {
        productionCompleted: true,
        status: 'checagemFinalPendente' as const
      };
      
      // Atualizar o setor
      await updateSector(sector.id, updateData);
      
      toast.success("Produção marcada como concluída!", {
        description: "Setor movido para a fila de checagem final."
      });
      
      navigate('/execucao');
    } catch (error) {
      console.error("Erro ao completar produção:", error);
      toast.error("Erro ao completar produção");
    } finally {
      setCompletingProduction(false);
    }
  };

  const handleSucateamento = async () => {
    if (!sector) return;
    
    try {
      setSucateando(true);
      
      // Atualizar status para sucateadoPendente
      await updateSector(sector.id, {
        status: 'sucateadoPendente' as const,
        outcome: 'scrapped' as const
      });
      
      // Garantir a atualização direta no Supabase
      try {
        console.log("Atualizando status para sucateadoPendente...");
        const { error } = await supabase.from('sectors')
          .update({
            current_status: 'sucateadoPendente',
            current_outcome: 'scrapped',
            updated_at: new Date().toISOString()
          })
          .eq('id', sector.id);
          
        if (error) {
          console.error("Erro ao atualizar status no Supabase:", error);
          throw error;
        }
        
        // Atualizar ciclo
        const { data: cycleData } = await supabase
          .from('cycles')
          .select('id')
          .eq('sector_id', sector.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
          
        if (cycleData) {
          const { error: cycleError } = await supabase
            .from('cycles')
            .update({
              status: 'sucateadoPendente',
              outcome: 'scrapped',
              updated_at: new Date().toISOString()
            })
            .eq('id', cycleData.id);
            
          if (cycleError) {
            console.error("Erro ao atualizar ciclo:", cycleError);
          }
        }
      } catch (dbError) {
        console.error("Erro na atualização direta:", dbError);
      }
      
      toast.success("Setor marcado para sucateamento", {
        description: "Aguardando validação do sucateamento."
      });
      
      navigate('/execucao');
    } catch (error) {
      console.error("Erro ao marcar para sucateamento:", error);
      toast.error("Erro ao marcar para sucateamento");
    } finally {
      setSucateando(false);
    }
  };
  
  const updateServiceCompletion = async (serviceId: string, completed: boolean) => {
    if (!sector) return;
    
    try {
      // Encontrar o serviço a ser atualizado
      const updatedServices = sector.services.map(service => 
        service.id === serviceId 
          ? { ...service, completed } 
          : service
      );
      
      // Atualizar o setor com os serviços atualizados
      await updateSector(sector.id, { services: updatedServices });
      
      // Atualizar também o cycleService correspondente
      const { error } = await supabase
        .from('cycle_services')
        .update({ completed })
        .match({ 
          cycle_id: sector.cycles?.[0]?.id, 
          service_id: serviceId 
        });
        
      if (error) {
        console.error("Erro ao atualizar serviço:", error);
        throw error;
      }
      
      // Atualizar o estado local
      setSector(prev => {
        if (!prev) return null;
        return {
          ...prev,
          services: updatedServices
        };
      });
      
      toast.success("Serviço atualizado");
    } catch (error) {
      console.error("Erro ao atualizar conclusão do serviço:", error);
      toast.error("Erro ao atualizar serviço");
    }
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="p-6 text-center">
          <h2>Carregando dados do setor...</h2>
        </div>
      </PageLayout>
    );
  }

  if (!sector) {
    return (
      <PageLayout>
        <div className="p-6 text-center">
          <h2 className="text-red-500">Setor não encontrado</h2>
          <Button 
            onClick={() => navigate('/execucao')} 
            className="mt-4"
            variant="outline"
          >
            Voltar para lista de execução
          </Button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => navigate('/execucao')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="page-title">
              Detalhes da Execução
            </h1>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="destructive"
              onClick={handleSucateamento}
              disabled={sucateando || completingProduction}
            >
              {sucateando ? "Processando..." : "Marcar para Sucateamento"}
            </Button>
            
            <Button 
              onClick={handleCompleteProduction}
              disabled={completingProduction || sucateando}
            >
              {completingProduction ? "Processando..." : "Concluir Produção"}
            </Button>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500">TAG</p>
              <p className="font-medium">{sector.tagNumber}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">NF Entrada</p>
              <p className="font-medium">{sector.entryInvoice}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Data Entrada</p>
              <p className="font-medium">{sector.entryDate}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Data Peritagem</p>
              <p className="font-medium">{sector.peritagemDate}</p>
            </div>
          </div>
        </div>
        
        <Tabs defaultValue="services" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full justify-start">
            <TabsTrigger value="services">Serviços</TabsTrigger>
            <TabsTrigger value="photos">Fotos</TabsTrigger>
            <TabsTrigger value="details">Detalhes</TabsTrigger>
          </TabsList>
          
          <TabsContent value="services" className="mt-4">
            <SectorServices 
              sector={sector} 
              allowCompletion={true}
              onUpdateCompletion={updateServiceCompletion}
            />
          </TabsContent>
          
          <TabsContent value="photos" className="mt-4">
            <SectorPhotos sector={sector} />
          </TabsContent>
          
          <TabsContent value="details" className="mt-4">
            <SectorSummary sector={sector} />
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
}
