
import React, { useEffect, useState } from "react";
import PageLayoutWrapper from "@/components/layout/PageLayoutWrapper";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle, Loader } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useApi } from "@/contexts/ApiContextExtended";
import { Sector } from "@/types";
import { Card } from "@/components/ui/card";
import ConnectionStatus from "@/components/peritagem/ConnectionStatus";
import { refreshAuthSession } from "@/integrations/supabase/client";
import { validateSession } from "@/utils/sessionUtils";
import { toast } from "sonner";
import SectorFormWrapper from "@/components/sectors/SectorFormWrapper";

export default function CheckagemDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { getSectorById, updateSector, refreshData } = useApi();
  const [sector, setSector] = useState<Sector | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  // Verificar status da conexão periodicamente
  useEffect(() => {
    const checkConnectionStatus = async () => {
      try {
        await refreshAuthSession();
        setConnectionStatus('online');
      } catch (error) {
        console.error("Erro ao verificar status da conexão:", error);
        setConnectionStatus('offline');
      }
    };
    
    checkConnectionStatus();
    const interval = setInterval(checkConnectionStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    document.title = "Detalhes Checagem - Gestão de Recuperação";
    
    const loadSector = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        await refreshAuthSession();
        
        const userId = await validateSession();
        if (!userId) {
          toast.error("Sessão inválida", { 
            description: "Por favor, faça login novamente." 
          });
          navigate('/login');
          return;
        }
        
        const sectorData = await getSectorById(id);
        if (sectorData) {
          setSector(sectorData);
        } else {
          toast.error("Setor não encontrado");
          navigate('/checagem');
        }
      } catch (error) {
        console.error("Erro ao carregar setor:", error);
        toast.error("Erro ao carregar informações do setor");
      } finally {
        setLoading(false);
      }
    };
    
    loadSector();
  }, [id, navigate, getSectorById]);

  const handleSubmit = async (data: Partial<Sector>) => {
    if (!sector?.id) {
      toast.error("ID do setor não encontrado.");
      return;
    }

    setSaving(true);
    try {
      await refreshAuthSession();
      
      const userId = await validateSession();
      if (!userId) {
        throw new Error("Sessão inválida");
      }
      
      const updatedData = { ...data, status: 'concluido' as any };
      await updateSector(sector.id, updatedData);
      await refreshData();
      
      toast.success("Checagem concluída com sucesso!");
      navigate('/concluidos');
    } catch (error) {
      console.error("Erro ao atualizar setor:", error);
      toast.error("Erro ao finalizar checagem");
    } finally {
      setSaving(false);
    }
  };

  const handleRetryConnection = async () => {
    setConnectionStatus('checking');
    try {
      await refreshAuthSession();
      setConnectionStatus('online');
      if (id) {
        const sectorData = await getSectorById(id);
        if (sectorData) {
          setSector(sectorData);
          toast.success("Conexão restaurada!");
        }
      }
    } catch (error) {
      console.error("Erro ao reconectar:", error);
      setConnectionStatus('offline');
      toast.error("Falha ao reconectar.");
    }
  };

  if (loading) {
    return (
      <PageLayoutWrapper>
        <div className="flex justify-center items-center p-12">
          <Loader className="h-8 w-8 animate-spin mr-2" />
          <p>Carregando informações do setor...</p>
        </div>
      </PageLayoutWrapper>
    );
  }

  return (
    <PageLayoutWrapper>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Detalhes da Checagem - TAG: {sector?.tagNumber}</h1>
          <div className="flex items-center gap-2">
            <ConnectionStatus 
              status={connectionStatus} 
              onRetryConnection={handleRetryConnection}
            />
            <Button 
              variant="outline" 
              onClick={() => navigate('/checagem')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
          </div>
        </div>

        <Card className="border-none shadow-lg">
          <div className="p-6">
            {sector && (
              <SectorFormWrapper 
                initialSector={sector}
                onSubmit={handleSubmit}
                mode="quality"
                photoRequired={true}
                isLoading={saving}
                disableEntryFields={true}
              />
            )}
          </div>
        </Card>
      </div>
    </PageLayoutWrapper>
  );
}
