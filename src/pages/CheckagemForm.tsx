
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Sector } from "@/types";
import { toast } from "sonner";

import SectorForm from "@/components/sectors/SectorForm";
import { Card } from "@/components/ui/card";
import PageLayoutWrapper from "@/components/layout/PageLayoutWrapper";
import { useApi } from "@/contexts/ApiContextExtended";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function CheckagemForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getSectorById, updateSector } = useApi();
  const [sector, setSector] = useState<Sector | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSector = async () => {
      if (!id) {
        toast.error("ID do setor não fornecido.");
        return;
      }

      try {
        setLoading(true);
        const fetchedSector = await getSectorById(id);
        setSector(fetchedSector);
      } catch (error) {
        console.error("Erro ao buscar setor:", error);
        toast.error("Erro ao buscar detalhes do setor.");
      } finally {
        setLoading(false);
      }
    };

    fetchSector();
  }, [id, getSectorById]);

  const handleSubmit = async (data: Partial<Sector>) => {
    if (!sector?.id) {
      toast.error("ID do setor inválido.");
      return;
    }

    try {
      setSaving(true);
      await updateSector(sector.id, data);
      toast.success("Setor atualizado com sucesso!");
      navigate('/checagem');
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
        <p>Carregando detalhes do setor...</p>
      </PageLayoutWrapper>
    );
  }

  return (
    <PageLayoutWrapper>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="page-title">Checagem Final</h1>
          <Button variant="outline" size="sm" onClick={() => navigate('/checagem')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </div>

        <Card className="border-none shadow-lg">
          <div className="p-6">
            <SectorForm 
              sector={sector}
              onSubmit={handleSubmit}
              mode="quality"
              photoRequired={true}
              isLoading={saving}
            />
          </div>
        </Card>
      </div>
    </PageLayoutWrapper>
  );
}
