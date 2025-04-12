import PageLayout from "@/components/layout/PageLayout";
import { useApi } from "@/contexts/ApiContext";
import { SectorStatus } from "@/types";
import { Link } from "react-router-dom";

export default function Checagem() {
  const { sectors, loading } = useApi();
  
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
        <h1 className="text-2xl font-bold mb-4">
          Painel de Checagem Final
        </h1>

        {loading ? (
          <p>Carregando dados...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white shadow rounded-md p-4">
              <h2 className="text-lg font-semibold mb-2">
                Pendentes de Checagem Final
              </h2>
              <p className="text-gray-600">
                Número de setores: {statusCounts.checagemFinalPendente}
              </p>
              <Link to="/checagem-final" className="text-blue-500 hover:underline block mt-2">
                Ver setores
              </Link>
            </div>

            <div className="bg-white shadow rounded-md p-4">
              <h2 className="text-lg font-semibold mb-2">Concluídos</h2>
              <p className="text-gray-600">
                Número de setores: {statusCounts.concluido}
              </p>
            </div>

            <div className="bg-white shadow rounded-md p-4">
              <h2 className="text-lg font-semibold mb-2">
                Status dos Setores
              </h2>
              <ul className="list-disc list-inside text-gray-600">
                <li>Peritagem Pendente: {statusCounts.peritagemPendente}</li>
                <li>Em Execução: {statusCounts.emExecucao}</li>
                <li>Sucateado Pendente: {statusCounts.sucateadoPendente}</li>
                <li>Sucateado: {statusCounts.sucateado}</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
