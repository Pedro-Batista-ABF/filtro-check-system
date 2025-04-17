
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageLayoutWrapper from "@/components/layout/PageLayoutWrapper";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import { useApi } from "@/contexts/api";
import SectorGrid from "@/components/sectors/SectorGrid";

export default function CheckagemFinal() {
  const navigate = useNavigate();
  const { sectors, loading } = useApi();
  
  // Filtrar setores com status checagemFinalPendente
  const pendingFinalSectors = sectors.filter(sector => 
    sector.status === 'checagemFinalPendente'
  );

  useEffect(() => {
    document.title = "Checagem Final - Gestão de Recuperação";
  }, []);

  const handleSectorSelect = (sector: any) => {
    navigate(`/checagem/${sector.id}`);
  };

  return (
    <PageLayoutWrapper>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Checagem Final Pendente</h1>
          <Button 
            variant="outline" 
            onClick={() => navigate('/checagem')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center p-12">
            <p>Carregando setores...</p>
          </div>
        ) : pendingFinalSectors.length > 0 ? (
          <SectorGrid 
            sectors={pendingFinalSectors} 
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
