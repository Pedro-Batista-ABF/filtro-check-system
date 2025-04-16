
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Sector, Service, SectorStatus } from "@/types";
import { toast } from "sonner";

import SectorForm from "@/components/sectors/SectorForm";
import { Card } from "@/components/ui/card";
import PageLayoutWrapper from "@/components/layout/PageLayoutWrapper";
import { useApi } from "@/contexts/ApiContextExtended";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import ConnectionStatus from "@/components/peritagem/ConnectionStatus";
import OfflineWarning from "@/components/peritagem/OfflineWarning";

export default function CheckagemForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getSectorById, updateSector } = useApi();
  const [sector, setSector] = useState<Sector | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [retryCount, setRetryCount] = useState(0);

  // Verificar conexão
  useEffect(() => {
    const checkConnection = async () => {
      try {
        setConnectionStatus('checking');
        const response = await fetch('https://yjcyebiahnwfwrcgqlcm.supabase.co/rest/v1/', {
          method: 'HEAD',
          cache: 'no-cache',
          signal: AbortSignal.timeout(5000), // Timeout de 5 segundos
        });
        setConnectionStatus(response.ok ? 'online' : 'offline');
        if (response.ok) {
          setRetryCount(0); // Reset retry count on success
        }
      } catch (error) {
        console.error("Erro ao verificar conexão:", error);
        setConnectionStatus('offline');
      }
    };
    
    checkConnection();
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, [retryCount]);

  const handleRetryConnection = () => {
    setRetryCount(prev => prev + 1);
    setConnectionStatus('checking');
    toast.info("Tentando reconectar...");
  };

  useEffect(() => {
    const fetchSector = async () => {
      if (!id) {
        toast.error("ID do setor não fornecido.");
        return;
      }

      try {
        setLoading(true);
        const fetchedSector = await getSectorById(id);
        
        if (!fetchedSector) {
          toast.error("Setor não encontrado.");
          navigate('/checagem');
          return;
        }
        
        if (fetchedSector.status !== 'checagemFinalPendente') {
          toast.error(`Este setor não está pendente de checagem final (status atual: ${fetchedSector.status}).`);
          navigate('/checagem');
          return;
        }
        
        setSector(fetchedSector);
      } catch (error) {
        console.error("Erro ao buscar setor:", error);
        toast.error("Erro ao buscar detalhes do setor.");
      } finally {
        setLoading(false);
      }
    };

    if (connectionStatus === 'online') {
      fetchSector();
    }
  }, [id, getSectorById, navigate, connectionStatus]);

  const handleSubmit = async (data: Partial<Sector>) => {
    if (!sector?.id) {
      toast.error("ID do setor inválido.");
      return;
    }

    // Verificar se todos os serviços têm pelo menos uma foto "after"
    const selectedServices = sector.services.filter(s => s.selected);
    const servicesWithoutAfterPhotos = selectedServices.filter(service => {
      // Procurar fotos "after" no array photos do serviço
      const afterPhotos = service.photos?.filter(p => p.type === "after") || [];
      // Procurar fotos "after" no array afterPhotos de data
      const dataAfterPhotos = data.afterPhotos?.filter(p => p.serviceId === service.id) || [];
      
      return afterPhotos.length === 0 && dataAfterPhotos.length === 0;
    });

    // Verificar dados obrigatórios
    if (!data.exitInvoice || !data.exitDate) {
      toast.error("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    if (servicesWithoutAfterPhotos.length > 0) {
      toast.error("Todos os serviços precisam ter pelo menos uma foto 'DEPOIS'.");
      return;
    }

    try {
      setSaving(true);
      
      // Garantir que o status é atualizado para "concluido"
      const updatedData = {
        ...data,
        status: 'concluido' as SectorStatus
      };
      
      if (connectionStatus === 'offline') {
        // Salvar dados localmente para sincronização posterior
        localStorage.setItem(`pending_update_${sector.id}`, JSON.stringify(updatedData));
        toast.success("Dados salvos localmente. Serão sincronizados quando a conexão for restabelecida.");
        navigate('/checagem');
        return;
      }
      
      await updateSector(sector.id, updatedData);
      toast.success("Setor concluído com sucesso!");
      navigate('/checagem');
    } catch (error) {
      console.error("Erro ao atualizar setor:", error);
      toast.error("Erro ao atualizar o setor.");
    } finally {
      setSaving(false);
    }
  };

  if (loading && connectionStatus === 'online') {
    return (
      <PageLayoutWrapper>
        <p>Carregando detalhes do setor...</p>
      </PageLayoutWrapper>
    );
  }

  // Verificar se existem fotos do tipo "after" para todos os serviços
  const selectedServices = sector?.services.filter(s => s.selected) || [];
  const servicesWithAfterPhotos = selectedServices.filter(service => {
    const afterPhotos = service.photos?.filter(p => p.type === "after") || [];
    return afterPhotos.length > 0;
  });
  const hasAfterPhotosForAllServices = servicesWithAfterPhotos.length === selectedServices.length;

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
            <Button variant="outline" size="sm" onClick={() => navigate('/checagem')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
          </div>
        </div>

        {connectionStatus === 'offline' && (
          <OfflineWarning onRetryConnection={handleRetryConnection} />
        )}

        <Card className="border-none shadow-lg">
          <div className="p-6">
            {sector && (
              <SectorForm 
                sector={sector}
                onSubmit={handleSubmit}
                mode="quality"
                photoRequired={true}
                isLoading={saving}
                disableEntryFields={true}
                hasAfterPhotosForAllServices={hasAfterPhotosForAllServices}
              />
            )}
            {!sector && connectionStatus === 'offline' && (
              <div className="text-center p-6">
                <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Não foi possível carregar os dados</h3>
                <p className="text-gray-600 mb-4">
                  Os dados do setor não puderam ser carregados devido a problemas de conexão. Por favor, 
                  verifique sua conexão com a internet e tente novamente.
                </p>
                <Button onClick={handleRetryConnection}>Tentar novamente</Button>
              </div>
            )}
          </div>
        </Card>
      </div>
    </PageLayoutWrapper>
  );
}
