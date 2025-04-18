
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Sector, SectorStatus } from "@/types";
import { toast } from "sonner";

import { Card } from "@/components/ui/card";
import PageLayoutWrapper from "@/components/layout/PageLayoutWrapper";
import { useApi } from "@/contexts/ApiContextExtended";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import ConnectionStatus from "@/components/peritagem/ConnectionStatus";
import { refreshAuthSession } from "@/integrations/supabase/client";
import { validateSession } from "@/utils/sessionUtils";
import SectorFormWrapper from "@/components/sectors/SectorFormWrapper";

export default function CheckagemForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { updateSector, getSectorById } = useApi();
  const [sector, setSector] = useState<Sector | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [hasPermissionError, setHasPermissionError] = useState(false);

  // Verificar status da conexão periodicamente
  useEffect(() => {
    const checkConnectionStatus = async () => {
      try {
        // Primeiro tentar atualizar a sessão
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

  // Buscar informações do setor com base no ID
  useEffect(() => {
    const fetchSector = async () => {
      try {
        console.log("Buscando setor com ID:", id);
        setLoading(true);
        setHasPermissionError(false);
        
        if (!id) {
          toast.error("ID do setor não fornecido.");
          navigate("/checagem/final");
          return;
        }

        // Forçar refresh da sessão antes de buscar o setor
        await refreshAuthSession();
        
        // Verificar se a sessão é válida
        const userId = await validateSession();
        if (!userId) {
          toast.error("Sessão inválida", { 
            description: "Por favor, faça login novamente." 
          });
          navigate('/login');
          return;
        }
        
        // Buscar setor pelo ID
        const sectorData = await getSectorById(id);
        console.log("Dados do setor:", sectorData);
        
        if (!sectorData) {
          toast.error("Setor não encontrado ou sem permissão para acesso.");
          navigate("/checagem/final");
          return;
        }
        
        // Verificar se o setor está no status correto para checagem
        if (sectorData.status !== 'checagemFinalPendente') {
          toast.warning("Este setor não está pendente de checagem final.", {
            description: `Status atual: ${sectorData.status}`
          });
          // Ainda permite visualizar, mas exibe aviso
        }
        
        setSector(sectorData);
      } catch (error: any) {
        console.error("Erro ao buscar setor:", error);
        
        // Verificar se o erro é relacionado a permissões
        if (error?.message?.includes('permission denied') || 
            error?.code === 'PGRST301' || 
            error?.message?.includes('violates row-level security policy')) {
          setHasPermissionError(true);
          toast.error("Sem permissão para acessar este setor");
        } else {
          toast.error("Erro ao buscar informações do setor", {
            description: error?.message || "Tente novamente mais tarde."
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSector();
  }, [id, navigate, getSectorById]);

  const handleSubmit = async (data: Partial<Sector>) => {
    if (!sector?.id) {
      toast.error("ID do setor não encontrado.");
      return;
    }

    setSaving(true);
    try {
      // Forçar refresh da sessão antes de atualizar o setor
      await refreshAuthSession();
      
      // Verificar se a sessão é válida
      const userId = await validateSession();
      if (!userId) {
        throw new Error("Sessão inválida");
      }
      
      // Ensure that the status is correctly set
      const updatedData = { 
        ...data, 
        status: 'concluido' as SectorStatus 
      };
      await updateSector(sector.id, updatedData);
      toast.success("Setor atualizado com sucesso!");
      navigate('/concluidos');
    } catch (error: any) {
      console.error("Erro ao atualizar setor:", error);
      toast.error("Erro ao atualizar o setor", {
        description: error?.message || "Tente novamente mais tarde."
      });
    } finally {
      setSaving(false);
    }
  };

  const handleRetryConnection = async () => {
    setConnectionStatus('checking');
    try {
      await refreshAuthSession();
      setConnectionStatus('online');
      // Atualizar os dados do setor após reconexão
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
        <div className="p-6 flex justify-center items-center">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-lg">Carregando informações do setor...</p>
          </div>
        </div>
      </PageLayoutWrapper>
    );
  }

  if (hasPermissionError) {
    return (
      <PageLayoutWrapper>
        <div className="p-6 flex justify-center items-center">
          <div className="text-center max-w-md">
            <h2 className="text-xl font-semibold text-red-500 mb-4">Erro de permissão</h2>
            <p className="mb-6">Você não tem permissão para acessar este setor. Verifique suas credenciais ou entre em contato com o administrador.</p>
            <div className="flex gap-4 justify-center">
              <Button variant="outline" onClick={() => navigate('/checagem/final')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar para lista
              </Button>
              <Button onClick={handleRetryConnection}>
                Tentar novamente
              </Button>
            </div>
          </div>
        </div>
      </PageLayoutWrapper>
    );
  }

  if (!sector) {
    return (
      <PageLayoutWrapper>
        <div className="p-6 flex justify-center items-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-red-500 mb-4">Setor não encontrado</h2>
            <p className="mb-6">Não foi possível encontrar as informações do setor solicitado.</p>
            <Button onClick={() => navigate('/checagem/final')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para lista de setores
            </Button>
          </div>
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
              onRetryConnection={handleRetryConnection}
            />
            <Button variant="outline" onClick={() => navigate('/checagem/final')}>
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
