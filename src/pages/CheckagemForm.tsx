
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Sector, Service } from "@/types";
import { toast } from "sonner";

import SectorForm from "@/components/sectors/SectorForm";
import { Card } from "@/components/ui/card";
import PageLayoutWrapper from "@/components/layout/PageLayoutWrapper";
import { useApi } from "@/contexts/ApiContextExtended";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import ConnectionStatus from "@/components/peritagem/ConnectionStatus";

export default function CheckagemForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getSectorById, updateSector } = useApi();
  const [sector, setSector] = useState<Sector | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  // Verificar conexão
  useEffect(() => {
    const checkConnection = async () => {
      try {
        setConnectionStatus('checking');
        const response = await fetch('https://yjcyebiahnwfwrcgqlcm.supabase.co/rest/v1/', {
          method: 'HEAD',
          cache: 'no-cache',
        });
        setConnectionStatus(response.ok ? 'online' : 'offline');
      } catch (error) {
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

    fetchSector();
  }, [id, getSectorById, navigate]);

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
        status: 'concluido'
      };
      
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

  if (loading || !sector) {
    return (
      <PageLayoutWrapper>
        <p>Carregando detalhes do setor...</p>
      </PageLayoutWrapper>
    );
  }

  // Verificar se existem fotos do tipo "after" para todos os serviços
  const selectedServices = sector.services.filter(s => s.selected);
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
              onRetryConnection={() => setConnectionStatus('checking')}
            />
            <Button variant="outline" size="sm" onClick={() => navigate('/checagem')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
          </div>
        </div>

        {connectionStatus === 'offline' && (
          <Alert variant="warning" className="bg-yellow-50 border-yellow-200">
            <AlertCircle className="h-4 w-4 text-yellow-800" />
            <AlertTitle>Sem conexão</AlertTitle>
            <AlertDescription>
              Você está trabalhando no modo offline. Suas alterações serão salvas quando a conexão for restaurada.
            </AlertDescription>
          </Alert>
        )}

        <Card className="border-none shadow-lg">
          <div className="p-6">
            <SectorForm 
              sector={sector}
              onSubmit={handleSubmit}
              mode="quality"
              photoRequired={true}
              isLoading={saving}
              disableEntryFields={true}  // Nova prop para desabilitar campos de entrada
              hasAfterPhotosForAllServices={hasAfterPhotosForAllServices}
            />
          </div>
        </Card>
      </div>
    </PageLayoutWrapper>
  );
}
