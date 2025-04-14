
import PageLayout from "@/components/layout/PageLayout";
import { useApi } from "@/contexts/ApiContextExtended";
import { SectorStatus } from "@/types";
import { Link } from "react-router-dom";
import SectorStatusCard from "@/components/sectors/SectorStatusCard";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function Execucao() {
  const { sectors, loading, refreshData } = useApi();
  const navigate = useNavigate();
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Forçar atualização dos dados ao carregar a página
  useEffect(() => {
    const fetchData = async () => {
      setIsRefreshing(true);
      try {
        await refreshData();
        
        // Verificar setores diretamente no Supabase para diagnóstico
        const { data: dbSectors, error } = await supabase
          .from('sectors')
          .select('id, tag_number, current_status')
          .eq('current_status', 'emExecucao');
          
        if (error) {
          console.error("Erro ao buscar setores do banco:", error);
        } else {
          console.log("Setores em execução encontrados diretamente no banco:", dbSectors?.length);
          console.log("Dados dos setores:", dbSectors);
        }
      } catch (error) {
        console.error("Erro ao atualizar dados:", error);
      } finally {
        setIsRefreshing(false);
      }
    };
    
    fetchData();
  }, [refreshData]);
  
  // Filtra apenas setores em execução
  const sectorsInExecution = sectors.filter(sector => 
    sector.status === 'emExecucao'
  );
  
  console.log("Total de setores carregados:", sectors.length);
  console.log("Setores em execução:", sectorsInExecution.length);
  console.log("Status dos setores:", sectors.map(s => s.status));
  
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
        
        {loading || isRefreshing ? (
          <p>Carregando setores...</p>
        ) : sectorsInExecution.length === 0 ? (
          <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200 mb-6">
            <h3 className="font-medium text-yellow-800">Nenhum setor em execução</h3>
            <p className="text-yellow-700 mt-1">
              Não há setores em fase de execução no momento. Verifique a seção de Peritagem 
              para cadastrar novos setores ou finalizar peritagems pendentes.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sectorsInExecution.map(sector => (
              <div key={sector.id} className="bg-white rounded-lg shadow-md p-4">
                <h2 className="text-lg font-semibold mb-2">{sector.tagNumber}</h2>
                <p className="text-gray-600">Nota Fiscal: {sector.entryInvoice}</p>
                <p className="text-gray-600">Data de Entrada: {
                  sector.entryDate ? new Date(sector.entryDate).toLocaleDateString() : 'N/A'
                }</p>
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
