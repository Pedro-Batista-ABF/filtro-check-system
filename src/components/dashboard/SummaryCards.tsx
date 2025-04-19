
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

export default function SummaryCards() {
  const [peritagemCount, setPeritagemCount] = useState<number | null>(null);
  const [execucaoCount, setExecucaoCount] = useState<number | null>(null);
  const [checagemCount, setChecagemCount] = useState<number | null>(null);
  const [concluidosCount, setConcluidosCount] = useState<number | null>(null);
  const [sucateamentoCount, setSucateamentoCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCounts() {
      try {
        setLoading(true);
        // Fetch peritagem count
        const { count: peritagemCount, error: peritagemError } = await supabase
          .from('sectors')
          .select('*', { count: 'exact', head: true })
          .eq('current_status', 'peritagemPendente');
        
        if (peritagemError) throw peritagemError;
        setPeritagemCount(peritagemCount);

        // Fetch execucao count
        const { count: execucaoCount, error: execucaoError } = await supabase
          .from('sectors')
          .select('*', { count: 'exact', head: true })
          .eq('current_status', 'emExecucao');
        
        if (execucaoError) throw execucaoError;
        setExecucaoCount(execucaoCount);

        // Fetch checagem count
        const { count: checagemCount, error: checagemError } = await supabase
          .from('sectors')
          .select('*', { count: 'exact', head: true })
          .eq('current_status', 'aguardandoChecagem');
        
        if (checagemError) throw checagemError;
        setChecagemCount(checagemCount);

        // Fetch concluidos count
        const { count: concluidosCount, error: concluidosError } = await supabase
          .from('sectors')
          .select('*', { count: 'exact', head: true })
          .eq('current_status', 'concluido');
        
        if (concluidosError) throw concluidosError;
        setConcluidosCount(concluidosCount);

        // Fetch sucateamento count
        const { count: sucateamentoCount, error: sucateamentoError } = await supabase
          .from('sectors')
          .select('*', { count: 'exact', head: true })
          .eq('current_status', 'sucateadoPendente');
        
        if (sucateamentoError) throw sucateamentoError;
        setSucateamentoCount(sucateamentoCount);

      } catch (error) {
        console.error('Erro ao buscar contagens:', error);
        // Set default values on error
        setPeritagemCount(0);
        setExecucaoCount(0);
        setChecagemCount(0);
        setConcluidosCount(0);
        setSucateamentoCount(0);
      } finally {
        setLoading(false);
      }
    }

    fetchCounts();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-6 bg-gray-200 rounded w-2/3"></div>
            </CardHeader>
            <CardContent>
              <div className="h-10 bg-gray-200 rounded w-1/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            Em Peritagem
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">
            {peritagemCount !== null ? peritagemCount : '--'}
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            Em Execução
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">
            {execucaoCount !== null ? execucaoCount : '--'}
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            Aguardando Checagem
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">
            {checagemCount !== null ? checagemCount : '--'}
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            Concluídos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">
            {concluidosCount !== null ? concluidosCount : '--'}
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            Sucateamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">
            {sucateamentoCount !== null ? sucateamentoCount : '--'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
