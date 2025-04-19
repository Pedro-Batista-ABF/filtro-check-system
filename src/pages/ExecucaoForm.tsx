
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Sector } from "@/types";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle } from "lucide-react";
import { useApi } from "@/contexts/ApiContextExtended";
import { toast } from "sonner";
import SectorFormWrapper from "@/components/sectors/SectorFormWrapper";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export default function ExecucaoForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [sector, setSector] = useState<Sector | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { getSectorById, updateSector } = useApi();
  const { user } = useAuth();

  useEffect(() => {
    async function loadSector() {
      if (!id) return;

      try {
        setLoading(true);
        const sectorData = await getSectorById(id);
        setSector(sectorData);
      } catch (error) {
        console.error("Erro ao carregar setor:", error);
        toast.error("Falha ao carregar dados do setor");
      } finally {
        setLoading(false);
      }
    }

    loadSector();
  }, [id, getSectorById]);

  const handleMarkAsCompleted = async () => {
    if (!sector || !id) return;

    try {
      setSaving(true);
      
      // Update the sector status
      const { error } = await supabase
        .from('sectors')
        .update({ 
          current_status: 'aguardandoChecagem',
          updated_at: new Date().toISOString(),
          updated_by: user?.id
        })
        .eq('id', id);
        
      if (error) throw error;

      // Update any related cycle data
      await updateSector(id, {
        ...sector,
        status: 'aguardandoChecagem',
        productionCompleted: true
      });

      toast.success("Setor marcado como concluído pela produção");
      navigate('/execucao');
    } catch (error) {
      console.error("Erro ao marcar setor como concluído:", error);
      toast.error("Falha ao atualizar status do setor");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (!sector) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <Card className="max-w-3xl mx-auto">
            <CardHeader>
              <CardTitle className="text-center text-red-500">Setor não encontrado</CardTitle>
            </CardHeader>
            <CardFooter>
              <Button onClick={() => navigate('/execucao')} className="w-full">
                Voltar para Execução
              </Button>
            </CardFooter>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Execução do Setor {sector.tagNumber}</h1>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Detalhes do Setor</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">TAG</p>
                <p className="font-medium">{sector.tagNumber}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">NF de Entrada</p>
                <p className="font-medium">{sector.entryInvoice || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Data de Entrada</p>
                <p className="font-medium">{sector.entryDate || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="font-medium">{sector.status || "emExecucao"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="mb-6">
          <SectorFormWrapper 
            initialSector={sector}
            onSubmit={async (data) => {
              try {
                await updateSector(sector.id, data);
                toast.success("Setor atualizado com sucesso");
                return true;
              } catch (error) {
                console.error("Erro ao atualizar setor:", error);
                toast.error("Falha ao atualizar setor");
                return false;
              }
            }}
            mode="production"
            photoRequired={false}
            isLoading={saving}
            disableEntryFields={true}
          />
        </div>
        
        <Card>
          <CardContent className="pt-6">
            <Button 
              onClick={handleMarkAsCompleted}
              disabled={saving || sector.productionCompleted}
              className="w-full"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : sector.productionCompleted ? (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Setor já concluído pela produção
                </>
              ) : (
                "Marcar setor como concluído pela produção"
              )}
            </Button>
          </CardContent>
          <CardFooter className="text-sm text-muted-foreground">
            Após marcar como concluído, o setor estará pronto para a checagem de qualidade.
          </CardFooter>
        </Card>
      </div>
    </DashboardLayout>
  );
}
