
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import FeatureCard from './FeatureCard';
import { ClipboardList, AlertTriangle, CheckCircle, Wrench, InfinityIcon } from 'lucide-react';
import { toast } from 'sonner';
import { SectorStatus } from '@/types';

export function SummaryCards() {
  const [counts, setCounts] = useState({
    peritagemPendente: 0,
    emExecucao: 0,
    execucaoConcluida: 0,
    emChecagem: 0,
    concluido: 0,
    total: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCounts() {
      try {
        setLoading(true);
        setError(null);

        // Buscar contagem de setores com status "peritagemPendente"
        const { count: peritagemCount, error: peritagemError } = await supabase
          .from('sectors')
          .select('id', { count: 'exact', head: true })
          .eq('current_status', 'peritagemPendente' as SectorStatus);

        // Buscar contagem de setores com status "emExecucao"
        const { count: execucaoCount, error: execucaoError } = await supabase
          .from('sectors')
          .select('id', { count: 'exact', head: true })
          .eq('current_status', 'emExecucao' as SectorStatus);

        // Buscar contagem de setores com status "execucaoConcluida"
        const { count: concluidaCount, error: concluidaError } = await supabase
          .from('sectors')
          .select('id', { count: 'exact', head: true })
          .eq('current_status', 'execucaoConcluida' as SectorStatus);

        // Buscar contagem de setores com status "emChecagem"
        const { count: checagemCount, error: checagemError } = await supabase
          .from('sectors')
          .select('id', { count: 'exact', head: true })
          .eq('current_status', 'emChecagem' as SectorStatus);

        // Buscar contagem de setores com status "concluido"
        const { count: concluidoCount, error: concluidoError } = await supabase
          .from('sectors')
          .select('id', { count: 'exact', head: true })
          .eq('current_status', 'concluido' as SectorStatus);

        // Buscar contagem total de setores
        const { count: totalCount, error: totalError } = await supabase
          .from('sectors')
          .select('id', { count: 'exact', head: true });

        if (peritagemError || execucaoError || concluidaError || checagemError || concluidoError || totalError) {
          throw new Error("Erro ao buscar contagens");
        }

        setCounts({
          peritagemPendente: peritagemCount || 0,
          emExecucao: execucaoCount || 0,
          execucaoConcluida: concluidaCount || 0,
          emChecagem: checagemCount || 0,
          concluido: concluidoCount || 0,
          total: totalCount || 0
        });
      } catch (err) {
        console.error("Erro ao buscar contagens:", err);
        setError("Falha ao carregar dados do dashboard");
        toast.error("Erro ao carregar dashboard", {
          description: "Não foi possível obter os dados atualizados dos setores."
        });
      } finally {
        setLoading(false);
      }
    }

    fetchCounts();
    // Recarregar a cada 5 minutos
    const interval = setInterval(fetchCounts, 300000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <FeatureCard
        title="Peritagem Pendente"
        description="Setores aguardando peritagem inicial"
        icon={<ClipboardList />}
        to="/peritagem"
        count={counts.peritagemPendente}
      />
      
      <FeatureCard
        title="Em Execução"
        description="Setores em fase de produção"
        icon={<Wrench />}
        to="/execucao"
        count={counts.emExecucao}
      />
      
      <FeatureCard
        title="Aguardando Checagem"
        description="Setores concluídos pela produção"
        icon={<AlertTriangle />}
        to="/checagem"
        count={counts.execucaoConcluida}
      />
      
      <FeatureCard
        title="Em Checagem"
        description="Setores em processo de checagem final"
        icon={<AlertTriangle />}
        to="/checagem"
        count={counts.emChecagem}
      />
      
      <FeatureCard
        title="Concluídos"
        description="Setores completamente finalizados"
        icon={<CheckCircle />}
        to="/concluidos"
        count={counts.concluido}
      />
      
      <FeatureCard
        title="Total de Setores"
        description="Todos os setores registrados no sistema"
        icon={<InfinityIcon />}
        to="/concluidos"
        count={counts.total}
      />
    </div>
  );
}
