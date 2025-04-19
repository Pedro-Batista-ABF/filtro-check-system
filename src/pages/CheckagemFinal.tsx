
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Sector } from "@/types";
import { toast } from "sonner";

import { Card } from "@/components/ui/card";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useApi } from "@/contexts/ApiContextExtended";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import SectorFormWrapper from "@/components/sectors/SectorFormWrapper";
import { Loader2 } from "lucide-react";

export default function CheckagemFinal() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getSectorById, updateSector } = useApi();
  const [sector, setSector] = useState<Sector | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchSector() {
      if (!id) {
        toast.error("ID do setor não fornecido");
        setError("ID do setor não fornecido");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const sectorData = await getSectorById(id);
        
        if (!sectorData) {
          throw new Error("Setor não encontrado ou você não tem permissão para acessá-lo");
        }
        
        console.log("Setor carregado:", sectorData);
        
        if (sectorData.status !== 'emChecagem') {
          toast.error(`Este setor não está em fase de checagem (status atual: ${sectorData.status})`, {
            description: "Apenas setores em checagem podem ser finalizados aqui."
          });
          setError(`Este setor não está em fase de checagem. Status atual: ${sectorData.status}`);
        }
        
        setSector(sectorData);
      } catch (error) {
        console.error("Erro ao buscar setor:", error);
        const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
        toast.error(`Erro ao buscar informações do setor: ${errorMessage}`);
        setError(`Não foi possível carregar o setor: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    }

    fetchSector();
  }, [id, getSectorById]);

  const handleSubmit = async (data: Partial<Sector>) => {
    if (!sector?.id) {
      toast.error("ID do setor não encontrado");
      return;
    }

    // Validar dados
    if (!data.exitInvoice) {
      toast.error("A nota fiscal de saída é obrigatória");
      return;
    }

    if (!data.exitDate) {
      toast.error("A data de saída é obrigatória");
      return;
    }

    // Verificar se todos os serviços têm fotos "depois"
    const selectedServices = (data.services || []).filter(s => s.selected);
    const servicesWithoutAfterPhotos = selectedServices.filter(service => {
      const photos = service.photos || [];
      return !photos.some(photo => photo.type === 'after');
    });

    if (servicesWithoutAfterPhotos.length > 0) {
      const serviceNames = servicesWithoutAfterPhotos.map(s => s.name).join(", ");
      toast.error(`Os seguintes serviços não possuem fotos do resultado: ${serviceNames}`);
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // Atualizar o status para concluído
      const updatedData = {
        ...data,
        status: 'concluido',
        checagemDate: new Date().toISOString().split('T')[0],
        productionCompleted: true
      };

      const result = await updateSector(sector.id, updatedData);
      
      if (result) {
        toast.success("Checagem finalizada com sucesso");
        navigate("/checagem");
      } else {
        throw new Error("Falha ao finalizar checagem");
      }
    } catch (error) {
      console.error("Erro ao finalizar checagem:", error);
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      toast.error(`Erro ao finalizar checagem: ${errorMessage}`);
      setError(`Falha ao finalizar checagem: ${errorMessage}`);
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    navigate("/checagem");
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6 flex justify-center items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-2">Carregando informações do setor...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="page-title">Checagem Final</h1>
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </div>
        
        {error ? (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4 mr-2" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : (
          <Card className="border-none shadow-lg">
            <div className="p-6">
              {sector && (
                <SectorFormWrapper
                  initialSector={sector}
                  onSubmit={handleSubmit}
                  mode="checagem"
                  isLoading={saving}
                  photoRequired={true}
                />
              )}
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
