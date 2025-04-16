
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import PageLayoutWrapper from "@/components/layout/PageLayoutWrapper";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import SectorForm from "@/components/sectors/SectorForm";
import { Sector, SectorStatus } from "@/types";
import { toast } from "sonner";
import { useApi } from "@/contexts/ApiContextExtended";
import ConnectionStatus from "@/components/peritagem/ConnectionStatus";
import { checkSupabaseConnection } from "@/utils/connectionUtils";
import { refreshAuthSession } from "@/integrations/supabase/client";

export default function CheckagemForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { updateSector, getSectorById } = useApi();
  const [sector, setSector] = useState<Sector | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  
  // Verificar conexão
  useEffect(() => {
    const checkConnection = async () => {
      try {
        setConnectionStatus('checking');
        const isConnected = await checkSupabaseConnection();
        setConnectionStatus(isConnected ? 'online' : 'offline');
      } catch (error) {
        console.error("Erro ao verificar conexão:", error);
        setConnectionStatus('offline');
      }
    };
    
    checkConnection();
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchSector = async () => {
      if (!id) {
        toast.error("ID do setor não fornecido.");
        return;
      }

      setLoading(true);
      try {
        // Forçar refresh da sessão antes de buscar o setor
        await refreshAuthSession();
        
        // Buscar o setor
        const sectorData = await getSectorById(id);
        
        if (!sectorData) {
          throw new Error("Setor não encontrado");
        }
        
        setSector(sectorData);
      } catch (error) {
        console.error("Erro ao buscar setor:", error);
        toast.error("Erro ao buscar informações do setor.");
      } finally {
        setLoading(false);
      }
    };

    fetchSector();
  }, [id, getSectorById]);

  const handleSubmit = async (data: Partial<Sector>) => {
    if (!sector?.id) {
      toast.error("ID do setor não encontrado.");
      return;
    }

    setSaving(true);
    try {
      // Forçar refresh da sessão antes de atualizar o setor
      await refreshAuthSession();
      
      // Ensure that the status is set to 'checagemFinalConcluida' with proper type
      const updatedData = { 
        ...data, 
        status: 'checagemFinalConcluida' as SectorStatus 
      };
      await updateSector(sector.id, updatedData);
      toast.success("Checagem final registrada com sucesso!");
      navigate('/checagem');
    } catch (error) {
      console.error("Erro ao atualizar setor:", error);
      toast.error("Erro ao registrar checagem final.");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !sector) {
    return (
      <PageLayoutWrapper>
        <div className="p-6 flex justify-center items-center">
          <p>Carregando informações do setor...</p>
        </div>
      </PageLayoutWrapper>
    );
  }

  return (
    <PageLayoutWrapper>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="page-title">Checagem Final</h1>
          <div className="flex items-center gap-2">
            <ConnectionStatus 
              status={connectionStatus} 
              onRetryConnection={() => setConnectionStatus('checking')}
            />
            <Button variant="outline" onClick={() => navigate('/checagem')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
          </div>
        </div>
        <Card className="border-none shadow-lg">
          <div className="p-6">
            {sector && (
              <SectorForm 
                initialSector={sector}
                onSubmit={handleSubmit}
                mode="checagem"
                photoRequired={true}
                isLoading={saving}
                disableEntryFields={true}
                hasAfterPhotosForAllServices={false}
              />
            )}
          </div>
        </Card>
      </div>
    </PageLayoutWrapper>
  );
}
