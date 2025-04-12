
import PageLayout from "@/components/layout/PageLayout";
import { useNavigate, useParams } from "react-router-dom";
import { useApi } from "@/contexts/ApiContextExtended";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import SectorDetails from "@/components/sectors/SectorDetails";
import ProductionCompletionSwitch from "@/components/sectors/ProductionCompletionSwitch";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { Sector } from "@/types";

export default function ExecucaoDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getSectorById } = useApi();
  const [sector, setSector] = useState<Sector | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  
  // Buscar setor ao carregar o componente
  useEffect(() => {
    const fetchSector = async () => {
      if (id) {
        const sectorData = await getSectorById(id);
        setSector(sectorData);
      }
      setLoading(false);
    };
    
    fetchSector();
  }, [id, getSectorById]);

  if (loading) {
    return (
      <PageLayout>
        <div className="text-center py-12">
          <h1 className="text-xl font-semibold">Carregando...</h1>
        </div>
      </PageLayout>
    );
  }

  if (!sector) {
    return (
      <PageLayout>
        <div className="text-center py-12">
          <h1 className="text-xl font-bold text-red-500">Setor não encontrado</h1>
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
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => navigate('/execucao')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="page-title">Detalhes do Setor em Execução</h1>
        </div>
        
        {/* Production Completion Status */}
        <Card className="shadow-sm border-l-4 border-l-blue-500">
          <CardContent className="pt-6">
            <h2 className="text-lg font-medium mb-4">Status de Conclusão da Produção</h2>
            <p className="text-gray-600 mb-4">
              Ao marcar como concluído, o setor ficará disponível para a equipe de Qualidade realizar a checagem final.
            </p>
            <ProductionCompletionSwitch sector={sector} />
          </CardContent>
        </Card>
        
        <SectorDetails sector={sector} />
      </div>
    </PageLayout>
  );
}
