
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

interface SummaryData {
  peritagem: number;
  execucao: number;
  checagem: number;
  sucateamento: number;
  concluidos: number;
  total: number;
}

export default function SummaryCards() {
  const [data, setData] = useState<SummaryData>({
    peritagem: 0,
    execucao: 0,
    checagem: 0,
    sucateamento: 0,
    concluidos: 0,
    total: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummaryData = async () => {
      try {
        setLoading(true);
        
        // Total de setores em peritagem
        const { count: peritagemCount } = await supabase
          .from('sectors')
          .select('*', { count: 'exact', head: true })
          .eq('current_status', 'peritagemPendente' as any);
          
        // Total de setores em execução
        const { count: execucaoCount } = await supabase
          .from('sectors')
          .select('*', { count: 'exact', head: true })
          .eq('current_status', 'emExecucao' as any);
          
        // Total de setores em checagem
        const { count: checagemCount } = await supabase
          .from('sectors')
          .select('*', { count: 'exact', head: true })
          .eq('current_status', 'checagemFinalPendente' as any);
          
        // Total de setores em sucateamento
        const { count: sucateamentoCount } = await supabase
          .from('sectors')
          .select('*', { count: 'exact', head: true })
          .eq('current_status', 'sucateadoPendente' as any);
          
        // Total de setores concluídos
        const { count: concluidosCount } = await supabase
          .from('sectors')
          .select('*', { count: 'exact', head: true })
          .eq('current_status', 'concluido' as any);
          
        // Total de setores
        const { count: totalCount } = await supabase
          .from('sectors')
          .select('*', { count: 'exact', head: true });
        
        setData({
          peritagem: peritagemCount || 0,
          execucao: execucaoCount || 0,
          checagem: checagemCount || 0,
          sucateamento: sucateamentoCount || 0,
          concluidos: concluidosCount || 0,
          total: totalCount || 0
        });
      } catch (error) {
        console.error('Erro ao buscar dados do resumo:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSummaryData();
  }, []);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Em Peritagem
          </CardTitle>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-muted-foreground"><path d="M14 3v4a1 1 0 0 0 1 1h4"/><path d="M5 8V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2h-5"/><circle cx="6" cy="14" r="3"/><path d="M4.5 17 9 11l2 5"/></svg>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <div className="text-2xl font-bold">{data.peritagem}</div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Em Execução
          </CardTitle>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-muted-foreground"><path d="M11 12H3"/><path d="M16 6H3"/><path d="M16 18H3"/><path d="M18 6h.01"/><path d="M18 12h.01"/><path d="M18 18h.01"/></svg>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <div className="text-2xl font-bold">{data.execucao}</div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Em Checagem
          </CardTitle>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-muted-foreground"><path d="M9 11v6"/><path d="M9 7v1.5"/><path d="M14 5h-5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7.4"/><path d="M14 2l7 2l-7 2"/></svg>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <div className="text-2xl font-bold">{data.checagem}</div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Aguardando Sucateamento
          </CardTitle>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-muted-foreground"><circle cx="12" cy="12" r="10"/><path d="m4.9 4.9 14.2 14.2"/></svg>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <div className="text-2xl font-bold">{data.sucateamento}</div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Concluídos
          </CardTitle>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-muted-foreground"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <div className="text-2xl font-bold">{data.concluidos}</div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total de Setores
          </CardTitle>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-muted-foreground"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <div className="text-2xl font-bold">{data.total}</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
