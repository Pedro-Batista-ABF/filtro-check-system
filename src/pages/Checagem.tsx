
import PageLayout from "@/components/layout/PageLayout";
import { useApi } from "@/contexts/ApiContext";
import { SectorStatus } from "@/types";
import { useNavigate } from "react-router-dom";
import SectorStatusCard from "@/components/sectors/SectorStatusCard";
import { useEffect } from "react";

export default function Checagem() {
  const { sectors, loading } = useApi();
  const navigate = useNavigate();
  
  // Calculate sector counts by status
  const statusCounts: Record<SectorStatus, number> = {
    peritagemPendente: sectors.filter(s => s.status === 'peritagemPendente').length,
    emExecucao: sectors.filter(s => s.status === 'emExecucao').length,
    checagemFinalPendente: sectors.filter(s => s.status === 'checagemFinalPendente').length,
    concluido: sectors.filter(s => s.status === 'concluido').length,
    sucateado: sectors.filter(s => s.status === 'sucateado').length,
    sucateadoPendente: sectors.filter(s => s.status === 'sucateadoPendente').length
  };

  useEffect(() => {
    document.title = "Checagem - Gestão de Recuperação";
  }, []);

  return (
    <PageLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-4">
          Painel de Checagem Final
        </h1>

        {loading ? (
          <p>Carregando dados...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <SectorStatusCard
              title="Pendentes de Checagem"
              status="checagemFinalPendente"
              count={statusCounts.checagemFinalPendente}
              onClick={() => navigate('/checagem-final')}
            />

            <SectorStatusCard
              title="Concluídos"
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
          </div>
        )}
      </div>
    </PageLayout>
  );
}
