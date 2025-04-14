
import React, { useEffect, useState } from "react";
import PageLayout from "@/components/layout/PageLayout";
import { useApi } from "@/contexts/ApiContextExtended";
import { Sector } from "@/types";
import SectorGrid from "@/components/sectors/SectorGrid";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export default function PeritagemPendente() {
  const { sectors, loading, refreshData } = useApi();
  const [pendingSectors, setPendingSectors] = useState<Sector[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const navigate = useNavigate();

  // Função para recarregar os dados
  const handleRefresh = async () => {
    toast.info("Recarregando dados...");
    try {
      // Usar a função de atualização do contexto API
      await refreshData(); 
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error("Erro ao atualizar dados:", error);
      toast.error("Erro ao atualizar dados");
    }
  };

  useEffect(() => {
    document.title = "Peritagem Pendente - Gestão de Recuperação";
    
    // Filtrar apenas os setores com status 'peritagemPendente'
    if (sectors && sectors.length > 0) {
      console.log("Total de setores carregados:", sectors.length);
      console.log("Status dos setores:", sectors.map(s => ({ 
        id: s.id, 
        tag: s.tagNumber, 
        status: s.status,
        outcome: s.outcome
      })));
      
      const filtered = sectors.filter(sector => {
        const isPending = sector.status === 'peritagemPendente';
        console.log(`Setor ${sector.tagNumber} (${sector.id}): status=${sector.status}, isPending=${isPending}`);
        return isPending;
      });
      
      setPendingSectors(filtered);
      console.log("Setores com peritagem pendente:", filtered.length);
      
      if (filtered.length === 0 && sectors.length > 0) {
        console.log("Nenhum setor com status 'peritagemPendente' encontrado entre os setores carregados");
      }
    } else {
      console.log("Nenhum setor carregado ou array vazio");
    }
  }, [sectors, refreshKey]);

  const handleSelectSector = (sector: Sector) => {
    console.log("Selecionando setor para edição:", sector);
    if (sector && sector.id) {
      navigate(`/peritagem/editar/${sector.id}`);
    } else {
      toast.error("Erro ao selecionar setor", {
        description: "Dados do setor incompletos."
      });
    }
  };

  return (
    <PageLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => navigate('/peritagem')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="page-title">Peritagem Pendente</h1>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={handleRefresh} 
              className="mr-2"
              disabled={loading}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
            <Button onClick={() => navigate('/peritagem/novo')}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Peritagem
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <p className="text-gray-500">Carregando setores...</p>
          </div>
        ) : pendingSectors.length > 0 ? (
          <SectorGrid 
            sectors={pendingSectors} 
            onSelect={handleSelectSector} 
          />
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[300px] bg-gray-50 rounded-lg p-8">
            <p className="text-gray-500 mb-4 text-center">
              Não há setores com peritagem pendente.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button 
                variant="outline" 
                onClick={handleRefresh}
                className="mb-2 sm:mb-0"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Atualizar Lista
              </Button>
              <Button 
                onClick={() => navigate('/peritagem/novo')}
              >
                <Plus className="mr-2 h-4 w-4" />
                Criar Nova Peritagem
              </Button>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
