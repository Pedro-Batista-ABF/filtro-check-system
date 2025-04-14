
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useApi } from "@/contexts/ApiContextExtended";
import PageLayout from "@/components/layout/PageLayout";
import { Sector } from "@/types";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import CheckagemFormContent from "@/components/checagem/CheckagemFormContent";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SectorSummary from "@/components/sectors/SectorSummary";
import SectorForm from "@/components/sectors/SectorForm";

export default function CheckagemForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getSectorById, updateSector } = useApi();
  const [sector, setSector] = useState<Sector | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("checagem");

  useEffect(() => {
    document.title = "Checagem Final - Gestão de Recuperação";
    
    const fetchSector = async () => {
      if (!id) {
        navigate('/checagem');
        return;
      }
      
      try {
        const sectorData = await getSectorById(id);
        
        if (!sectorData) {
          toast.error("Setor não encontrado");
          navigate('/checagem');
          return;
        }
        
        // Verifica se o setor está pronto para checagem
        if (sectorData.status !== 'checagemFinalPendente') {
          toast.error(
            "Status inválido para checagem", 
            { description: `Este setor está com status "${sectorData.status}" e não pode ser checado.` }
          );
          navigate('/checagem');
          return;
        }
        
        setSector(sectorData);
      } catch (error) {
        console.error("Erro ao carregar setor:", error);
        toast.error("Erro ao carregar dados do setor");
        navigate('/checagem');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSector();
  }, [id, getSectorById, navigate]);

  const handleSubmit = async (data: Partial<Sector>) => {
    if (!sector || !id) return;
    
    try {
      setSaving(true);
      
      // Preparar dados para atualização
      const updateData = {
        ...data,
        id: sector.id,
        status: 'concluido' as const,
        // Manter os dados originais que não foram alterados
        tagNumber: sector.tagNumber,
        entryInvoice: sector.entryInvoice,
        entryDate: sector.entryDate,
        peritagemDate: sector.peritagemDate,
        services: sector.services,
        beforePhotos: sector.beforePhotos,
        scrapPhotos: sector.scrapPhotos
      };
      
      // Atualizar o setor
      await updateSector(sector.id, updateData);
      
      toast.success("Checagem concluída com sucesso!");
      navigate('/checagem');
    } catch (error) {
      console.error("Erro ao salvar checagem:", error);
      toast.error("Erro ao salvar checagem");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="p-6 text-center">
          <h2>Carregando dados do setor...</h2>
        </div>
      </PageLayout>
    );
  }

  if (!sector) {
    return (
      <PageLayout>
        <div className="p-6 text-center">
          <h2 className="text-red-500">Setor não encontrado</h2>
          <Button 
            onClick={() => navigate('/checagem')} 
            className="mt-4"
            variant="outline"
          >
            Voltar para lista de checagem
          </Button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => navigate('/checagem')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="page-title">Checagem Final</h1>
        </div>
        
        <Tabs defaultValue="checagem" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full justify-start">
            <TabsTrigger value="checagem">Checagem</TabsTrigger>
            <TabsTrigger value="detalhes">Detalhes do Setor</TabsTrigger>
          </TabsList>
          
          <TabsContent value="checagem" className="space-y-6 mt-4">
            <Card className="border-none shadow-lg">
              <div className="p-6">
                <SectorForm 
                  sector={sector}
                  onSubmit={handleSubmit}
                  mode="checagem"
                  isLoading={saving}
                  photoRequired={true}
                />
              </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="detalhes" className="space-y-6 mt-4">
            <SectorSummary sector={sector} />
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
}
