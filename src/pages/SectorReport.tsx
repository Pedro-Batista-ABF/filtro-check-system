
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageLayout from "@/components/layout/PageLayout";
import { Sector, Photo, Cycle } from "@/types";
import { useApi } from "@/contexts/ApiContextExtended";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Printer } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ReportHeader from "@/components/reports/ReportHeader";
import ServicePhotosList from "@/components/reports/ServicePhotosList";
import ServiceChecklist from "@/components/reports/ServiceChecklist";

interface PhotoWithMetadata extends Photo {
  created_at?: string;
}

export default function SectorReport() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getSectorById } = useApi();
  const [sector, setSector] = useState<Sector | null>(null);
  const [loading, setLoading] = useState(true);
  const [photos, setPhotos] = useState<PhotoWithMetadata[]>([]);
  const [cycle, setCycle] = useState<Cycle | null>(null);

  useEffect(() => {
    document.title = "Relatório do Setor - Gestão de Recuperação";
    
    const fetchSectorData = async () => {
      if (!id) {
        navigate('/concluidos');
        return;
      }

      try {
        const sectorData = await getSectorById(id);
        
        if (!sectorData) {
          toast.error("Setor não encontrado");
          navigate('/concluidos');
          return;
        }
        
        setSector(sectorData);
        
        // Buscar o ciclo atual
        const { data: cycleData, error: cycleError } = await supabase
          .from('cycles')
          .select('*')
          .eq('sector_id', id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
          
        if (cycleError || !cycleData) {
          console.error("Erro ao buscar ciclo:", cycleError);
        } else {
          setCycle(cycleData as Cycle);
        }

        // Buscar todas as fotos com metadados
        const { data: photosData, error: photosError } = await supabase
          .from('photos')
          .select('*')
          .in('type', ['before', 'after', 'tag'])
          .eq('cycle_id', cycleData?.id)
          .order('created_at', { ascending: true });
          
        if (photosError) {
          console.error("Erro ao buscar fotos:", photosError);
        } else {
          // Mapear e ordenar as fotos
          const sortedPhotos = photosData?.map(photo => ({
            id: photo.id,
            url: photo.url,
            type: photo.type as "before" | "after" | "service" | "tag" | "scrap",
            serviceId: photo.service_id || undefined,
            metadata: photo.metadata,
            created_at: photo.created_at
          })) || [];
          
          setPhotos(sortedPhotos);
        }
      } catch (error) {
        console.error("Erro ao buscar dados do setor:", error);
        toast.error("Erro ao carregar relatório");
        navigate('/concluidos');
      } finally {
        setLoading(false);
      }
    };

    fetchSectorData();
  }, [id, getSectorById, navigate]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="p-6 text-center">
          <p>Carregando relatório...</p>
        </div>
      </PageLayout>
    );
  }

  if (!sector) {
    return (
      <PageLayout>
        <div className="p-6 text-center">
          <p className="text-red-500">Setor não encontrado</p>
          <Button 
            variant="outline" 
            onClick={() => navigate('/concluidos')}
            className="mt-4"
          >
            Voltar
          </Button>
        </div>
      </PageLayout>
    );
  }

  // Preparar o ciclo para uso no componente
  const currentCycle: Cycle = cycle || {
    id: "",
    sector_id: sector.id,
    tag_number: sector.tagNumber,
    entry_invoice: sector.entryInvoice,
    entry_date: sector.entryDate,
    peritagem_date: sector.peritagemDate,
    production_completed: sector.productionCompleted,
    status: sector.status,
    outcome: sector.outcome,
    scrap_validated: false,
    created_at: ""
  };

  return (
    <PageLayout>
      <div className="space-y-6 report-page">
        <div className="flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => navigate('/concluidos')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="page-title">
              Relatório do Setor
            </h1>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Imprimir
            </Button>
            {/* Botão para download do PDF será implementado no futuro */}
            <Button variant="outline" disabled>
              <Download className="h-4 w-4 mr-2" />
              PDF
            </Button>
          </div>
        </div>
        
        <div className="report-content">
          <ReportHeader sector={sector} cycle={currentCycle} />
          
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Serviços Executados</CardTitle>
              </CardHeader>
              <CardContent>
                <ServiceChecklist services={sector.services} />
              </CardContent>
            </Card>
          </div>
          
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Comparativo de Fotos</CardTitle>
              </CardHeader>
              <CardContent>
                <ServicePhotosList 
                  services={sector.services} 
                  photos={photos}
                />
              </CardContent>
            </Card>
          </div>
          
          <div className="mt-8 print:mt-16 print:pt-16">
            <div className="grid grid-cols-2 gap-8 print:gap-16">
              <div className="text-center">
                <div className="border-t-2 border-black pt-2">
                  <p className="font-bold">Aprovação Cliente</p>
                  <p className="text-sm mt-1">Data: ___/___/______</p>
                </div>
              </div>
              
              <div className="text-center">
                <div className="border-t-2 border-black pt-2">
                  <p className="font-bold">Responsável Técnico</p>
                  <p className="text-sm mt-1">Data: {format(new Date(), 'dd/MM/yyyy')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
