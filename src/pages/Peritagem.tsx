
import PageLayout from "@/components/layout/PageLayout";
import { useNavigate } from "react-router-dom";
import { useApi } from "@/contexts/ApiContextExtended";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import SectorStatusCard from "@/components/sectors/SectorStatusCard";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function Peritagem() {
  const navigate = useNavigate();
  const { sectors, isLoading, refreshData } = useApi();
  const [hasRefreshed, setHasRefreshed] = useState(false);
  
  // Calculate sector counts by status
  const statusCounts = {
    peritagemPendente: sectors.filter(s => s.status === 'peritagemPendente').length,
    emExecucao: sectors.filter(s => s.status === 'emExecucao').length,
    checagemFinalPendente: sectors.filter(s => s.status === 'checagemFinalPendente').length,
    concluido: sectors.filter(s => s.status === 'concluido').length,
    sucateado: sectors.filter(s => s.status === 'sucateado').length,
    sucateadoPendente: sectors.filter(s => s.status === 'sucateadoPendente').length
  };

  useEffect(() => {
    document.title = "Peritagem - Gestão de Recuperação";
    
    // Force data refresh on first load
    if (!hasRefreshed) {
      refreshData().then(() => {
        setHasRefreshed(true);
        
        // Mostrar diagnóstico de dados
        console.log("Dados de setores na tela Peritagem:", sectors);
        console.log("Contagem de setores por status:", statusCounts);
        
        // Verificar se há setores com status sucateadoPendente
        const pendingScraps = sectors.filter(s => s.status === 'sucateadoPendente');
        if (pendingScraps.length > 0) {
          console.log("Setores aguardando validação de sucateamento:", pendingScraps);
        }
      });
    }
  }, [sectors, refreshData, hasRefreshed, statusCounts]);

  const handleDiagnostic = () => {
    const statusBreakdown = Object.entries(statusCounts)
      .map(([status, count]) => `${status}: ${count}`)
      .join(', ');
      
    toast.info("Diagnóstico de Setores", {
      description: `Total: ${sectors.length} setores. ${statusBreakdown}`
    });
  };

  return (
    <PageLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="page-title">Peritagem</h1>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleDiagnostic}>
              Diagnóstico
            </Button>
            <Button onClick={() => navigate('/peritagem/novo')}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Peritagem
            </Button>
          </div>
        </div>

        {isLoading ? (
          <p>Carregando setores...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <SectorStatusCard
              title="Peritagem Pendente"
              status="peritagemPendente"
              count={statusCounts.peritagemPendente}
              onClick={() => navigate('/peritagem/pendente')}
            />
            
            <SectorStatusCard
              title="Em Execução"
              status="emExecucao"
              count={statusCounts.emExecucao}
              onClick={() => navigate('/execucao')}
            />
            
            <SectorStatusCard
              title="Checagem Final Pendente"
              status="checagemFinalPendente"
              count={statusCounts.checagemFinalPendente}
              onClick={() => navigate('/checagem')}
            />
            
            <SectorStatusCard
              title="Concluído"
              status="concluido"
              count={statusCounts.concluido}
              onClick={() => navigate('/concluidos')}
            />
            
            <SectorStatusCard
              title="Sucateamento Pendente"
              status="sucateadoPendente"
              count={statusCounts.sucateadoPendente}
              onClick={() => navigate('/sucateamento')}
            />
            
            <SectorStatusCard
              title="Sucateados"
              status="sucateado"
              count={statusCounts.sucateado}
              onClick={() => navigate('/sucateamento?filtro=sucateados')}
            />
          </div>
        )}
      </div>
    </PageLayout>
  );
}
