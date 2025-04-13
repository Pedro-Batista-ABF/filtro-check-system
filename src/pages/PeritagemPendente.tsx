
import React, { useEffect, useState } from "react";
import PageLayout from "@/components/layout/PageLayout";
import { useApi } from "@/contexts/ApiContextExtended";
import { Sector } from "@/types";
import SectorGrid from "@/components/sectors/SectorGrid";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus } from "lucide-react";
import { toast } from "sonner";

export default function PeritagemPendente() {
  const { sectors, loading } = useApi();
  const [pendingSectors, setPendingSectors] = useState<Sector[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Peritagem Pendente - Gestão de Recuperação";
    
    // Filtrar apenas os setores com status 'peritagemPendente'
    if (sectors && sectors.length > 0) {
      const filtered = sectors.filter(sector => sector.status === 'peritagemPendente');
      setPendingSectors(filtered);
      console.log("Setores com peritagem pendente:", filtered);
    }
  }, [sectors]);

  const handleSelectSector = (sector: Sector) => {
    navigate(`/peritagem/editar/${sector.id}`);
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
          <Button onClick={() => navigate('/peritagem/novo')}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Peritagem
          </Button>
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
            <Button 
              variant="outline" 
              onClick={() => navigate('/peritagem/novo')}
            >
              <Plus className="mr-2 h-4 w-4" />
              Criar Nova Peritagem
            </Button>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
