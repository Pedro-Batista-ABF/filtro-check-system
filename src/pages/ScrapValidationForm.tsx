
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Sector, SectorStatus } from "@/types";
import { toast } from "sonner";

import SectorForm from "@/components/sectors/SectorForm";
import { Card } from "@/components/ui/card";
import PageLayoutWrapper from "@/components/layout/PageLayoutWrapper";
import { useApi } from "@/contexts/ApiContextExtended";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function ScrapValidationForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { updateSector } = useApi();
  const [sector, setSector] = useState<Sector | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSector = async () => {
      if (!id) {
        toast.error("ID do setor não fornecido.");
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sectors/${id}`);
        if (!response.ok) {
          throw new Error(`Erro ao buscar setor: ${response.status}`);
        }
        const data = await response.json();
        setSector(data);
      } catch (error) {
        console.error("Erro ao buscar setor:", error);
        toast.error("Erro ao buscar informações do setor.");
      } finally {
        setLoading(false);
      }
    };

    fetchSector();
  }, [id]);

  const handleSubmit = async (data: Partial<Sector>) => {
    if (!sector?.id) {
      toast.error("ID do setor não encontrado.");
      return;
    }

    setSaving(true);
    try {
      // Ensure that the status is set to 'sucateado' with proper type
      const updatedData = { 
        ...data, 
        status: 'sucateado' as SectorStatus 
      };
      await updateSector(sector.id, updatedData);
      toast.success("Setor atualizado e sucateado com sucesso!");
      navigate('/sucateamento');
    } catch (error) {
      console.error("Erro ao atualizar setor:", error);
      toast.error("Erro ao atualizar o setor.");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !sector) {
    return (
      <PageLayoutWrapper>
        <p>Carregando informações do setor...</p>
      </PageLayoutWrapper>
    );
  }

  return (
    <PageLayoutWrapper>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="page-title">Validar Sucateamento</h1>
          <Button variant="outline" onClick={() => navigate('/sucateamento')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </div>
        <Card className="border-none shadow-lg">
          <div className="p-6">
            <SectorForm 
              sector={sector}
              onSubmit={handleSubmit}
              mode="scrap"
              photoRequired={false}
              isLoading={saving}
            />
          </div>
        </Card>
      </div>
    </PageLayoutWrapper>
  );
}
