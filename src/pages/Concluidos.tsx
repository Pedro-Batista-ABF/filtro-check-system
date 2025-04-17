
import React, { useEffect } from "react";
import PageLayout from "@/components/layout/PageLayout";
import { useApi } from "@/contexts/ApiContextExtended";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import SectorGrid from "@/components/sectors/SectorGrid";
import { ArrowLeft } from "lucide-react";

export default function Concluidos() {
  const { sectors, loading } = useApi();
  const navigate = useNavigate();
  
  // Filtra apenas os setores concluídos
  const completedSectors = sectors.filter(s => s.status === 'concluido');

  useEffect(() => {
    document.title = "Setores Concluídos - Gestão de Recuperação";
  }, []);

  return (
    <PageLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Setores Concluídos</h1>
          <Button 
            variant="outline" 
            onClick={() => navigate('/checagem')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </div>

        {loading ? (
          <p>Carregando setores...</p>
        ) : (
          <div>
            {completedSectors.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Nenhum setor concluído.</p>
              </div>
            ) : (
              <SectorGrid 
                sectors={completedSectors}
                onSelect={(sector) => navigate(`/setor/${sector.id}`)}
              />
            )}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
