
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Clipboard, ClipboardCheck, AlertTriangle, CheckCircle } from 'lucide-react';
import FeatureCard from './FeatureCard';
import { Skeleton } from '@/components/ui/skeleton';

interface CountResult {
  count: number;
}

export default function SummaryCards() {
  const [summaryData, setSummaryData] = useState({
    peritagem: 0,
    execucao: 0,
    checagem: 0,
    sucateamento: 0,
    concluidos: 0
  });

  const { data: countData, isLoading, error } = useQuery({
    queryKey: ['sectorCounts'],
    queryFn: async () => {
      // Peritagems pendentes
      const { data: peritagemData, error: peritagemError } = await supabase
        .from('sectors')
        .select('id', { count: 'exact', head: true })
        .eq('current_status', 'peritagemPendente');
      
      // Setores em execução
      const { data: execucaoData, error: execucaoError } = await supabase
        .from('sectors')
        .select('id', { count: 'exact', head: true })
        .eq('current_status', 'emExecucao');
      
      // Setores pendentes de checagem
      const { data: checagemData, error: checagemError } = await supabase
        .from('sectors')
        .select('id', { count: 'exact', head: true })
        .eq('current_status', 'checagemFinalPendente');
      
      // Setores para sucateamento
      const { data: sucateamentoData, error: sucateamentoError } = await supabase
        .from('sectors')
        .select('id', { count: 'exact', head: true })
        .eq('current_status', 'sucateadoPendente');
      
      // Setores concluídos
      const { data: concluidosData, error: concluidosError } = await supabase
        .from('sectors')
        .select('id', { count: 'exact', head: true })
        .eq('current_status', 'concluido');
      
      if (peritagemError || execucaoError || checagemError || sucateamentoError || concluidosError) {
        throw new Error('Erro ao buscar dados');
      }
      
      return {
        peritagem: peritagemData?.count || 0,
        execucao: execucaoData?.count || 0,
        checagem: checagemData?.count || 0,
        sucateamento: sucateamentoData?.count || 0,
        concluidos: concluidosData?.count || 0
      };
    },
    refetchInterval: 30000 // Atualiza a cada 30 segundos
  });
  
  useEffect(() => {
    if (countData) {
      setSummaryData(countData);
    }
  }, [countData]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-32">
            <Skeleton className="h-full w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md text-red-600">
        <p className="font-medium">Erro ao carregar resumo</p>
        <p className="text-sm">Tente recarregar a página</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <FeatureCard
        title="Peritagias"
        description="Setores aguardando análise inicial"
        icon={<Clipboard />}
        to="/peritagem"
        count={summaryData.peritagem}
      />
      
      <FeatureCard
        title="Em Execução"
        description="Setores em processo de recuperação"
        icon={<ClipboardCheck />}
        to="/execucao"
        count={summaryData.execucao}
      />
      
      <FeatureCard
        title="Checagem Final"
        description="Setores aguardando verificação"
        icon={<CheckCircle />}
        to="/checagem-final"
        count={summaryData.checagem}
      />
      
      <FeatureCard
        title="Sucateamento"
        description="Setores com solicitação de sucateamento"
        icon={<AlertTriangle />}
        to="/sucateamento"
        count={summaryData.sucateamento}
      />
      
      <FeatureCard
        title="Concluídos"
        description="Setores com processo finalizado"
        icon={<CheckCircle />}
        to="/concluidos"
        count={summaryData.concluidos}
      />
    </div>
  );
}
