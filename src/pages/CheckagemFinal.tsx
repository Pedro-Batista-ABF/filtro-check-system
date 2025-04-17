
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageLayoutWrapper from "@/components/layout/PageLayoutWrapper";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import { useApi } from "@/contexts/ApiContextExtended";
import SectorGrid from "@/components/sectors/SectorGrid";
import { Sector } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function CheckagemFinal() {
  const navigate = useNavigate();
  const { sectors, loading, refreshData } = useApi();
  const [localSectors, setLocalSectors] = useState<Sector[]>([]);
  const [localLoading, setLocalLoading] = useState(true);
  
  useEffect(() => {
    document.title = "Checagem Final - Gestão de Recuperação";
    
    // Buscar dados diretamente do Supabase para garantir dados atualizados
    const fetchSectorsDirectly = async () => {
      try {
        setLocalLoading(true);
        
        const { data: sectorsData, error: sectorsError } = await supabase
          .from('sectors')
          .select('*')
          .eq('current_status', 'checagemFinalPendente');
          
        if (sectorsError) {
          console.error("Erro ao buscar setores:", sectorsError);
          toast.error("Falha ao carregar setores para checagem");
          setLocalLoading(false);
          return;
        }
        
        // Se encontrou dados, converte para o formato Sector
        if (sectorsData && sectorsData.length > 0) {
          console.log(`Encontrados ${sectorsData.length} setores pendentes de checagem`);
          
          const mappedSectors: Sector[] = sectorsData.map(sector => ({
            id: sector.id,
            tagNumber: sector.tag_number || "",
            tagPhotoUrl: sector.tag_photo_url || undefined,
            entryInvoice: sector.nf_entrada || "",
            entryDate: sector.data_entrada ? new Date(sector.data_entrada).toISOString().split('T')[0] : "",
            status: 'checagemFinalPendente',
            services: [],
            cycleCount: sector.cycle_count || 1,
            updated_at: sector.updated_at
          }));
          
          setLocalSectors(mappedSectors);
        } else {
          console.log("Nenhum setor pendente de checagem final encontrado");
          setLocalSectors([]);
        }
      } catch (err) {
        console.error("Erro na busca direta de setores:", err);
      } finally {
        setLocalLoading(false);
      }
    };
    
    fetchSectorsDirectly();
    refreshData(); // Também atualiza os dados via contexto
  }, [refreshData]);
  
  // Filtrar setores com status checagemFinalPendente do contexto
  useEffect(() => {
    if (!loading && sectors && sectors.length > 0) {
      // Se já temos dados do contexto, combinar com os dados diretos
      const pendingFinalSectors = sectors.filter(sector => 
        sector.status === 'checagemFinalPendente'
      );
      
      if (pendingFinalSectors.length > 0) {
        console.log(`Encontrados ${pendingFinalSectors.length} setores pendentes via contexto`);
        
        // Combinar com dados locais, evitando duplicatas por ID
        const existingIds = new Set(localSectors.map(s => s.id));
        const newSectors = pendingFinalSectors.filter(s => !existingIds.has(s.id));
        
        if (newSectors.length > 0) {
          setLocalSectors(prev => [...prev, ...newSectors]);
        }
      }
    }
  }, [sectors, loading, localSectors]);

  const handleSectorSelect = (sector: Sector) => {
    navigate(`/checagem/${sector.id}`);
  };

  const handleRefresh = async () => {
    setLocalLoading(true);
    await refreshData();
    
    try {
      const { data: sectorsData, error: sectorsError } = await supabase
        .from('sectors')
        .select('*')
        .eq('current_status', 'checagemFinalPendente');
        
      if (sectorsError) throw sectorsError;
      
      if (sectorsData) {
        const mappedSectors: Sector[] = sectorsData.map(sector => ({
          id: sector.id,
          tagNumber: sector.tag_number || "",
          tagPhotoUrl: sector.tag_photo_url || undefined,
          entryInvoice: sector.nf_entrada || "",
          entryDate: sector.data_entrada ? new Date(sector.data_entrada).toISOString().split('T')[0] : "",
          status: 'checagemFinalPendente',
          services: [],
          cycleCount: sector.cycle_count || 1,
          updated_at: sector.updated_at
        }));
        
        setLocalSectors(mappedSectors);
        toast.success("Dados atualizados com sucesso");
      }
    } catch (err) {
      console.error("Erro ao atualizar dados:", err);
      toast.error("Falha ao recarregar dados");
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <PageLayoutWrapper>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Checagem Final Pendente</h1>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleRefresh}
              disabled={localLoading}
            >
              {localLoading ? "Atualizando..." : "Atualizar"}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/checagem')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
          </div>
        </div>

        {localLoading ? (
          <div className="flex justify-center items-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : localSectors.length > 0 ? (
          <SectorGrid 
            sectors={localSectors} 
            onSelect={handleSectorSelect}
          />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="mr-2 h-5 w-5 text-yellow-500" />
                Nenhum setor pendente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Não há setores pendentes de checagem final. Todos os setores já foram processados ou estão em outras etapas do fluxo.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </PageLayoutWrapper>
  );
}
