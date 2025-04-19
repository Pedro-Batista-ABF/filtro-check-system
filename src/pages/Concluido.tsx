
import React, { useState, useEffect } from "react";
import { Sector } from "@/types";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import SectorGrid from "@/components/sectors/SectorGrid";
import { useApi } from "@/contexts/ApiContextExtended";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export default function Concluido() {
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState(true);
  const { getSectorsByStatus } = useApi();

  useEffect(() => {
    async function fetchSectors() {
      try {
        setLoading(true);
        
        // Try to use the API context function first
        if (getSectorsByStatus) {
          const sectorsData = await getSectorsByStatus("concluido");
          setSectors(sectorsData || []);
        } else {
          // Fallback to direct Supabase query
          const { data, error } = await supabase
            .from('sectors')
            .select('*')
            .eq('current_status', 'concluido');
            
          if (error) throw error;
          setSectors(data || []);
        }
      } catch (error) {
        console.error("Erro ao buscar setores concluídos:", error);
        toast.error("Falha ao carregar setores");
      } finally {
        setLoading(false);
      }
    }

    fetchSectors();
  }, [getSectorsByStatus]);

  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Setores Concluídos</h1>
        
        {loading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : sectors.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">Nenhum setor concluído</p>
          </Card>
        ) : (
          <SectorGrid 
            sectors={sectors} 
            onSectorClick={(sector) => console.log("Setor clicado:", sector.id)}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
