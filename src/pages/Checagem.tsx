
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageLayoutWrapper from "@/components/layout/PageLayoutWrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useApi } from "@/contexts/ApiContextExtended";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search } from "lucide-react";
import SectorGrid from "@/components/sectors/SectorGrid";

const Checagem = () => {
  const navigate = useNavigate();
  const { sectors, loading } = useApi();
  
  // Filtrar setores com status checagemFinalPendente
  const pendingQualitySectors = sectors.filter(sector => 
    sector.status === 'checagemFinalPendente'
  );
  
  // Filtrar setores com status concluido
  const completedSectors = sectors.filter(sector => 
    sector.status === 'concluido'
  );

  useEffect(() => {
    document.title = "Checagem Final - Gestão de Recuperação";
  }, []);

  const handleSectorClick = (sector: any) => {
    navigate(`/checagem/${sector.id}`);
  };

  return (
    <PageLayoutWrapper>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Checagem Final</h1>
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por TAG..."
              className="pl-8"
            />
          </div>
        </div>

        <Tabs defaultValue="pending">
          <TabsList>
            <TabsTrigger value="pending">
              Pendentes ({pendingQualitySectors.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Concluídos ({completedSectors.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="pending" className="mt-4">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : pendingQualitySectors.length > 0 ? (
              <SectorGrid
                sectors={pendingQualitySectors}
                onSectorClick={handleSectorClick}
              />
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">Não há setores pendentes de checagem final.</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="completed" className="mt-4">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : completedSectors.length > 0 ? (
              <SectorGrid
                sectors={completedSectors}
                onSectorClick={handleSectorClick}
              />
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">Não há setores concluídos.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </PageLayoutWrapper>
  );
};

export default Checagem;
