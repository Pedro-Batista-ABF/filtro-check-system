
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function SummaryCards() {
  const navigate = useNavigate();
  const [emPeritagem, setEmPeritagem] = useState<number | null>(null);
  const [emExecucao, setEmExecucao] = useState<number | null>(null);
  const [emChecagem, setEmChecagem] = useState<number | null>(null);
  const [concluidos, setConcluidos] = useState<number | null>(null);
  const [sucateados, setSucateados] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCounts() {
      try {
        setLoading(true);
        
        // Buscar contadores por status usando is()
        // Peritagem
        const { count: peritagemCount, error: peritagemError } = await supabase
          .from('sectors')
          .select('*', { count: 'exact', head: true })
          .eq('current_status', 'peritagemPendente');
          
        if (peritagemError) throw peritagemError;
        setEmPeritagem(peritagemCount || 0);
        
        // Execução
        const { count: execucaoCount, error: execucaoError } = await supabase
          .from('sectors')
          .select('*', { count: 'exact', head: true })
          .eq('current_status', 'emExecucao');
          
        if (execucaoError) throw execucaoError;
        setEmExecucao(execucaoCount || 0);
        
        // Checagem
        const { count: checagemCount, error: checagemError } = await supabase
          .from('sectors')
          .select('*', { count: 'exact', head: true })
          .eq('current_status', 'emChecagem');
          
        if (checagemError) throw checagemError;
        setEmChecagem(checagemCount || 0);
        
        // Concluídos
        const { count: concluidosCount, error: concluidosError } = await supabase
          .from('sectors')
          .select('*', { count: 'exact', head: true })
          .eq('current_status', 'concluido');
          
        if (concluidosError) throw concluidosError;
        setConcluidos(concluidosCount || 0);
        
        // Sucateados
        const { count: sucateadosCount, error: sucateadosError } = await supabase
          .from('sectors')
          .select('*', { count: 'exact', head: true })
          .eq('current_status', 'sucateado');
          
        if (sucateadosError) throw sucateadosError;
        setSucateados(sucateadosCount || 0);
      } catch (error) {
        console.error("Erro ao buscar contadores:", error);
        toast.error("Erro ao carregar indicadores");
      } finally {
        setLoading(false);
      }
    }
    
    fetchCounts();
  }, []);

  const cards = [
    {
      title: "Em Peritagem",
      count: emPeritagem,
      link: "/peritagem",
      color: "bg-blue-50 text-blue-600"
    },
    {
      title: "Em Execução",
      count: emExecucao,
      link: "/execucao",
      color: "bg-orange-50 text-orange-600"
    },
    {
      title: "Em Checagem",
      count: emChecagem,
      link: "/checagem",
      color: "bg-purple-50 text-purple-600"
    },
    {
      title: "Concluídos",
      count: concluidos,
      link: "/concluidos",
      color: "bg-green-50 text-green-600"
    },
    {
      title: "Sucateados",
      count: sucateados,
      link: "/sucateamento",
      color: "bg-red-50 text-red-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5 gap-4">
      {cards.map((card) => (
        <Card key={card.title} className={`${card.color} border-none shadow-sm`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold">{card.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="text-3xl font-bold">
                {loading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  card.count === null ? "--" : card.count
                )}
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate(card.link)}
                className="text-sm font-medium"
              >
                Ver <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
