
import PageLayout from "@/components/layout/PageLayout";
import { useApi } from "@/contexts/ApiContextExtended";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import SectorGrid from "@/components/sectors/SectorGrid";
import { useEffect } from "react";

export default function CheckagemFinal() {
  const { sectors, loading } = useApi();
  const navigate = useNavigate();
  
  // Filtra apenas os setores pendentes de checagem final
  const pendingSectors = sectors.filter(s => s.status === 'checagemFinalPendente');

  useEffect(() => {
    document.title = "Checagem Final - Gestão de Recuperação";
  }, []);

  return (
    <PageLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="page-title">Checagem Final Pendente</h1>
          <Button variant="outline" onClick={() => navigate('/checagem')}>
            Voltar
          </Button>
        </div>

        {loading ? (
          <p>Carregando setores...</p>
        ) : (
          <div>
            {pendingSectors.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Nenhum setor pendente de checagem final.</p>
              </div>
            ) : (
              <SectorGrid 
                sectors={pendingSectors}
                onSelect={(sector) => navigate(`/checagem/${sector.id}`)}
              />
            )}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
