
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useApi } from "@/contexts/ApiContextExtended";
import { Sector, PhotoWithFile } from "@/types";
import PageLayoutWrapper from "@/components/layout/PageLayoutWrapper";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import SectorSummary from "@/components/sectors/SectorSummary";
import PhotoUpload from "@/components/sectors/PhotoUpload";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";

export default function ScrapValidationForm() {
  const { id } = useParams<{ id: string }>();
  const [sector, setSector] = useState<Sector | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [scrapPhotos, setScrapPhotos] = useState<PhotoWithFile[]>([]);
  const [scrapObservations, setScrapObservations] = useState("");
  const [scrapInvoice, setScrapInvoice] = useState("");
  const [returnDate, setReturnDate] = useState(new Date().toISOString().split('T')[0]);
  const { getSectorById, updateSector, uploadPhoto } = useApi();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Validação de Sucateamento - Gestão de Recuperação";
    
    const loadSector = async () => {
      try {
        if (!id) return;
        
        setLoading(true);
        const sectorData = await getSectorById(id);
        
        if (!sectorData) {
          toast.error("Setor não encontrado");
          navigate("/sucateamento");
          return;
        }
        
        // Verificar se o setor está em status sucateadoPendente
        if (sectorData.status !== "sucateadoPendente") {
          toast.error("Este setor não está aguardando validação de sucateamento");
          navigate("/sucateamento");
          return;
        }
        
        setSector(sectorData);
        
        // Inicializar os campos
        setScrapObservations(sectorData.scrapObservations || "");
        setScrapInvoice(sectorData.exitInvoice || "");
        setScrapPhotos(
          (sectorData.scrapPhotos || []).map(photo => ({
            ...photo,
            file: null
          }))
        );
      } catch (error) {
        console.error("Erro ao carregar setor:", error);
        toast.error("Erro ao carregar dados do setor");
      } finally {
        setLoading(false);
      }
    };
    
    loadSector();
  }, [id, getSectorById, navigate]);

  const handlePhotoUpload = (files: FileList) => {
    const newPhotos: PhotoWithFile[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      newPhotos.push({
        id: `temp-scrap-${Date.now()}-${i}`,
        url: "",
        type: "scrap",
        file
      });
    }
    
    setScrapPhotos(prev => [...prev, ...newPhotos]);
  };

  const handleValidateScrap = async () => {
    try {
      if (!sector) return;
      
      if (!scrapObservations.trim()) {
        toast.error("As observações de sucateamento são obrigatórias");
        return;
      }
      
      if (!scrapInvoice.trim()) {
        toast.error("A nota fiscal de devolução é obrigatória");
        return;
      }
      
      setIsSaving(true);
      
      // Upload de novas fotos
      const photosToUpload = scrapPhotos.filter(photo => photo.file);
      const uploadedPhotos = [];
      
      for (const photo of photosToUpload) {
        if (photo.file) {
          try {
            const photoUrl = await uploadPhoto(photo.file, "scrap");
            uploadedPhotos.push({
              id: photo.id,
              url: photoUrl,
              type: "scrap" as const
            });
            
            // Adicionar à tabela photos
            try {
              const { data: { user } } = await supabase.auth.getUser();
              
              if (user) {
                // Buscar o ciclo atual
                const { data: cycleData } = await supabase
                  .from("cycles")
                  .select("id")
                  .eq("sector_id", sector.id)
                  .order("created_at", { ascending: false })
                  .limit(1)
                  .single();
                  
                if (cycleData) {
                  await supabase.from("photos").insert({
                    cycle_id: cycleData.id,
                    service_id: null,
                    url: photoUrl,
                    type: "scrap",
                    created_by: user.id,
                    metadata: {
                      sector_id: sector.id,
                      stage: "sucateamento",
                      type: "scrap"
                    }
                  });
                }
              }
            } catch (directError) {
              console.error("Erro ao salvar foto na tabela:", directError);
            }
          } catch (uploadError) {
            console.error("Erro ao fazer upload de foto:", uploadError);
          }
        }
      }
      
      // Combine existing photos (without files) with newly uploaded ones
      const allScrapPhotos = [
        ...(sector.scrapPhotos || []),
        ...uploadedPhotos
      ];
      
      // Atualizar o setor com os dados da validação
      const updatedSector = {
        ...sector,
        status: "sucateado",
        outcome: "scrapped",
        scrapPhotos: allScrapPhotos,
        scrapObservations,
        scrapReturnInvoice: scrapInvoice,
        scrapReturnDate: returnDate,
        scrapValidated: true
      };
      
      // Atualizar no banco de dados
      await updateSector(sector.id, updatedSector);
      
      // Atualizar diretamente na tabela sectors
      await supabase
        .from("sectors")
        .update({
          current_status: "sucateado",
          current_outcome: "scrapped",
          scrap_observations: scrapObservations,
          updated_at: new Date().toISOString()
        })
        .eq("id", sector.id);
        
      // Atualizar também o ciclo
      await supabase
        .from("cycles")
        .update({
          status: "sucateado",
          outcome: "scrapped",
          scrap_observations: scrapObservations,
          scrap_return_invoice: scrapInvoice,
          scrap_return_date: returnDate,
          scrap_validated: true,
          updated_at: new Date().toISOString()
        })
        .eq("sector_id", sector.id)
        .order("created_at", { ascending: false })
        .limit(1);
      
      toast.success("Sucateamento validado com sucesso");
      navigate("/sucateamento");
    } catch (error) {
      console.error("Erro ao validar sucateamento:", error);
      toast.error("Erro ao validar sucateamento");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <PageLayoutWrapper>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          <span className="ml-3 text-gray-500">Carregando dados do setor...</span>
        </div>
      </PageLayoutWrapper>
    );
  }

  if (!sector) {
    return (
      <PageLayoutWrapper>
        <div className="text-center py-12">
          <h2 className="text-lg font-medium text-gray-700">Setor não encontrado</h2>
          <p className="text-gray-500 mt-2">O setor solicitado não foi encontrado ou não está disponível.</p>
          <Button className="mt-4" onClick={() => navigate("/sucateamento")}>
            Voltar para Lista
          </Button>
        </div>
      </PageLayoutWrapper>
    );
  }

  return (
    <PageLayoutWrapper>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Validação de Sucateamento</h1>
          <Button variant="outline" onClick={() => navigate("/sucateamento")}>
            Voltar
          </Button>
        </div>
        
        <SectorSummary sector={sector} />
        
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-700">Informações de Sucateamento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="scrapObservations" className="text-red-600 font-medium">
                Motivo do Sucateamento*
              </Label>
              <Textarea
                id="scrapObservations"
                value={scrapObservations}
                onChange={(e) => setScrapObservations(e.target.value)}
                placeholder="Detalhe os motivos pelos quais este setor foi sucateado..."
                className="min-h-[100px]"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="scrapInvoice" className="text-red-600 font-medium">
                  Nota Fiscal de Devolução*
                </Label>
                <Input
                  id="scrapInvoice"
                  value={scrapInvoice}
                  onChange={(e) => setScrapInvoice(e.target.value)}
                  placeholder="Ex: NF-12345"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="returnDate" className="text-red-600 font-medium">
                  Data de Devolução*
                </Label>
                <Input
                  id="returnDate"
                  type="date"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-red-600 font-medium">
                Fotos do Sucateamento
              </Label>
              <PhotoUpload
                photos={scrapPhotos}
                onChange={handlePhotoUpload}
                title="Adicionar fotos do sucateamento"
              />
            </div>
          </CardContent>
        </Card>
        
        <div className="flex justify-end">
          <Button
            variant="destructive"
            onClick={handleValidateScrap}
            disabled={isSaving || !scrapObservations.trim() || !scrapInvoice.trim()}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Validando...
              </>
            ) : (
              "Validar Sucateamento"
            )}
          </Button>
        </div>
      </div>
    </PageLayoutWrapper>
  );
}
