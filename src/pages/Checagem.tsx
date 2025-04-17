
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageLayoutWrapper from "@/components/layout/PageLayoutWrapper";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/card";
import { AlertTriangle, Plus } from "lucide-react";
import { useApi } from "@/contexts/ApiContextExtended";
import SectorGrid from "@/components/sectors/SectorGrid";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Checagem() {
  const navigate = useNavigate();
  const { sectors, loading } = useApi();
  const [activeTab, setActiveTab] = useState("pendentes");
  
  // Filtrar setores por diferentes status
  const checagemPendente = sectors.filter(sector => sector.status === 'checagemFinalPendente');
  const concluidos = sectors.filter(sector => sector.status === 'concluido');
  
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
          <h1 className="text-2xl font-bold">Checagem Final</h1>
          <div className="flex space-x-2">
            <Button 
              onClick={() => navigate('/checagem-final')}
              variant="default"
            >
              <Plus className="mr-2 h-4 w-4" />
              Ver Pendentes
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pendentes">Pendentes ({checagemPendente.length})</TabsTrigger>
            <TabsTrigger value="concluidos">Concluídos ({concluidos.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="pendentes" className="mt-4">
            {loading ? (
              <div className="flex justify-center items-center p-12">
                <p>Carregando setores...</p>
              </div>
            ) : checagemPendente.length > 0 ? (
              <SectorGrid 
                sectors={checagemPendente} 
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
          </TabsContent>

          <TabsContent value="concluidos" className="mt-4">
            {loading ? (
              <div className="flex justify-center items-center p-12">
                <p>Carregando setores...</p>
              </div>
            ) : concluidos.length > 0 ? (
              <SectorGrid 
                sectors={concluidos} 
                onSelect={handleSectorSelect}
              />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertTriangle className="mr-2 h-5 w-5 text-yellow-500" />
                    Nenhum setor concluído
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Não há setores com checagem final concluída no momento.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </PageLayoutWrapper>
  );
}
