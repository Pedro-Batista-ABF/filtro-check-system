
import PageLayout from "@/components/layout/PageLayout";
import { useNavigate, useParams } from "react-router-dom";
import { useApi } from "@/contexts/ApiContextExtended";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import SectorDetails from "@/components/sectors/SectorDetails";
import ProductionCompletionSwitch from "@/components/sectors/ProductionCompletionSwitch";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { Sector } from "@/types";
import { supabase } from "@/integrations/supabase/client";

export default function ExecucaoDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getSectorById } = useApi();
  const [sector, setSector] = useState<Sector | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  
  // Buscar setor ao carregar o componente
  useEffect(() => {
    const fetchSector = async () => {
      if (id) {
        try {
          console.log("Buscando setor por ID:", id);
          
          // Primeiro tenta buscar via API
          const sectorData = await getSectorById(id);
          
          if (sectorData) {
            console.log("Setor encontrado via API:", sectorData);
            setSector(sectorData);
          } else {
            console.log("Setor não encontrado via API, tentando diretamente no Supabase");
            
            // Se não encontrar, tenta buscar diretamente no Supabase
            const { data: sectorRaw } = await supabase
              .from('sectors')
              .select('*')
              .eq('id', id)
              .maybeSingle();
              
            if (sectorRaw) {
              console.log("Setor encontrado diretamente:", sectorRaw);
              
              // Buscar ciclo mais recente
              const { data: cycleData } = await supabase
                .from('cycles')
                .select('*')
                .eq('sector_id', id)
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();
                
              if (cycleData) {
                // Construir um objeto Sector mínimo
                const minimalSector: Sector = {
                  id: sectorRaw.id,
                  tagNumber: sectorRaw.tag_number,
                  tagPhotoUrl: sectorRaw.tag_photo_url,
                  entryInvoice: cycleData.entry_invoice || "Pendente",
                  entryDate: cycleData.entry_date || new Date().toISOString(),
                  peritagemDate: cycleData.peritagem_date || "",
                  services: [],
                  beforePhotos: [],
                  afterPhotos: [],
                  productionCompleted: cycleData.production_completed || false,
                  status: sectorRaw.current_status as any,
                  cycleCount: sectorRaw.cycle_count || 1
                };
                
                setSector(minimalSector);
              }
            }
          }
        } catch (error) {
          console.error("Erro ao buscar setor:", error);
        }
      }
      setLoading(false);
    };
    
    fetchSector();
  }, [id, getSectorById]);

  if (loading) {
    return (
      <PageLayout>
        <div className="text-center py-12">
          <h1 className="text-xl font-semibold">Carregando...</h1>
        </div>
      </PageLayout>
    );
  }

  if (!sector) {
    return (
      <PageLayout>
        <div className="text-center py-12">
          <h1 className="text-xl font-bold text-red-500">Setor não encontrado</h1>
          <Button 
            onClick={() => navigate('/execucao')} 
            className="mt-4"
            variant="outline"
          >
            Voltar para Execução
          </Button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => navigate('/execucao')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="page-title">Detalhes do Setor em Execução</h1>
        </div>
        
        {/* Production Completion Status */}
        <Card className="shadow-sm border-l-4 border-l-blue-500">
          <CardContent className="pt-6">
            <h2 className="text-lg font-medium mb-4">Status de Conclusão da Produção</h2>
            <p className="text-gray-600 mb-4">
              Ao marcar como concluído, o setor ficará disponível para a equipe de Qualidade realizar a checagem final.
            </p>
            <ProductionCompletionSwitch sector={sector} />
          </CardContent>
        </Card>
        
        <SectorDetails sector={sector} />
      </div>
    </PageLayout>
  );
}
