
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageLayout from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from '@/hooks/use-mobile';
import { usePeritagemSubmit } from '@/hooks/usePeritagemSubmit';
import { usePeritagemData } from '@/hooks/usePeritagemData';
import SectorFormWrapper from '@/components/sectors/SectorFormWrapper';
import PeritagemHeader from '@/components/peritagem/PeritagemHeader';
import LoadingState from '@/components/peritagem/LoadingState';
import TimeoutError from '@/components/peritagem/TimeoutError';
import ErrorMessage from '@/components/peritagem/ErrorMessage';
import OfflineWarning from '@/components/peritagem/OfflineWarning';
import ConnectionStatus from '@/components/peritagem/ConnectionStatus';
import { toast } from 'sonner';

export function PeritagemForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;
  const isMobile = useIsMobile();
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [retryLoading, setRetryLoading] = useState(false);
  
  const {
    sector,
    defaultSector,
    loading,
    errorMessage,
    isEditing: isEditingState,
    services,
    hasValidData,
    validDefaultSector,
    setDataReady
  } = usePeritagemData(id);
  
  const { handleSubmit, isSaving, errorMessage: submitError } = usePeritagemSubmit();
  
  // Monitorar status de conexão
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  // Processar envio do formulário
  const onSubmit = async (data: any) => {
    try {
      await handleSubmit(data, isEditing, id);
      toast.success(isEditing ? "Peritagem atualizada" : "Peritagem criada", {
        description: isEditing 
          ? "Os dados da peritagem foram atualizados com sucesso." 
          : "Nova peritagem registrada com sucesso."
      });
    } catch (error) {
      console.error("Erro ao salvar peritagem:", error);
      toast.error("Erro ao salvar", {
        description: "Ocorreu um erro ao salvar a peritagem. Tente novamente."
      });
    }
  };

  const handleRetryConnection = () => {
    setRetryLoading(true);
    setDataReady(false);
    
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };
  
  const HeaderExtra = (
    <ConnectionStatus 
      status={isOffline ? 'offline' : 'online'} 
      onRetryConnection={handleRetryConnection}
      showDetails={true}
    />
  );
  
  // Se estiver carregando, mostrar estado de carregamento
  if (loading) {
    return (
      <PageLayout HeaderExtra={HeaderExtra}>
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => navigate('/peritagem')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold">
              {isEditing ? 'Editar Peritagem' : 'Nova Peritagem'}
            </h1>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleRetryConnection}
            disabled={retryLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${retryLoading ? 'animate-spin' : ''}`} />
            Recarregar
          </Button>
        </div>
        <LoadingState message="Carregando dados da peritagem..." />
      </PageLayout>
    );
  }
  
  // Se houver erro de timeout, mostrar mensagem específica
  if (errorMessage?.includes('timeout')) {
    return (
      <PageLayout HeaderExtra={HeaderExtra}>
        <TimeoutError onRetry={handleRetryConnection} />
      </PageLayout>
    );
  }
  
  // Se houver erro genérico, mostrar mensagem de erro
  if (errorMessage) {
    return (
      <PageLayout HeaderExtra={HeaderExtra}>
        <ErrorMessage message={errorMessage} />
        <div className="mt-4 flex justify-center">
          <Button onClick={handleRetryConnection} disabled={retryLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${retryLoading ? 'animate-spin' : ''}`} />
            Tentar novamente
          </Button>
        </div>
      </PageLayout>
    );
  }
  
  // Se estiver offline, mostrar aviso
  if (isOffline) {
    return (
      <PageLayout HeaderExtra={HeaderExtra}>
        <OfflineWarning />
      </PageLayout>
    );
  }
  
  // Verificar se temos dados válidos
  if (!hasValidData || !validDefaultSector) {
    return (
      <PageLayout HeaderExtra={HeaderExtra}>
        <LoadingState message="Carregando serviços disponíveis..." />
        <div className="mt-4 flex justify-center">
          <Button onClick={handleRetryConnection} disabled={retryLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${retryLoading ? 'animate-spin' : ''}`} />
            Tentar novamente
          </Button>
        </div>
      </PageLayout>
    );
  }
  
  return (
    <PageLayout HeaderExtra={HeaderExtra}>
      <div className="space-y-6">
        <PeritagemHeader isEditing={isEditing} />
        
        <Card className="p-6">
          <SectorFormWrapper
            initialSector={isEditing ? (sector || validDefaultSector) : validDefaultSector}
            onSubmit={onSubmit}
            mode="peritagem"
            photoRequired={true}
            isLoading={isSaving}
            disableEntryFields={false}
          />
        </Card>
      </div>
    </PageLayout>
  );
}

export default PeritagemForm;
