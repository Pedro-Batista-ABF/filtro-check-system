
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageLayout from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
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

export function PeritagemForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;
  const isMobile = useIsMobile();
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [mountTime] = useState(Date.now());
  
  const {
    sector,
    defaultSector,
    loading,
    errorMessage,
    isEditing: isEditingState,
    services,
    hasValidData,
    validDefaultSector
  } = usePeritagemData(id);
  
  const { handleSubmit, isSaving, errorMessage: submitError } = usePeritagemSubmit();
  
  // Monitorar status de conexão
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    console.log("PeritagemForm montado:", {
      id,
      isEditing,
      loading,
      hasValidData,
      validDefaultSector: !!validDefaultSector
    });
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [id, isEditing, loading, hasValidData, validDefaultSector]);
  
  // Processar envio do formulário
  const onSubmit = async (data: any) => {
    console.log("Tentando submeter formulário:", data);
    try {
      await handleSubmit(data, isEditing, id);
    } catch (error) {
      console.error("Erro ao salvar peritagem:", error);
    }
  };
  
  const HeaderExtra = (
    <ConnectionStatus 
      status={isOffline ? 'offline' : 'online'} 
      onRetryConnection={() => window.location.reload()}
      showDetails={true}
    />
  );
  
  // Se estiver carregando, mostrar estado de carregamento
  if (loading) {
    console.log("Renderizando estado de carregamento");
    return (
      <PageLayout HeaderExtra={HeaderExtra}>
        <div className="flex items-center gap-4 mb-6">
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
        <LoadingState 
          message="Carregando dados da peritagem..." 
          showTiming={true}
          details="Aguarde enquanto carregamos as informações necessárias"
        />
      </PageLayout>
    );
  }
  
  // Se houver erro de timeout, mostrar mensagem específica
  if (errorMessage?.includes('timeout')) {
    return (
      <PageLayout HeaderExtra={HeaderExtra}>
        <TimeoutError 
          onRetry={() => window.location.reload()}
          forceRefreshing={false}
          mountTime={mountTime}
          authVerified={true}
          services={services}
          connectionStatus={isOffline ? 'offline' : 'online'}
          defaultSector={defaultSector}
          sector={sector}
          errorMessage={errorMessage}
          onBack={() => navigate('/peritagem')}
          onRetryConnection={() => window.location.reload()}
        />
      </PageLayout>
    );
  }
  
  // Se houver erro genérico, mostrar mensagem de erro
  if (errorMessage) {
    return (
      <PageLayout HeaderExtra={HeaderExtra}>
        <ErrorMessage 
          message={errorMessage} 
        />
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
    console.log("Sem dados válidos, renderizando estado de carregamento adicional");
    return (
      <PageLayout HeaderExtra={HeaderExtra}>
        <LoadingState 
          message="Carregando serviços disponíveis..." 
          showTiming={true}
          details="Estamos preparando o formulário com os serviços disponíveis"
        />
      </PageLayout>
    );
  }
  
  console.log("Renderizando formulário completo", {
    validDefaultSector: !!validDefaultSector,
    sectorToUse: isEditing ? (sector || validDefaultSector) : validDefaultSector
  });
  
  const sectorToUse = isEditing ? (sector || validDefaultSector) : validDefaultSector;
  
  return (
    <PageLayout HeaderExtra={HeaderExtra}>
      <div className="space-y-6">
        <PeritagemHeader isEditing={isEditing} />
        
        <Card className="p-6">
          <SectorFormWrapper
            initialSector={sectorToUse}
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
