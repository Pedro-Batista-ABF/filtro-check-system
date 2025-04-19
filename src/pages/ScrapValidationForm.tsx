
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Sector, SectorStatus } from "@/types";
import { toast } from "sonner";

import { Card } from "@/components/ui/card";
import PageLayoutWrapper from "@/components/layout/PageLayoutWrapper";
import { useApi } from "@/contexts/ApiContextExtended";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import ConnectionStatus from "@/components/peritagem/ConnectionStatus";
import { checkSupabaseConnection } from "@/utils/connectionUtils";
import { refreshAuthSession } from "@/integrations/supabase/client";
import { validateSession } from "@/utils/sessionUtils";
import SectorFormWrapper from "@/components/sectors/SectorFormWrapper";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";

export default function ScrapValidationForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { updateSector, getSectorById } = useApi();
  const [sector, setSector] = useState<Sector | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  // Verificar conexão
  useEffect(() => {
    const checkConnection = async () => {
      try {
        setConnectionStatus('checking');
        // Primeiro verificar se há conexão com Supabase
        const isConnected = await checkSupabaseConnection();
        
        if (isConnected) {
          // Depois verificar se há sessão válida
          await refreshAuthSession();
          setConnectionStatus('online');
        } else {
          setConnectionStatus('offline');
        }
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
        setError("ID do setor não fornecido");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      
      try {
        // Forçar refresh da sessão antes de buscar o setor
        await refreshAuthSession();
        
        // Verificar se a sessão é válida
        const userId = await validateSession();
        if (!userId) {
          toast.error("Sessão inválida", {
            description: "Por favor, faça login novamente."
          });
          setError("Sessão inválida. Por favor, faça login novamente.");
          navigate('/login');
          return;
        }
        
        console.log(`Buscando setor ${id} para validação de sucateamento...`);
        
        // Buscar o setor
        const sectorData = await getSectorById(id);
        
        if (!sectorData) {
          throw new Error("Setor não encontrado ou você não tem permissão para acessá-lo");
        }
        
        console.log("Setor carregado:", sectorData);
        
        // Verificar se o setor está no status correto para sucateamento
        if (sectorData.status !== 'sucateadoPendente') {
          toast.error(`Setor não está pendente para sucateamento (status atual: ${sectorData.status})`, {
            description: "Apenas setores marcados como pendentes de sucateamento podem ser validados."
          });
          setError(`Este setor não está marcado como pendente para sucateamento. Status atual: ${sectorData.status}`);
          setSector(sectorData); // Ainda definir o setor para exibir informações
        } else {
          setSector(sectorData);
        }
      } catch (error) {
        console.error("Erro ao buscar setor:", error);
        const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
        toast.error(`Erro ao buscar informações do setor: ${errorMessage}`);
        setError(`Não foi possível carregar o setor: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    };

    fetchSector();
  }, [id, getSectorById, navigate]);

  const handleSubmit = async (data: Partial<Sector>) => {
    if (!sector?.id) {
      toast.error("ID do setor não encontrado.");
      return;
    }

    // Validar campos obrigatórios
    if (!data.scrapObservations) {
      toast.error("O motivo do sucateamento é obrigatório.");
      return;
    }

    if (!data.scrapReturnInvoice) {
      toast.error("A nota fiscal de devolução é obrigatória.");
      return;
    }

    if (!data.scrapReturnDate) {
      toast.error("A data de devolução é obrigatória.");
      return;
    }

    if (!data.scrapPhotos || data.scrapPhotos.length === 0) {
      toast.error("É necessário incluir pelo menos uma foto do estado de sucateamento.");
      return;
    }

    setSaving(true);
    setError(null);
    
    try {
      // Forçar refresh da sessão antes de atualizar o setor
      await refreshAuthSession();
      
      // Verificar se a sessão é válida
      const userId = await validateSession();
      if (!userId) {
        throw new Error("Sessão inválida");
      }
      
      console.log("Validando sucateamento do setor:", sector.id);
      
      // Ensure that the status is set to 'sucateado' with proper type
      const updatedData = { 
        ...data, 
        status: 'sucateado' as SectorStatus,
        current_status: 'sucateado',
        current_outcome: 'Sucateado',
        scrapValidated: true,
        outcome: 'Sucateado'
      };
      
      console.log("Dados a serem enviados:", updatedData);
      
      // First try with the API
      let result;
      try {
        result = await updateSector(sector.id, updatedData);
        if (!result) {
          throw new Error("Falha na resposta da API updateSector");
        }
      } catch (updateError) {
        console.error("Erro na API updateSector:", updateError);
        throw new Error(`Falha ao atualizar o setor: ${updateError instanceof Error ? updateError.message : 'Erro desconhecido'}`);
      }
      
      // Verificar diretamente se a atualização do status foi bem-sucedida
      const { data: checkData, error: checkError } = await supabase
        .from('sectors')
        .select('current_status')
        .eq('id', sector.id)
        .single();
        
      if (checkError) {
        console.error("Erro ao verificar status após atualização:", checkError);
        toast.warning("Verificação do status após atualização falhou, tentando forçar atualização");
      } else if (checkData.current_status !== 'sucateado') {
        console.warn("Status não atualizado corretamente. Tentando forçar...");
        toast.warning("Status não atualizado corretamente, tentando forçar atualização");
        
        // Tentativa de forçar atualização do status diretamente
        const { error: forceError } = await supabase
          .from('sectors')
          .update({ 
            current_status: 'sucateado',
            current_outcome: 'Sucateado',
            updated_at: new Date().toISOString()
          })
          .eq('id', sector.id);
          
        if (forceError) {
          console.error("Erro ao forçar atualização do status:", forceError);
          toast.error("Erro ao forçar atualização do status");
        } else {
          console.log("Status forçado com sucesso para 'sucateado'");
          toast.success("Status forçado com sucesso");
        }
      }
      
      toast.success("Setor validado e sucateado com sucesso!");
      navigate('/sucateamento');
    } catch (error) {
      console.error("Erro ao atualizar setor:", error);
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      toast.error(`Erro ao atualizar o setor: ${errorMessage}`);
      setError(`Falha ao validar sucateamento: ${errorMessage}`);
    } finally {
      setSaving(false);
    }
  };

  const handleRetryConnection = async () => {
    setConnectionStatus('checking');
    try {
      const isConnected = await checkSupabaseConnection();
      if (isConnected) {
        await refreshAuthSession();
        setConnectionStatus('online');
        
        // Recarregar dados após reconexão bem-sucedida
        if (id) {
          const sectorData = await getSectorById(id);
          if (sectorData) {
            setSector(sectorData);
            setError(null);
            toast.success("Conexão restaurada!");
          }
        }
      } else {
        setConnectionStatus('offline');
        toast.error("Servidor não disponível");
      }
    } catch (error) {
      console.error("Erro ao reconectar:", error);
      setConnectionStatus('offline');
      toast.error("Falha ao reconectar");
    }
  };

  const handleBack = () => {
    navigate('/sucateamento');
  };

  if (loading) {
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
          <h1 className="page-title">Validar Sucateamento</h1>
          <div className="flex items-center gap-2">
            <ConnectionStatus 
              status={connectionStatus} 
              onRetryConnection={handleRetryConnection}
            />
            <Button variant="outline" onClick={handleBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
          </div>
        </div>
        
        {error ? (
          <Card className="border-none shadow-lg">
            <div className="p-6">
              <Alert variant="destructive" className="mb-4">
                <AlertTriangle className="h-4 w-4 mr-2" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
              
              <div className="flex justify-center mt-4">
                <Button variant="default" onClick={handleRetryConnection} className="mr-2">
                  Tentar novamente
                </Button>
                <Button variant="outline" onClick={handleBack}>
                  Voltar para lista
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="border-none shadow-lg">
            <div className="p-6">
              {sector && (
                <SectorFormWrapper 
                  initialSector={sector}
                  onSubmit={handleSubmit}
                  mode="scrap"
                  photoRequired={true}
                  isLoading={saving}
                  disableEntryFields={true}
                />
              )}
            </div>
          </Card>
        )}
      </div>
    </PageLayoutWrapper>
  );
}
