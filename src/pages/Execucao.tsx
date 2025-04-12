
import PageLayout from "@/components/layout/PageLayout";
import { useApi } from "@/contexts/ApiContextExtended";
import { SectorStatus } from "@/types";
import { Link } from "react-router-dom";
import SectorStatusCard from "@/components/sectors/SectorStatusCard";
import { useNavigate } from "react-router-dom";

export default function Execucao() {
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

  return (
    <PageLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-4">Execução</h1>
        
        {loading ? (
          <p>Carregando setores...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sectors
              .filter(sector => sector.status === 'emExecucao')
              .map(sector => (
                <div key={sector.id} className="bg-white rounded-lg shadow-md p-4">
                  <h2 className="text-lg font-semibold mb-2">{sector.tagNumber}</h2>
                  <p className="text-gray-600">Nota Fiscal: {sector.entryInvoice}</p>
                  <p className="text-gray-600">Data de Entrada: {sector.entryDate}</p>
                  <Link to={`/execucao/${sector.id}`} className="inline-block mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    Ver Detalhes
                  </Link>
                </div>
              ))}
          </div>
        )}
        
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-2">Status dos Setores</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
            <SectorStatusCard
              title="Peritagem Pendente"
              status="peritagemPendente"
              count={statusCounts.peritagemPendente}
              onClick={() => navigate('/peritagem')}
            />
            
            <SectorStatusCard
              title="Checagem Pendente"
              status="checagemFinalPendente"
              count={statusCounts.checagemFinalPendente}
              onClick={() => navigate('/checagem')}
            />
            
            <SectorStatusCard
              title="Sucateamento Pendente"
              status="sucateadoPendente"
              count={statusCounts.sucateadoPendente}
              onClick={() => navigate('/sucateamento')}
            />
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
