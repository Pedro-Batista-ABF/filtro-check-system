
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Sector } from "@/types";
import { toast } from "sonner";

import SectorForm from "@/components/sectors/SectorForm";
import { Card } from "@/components/ui/card";
import PageLayoutWrapper from "@/components/layout/PageLayoutWrapper";
import { usePeritagemData } from "@/hooks/usePeritagemData";
import { usePeritagemSubmit } from "@/hooks/usePeritagemSubmit";
import { useConnectionAuth } from "@/hooks/useConnectionAuth";
import PeritagemHeader from "@/components/peritagem/PeritagemHeader";
import ErrorMessage from "@/components/peritagem/ErrorMessage";
import LoadingState from "@/components/peritagem/LoadingState";
import ConnectionStatus from "@/components/peritagem/ConnectionStatus";
import TimeoutError from "@/components/peritagem/TimeoutError";
import OfflineWarning from "@/components/peritagem/OfflineWarning";

export default function PeritagemForm() {
  console.log("🔄 PeritagemForm render start", Date.now());
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [mountTime] = useState(Date.now());
  const [hasTimeout, setHasTimeout] = useState(false);
  const [maxLoadTime] = useState(12000);
  const { 
    connectionStatus,
    authVerified,
    forceRefreshing,
    handleForceRefresh 
  } = useConnectionAuth();
  
  const { 
    validDefaultSector, 
    defaultServices,
    loading, 
    errorMessage, 
    isEditing,
    hasValidData,
    dataReady,
    setDataReady: updateDataReady
  } = usePeritagemData(id);
  
  const { 
    handleSubmit, 
    isSaving, 
    errorMessage: submitError 
  } = usePeritagemSubmit();

  const [formSector, setFormSector] = useState<Sector | null>(null);
  const [forceRefreshingState, setForceRefreshingState] = useState(false);

  useEffect(() => {
    console.log("🕒 PeritagemForm - Configurando timeout de carregamento", Date.now());
    const timer = setTimeout(() => {
      if (loading || !formSector) {
        console.warn(`PeritagemForm: Timeout máximo de ${maxLoadTime/1000}s atingido`);
        if (!formSector && validDefaultSector) {
          console.log("⚠️ PeritagemForm - Timeout: Forçando formSector com validDefaultSector", Date.now());
          setFormSector(validDefaultSector);
        }
        updateDataReady(true);
        setHasTimeout(false);
        
        toast.warning("Carregamento parcial", {
          description: "Alguns dados podem estar usando valores padrão devido ao tempo de carregamento excedido."
        });
      }
    }, maxLoadTime);
    
    return () => clearTimeout(timer);
  }, [loading, formSector, validDefaultSector, maxLoadTime, updateDataReady]);

  useEffect(() => {
    console.log("⏱️ PeritagemForm - Configurando timeout longo", Date.now());
    const timer = setTimeout(() => {
      if (loading) {
        console.log("⏱️ PeritagemForm - Timeout longo atingido, setando hasTimeout", Date.now());
        setHasTimeout(true);
      }
    }, 15000);
    
    return () => clearTimeout(timer);
  }, [loading]);

  useEffect(() => {
    console.log("📋 PeritagemForm useEffect - Atualizando formSector", Date.now());
    console.log("📋 loading:", loading);
    console.log("📋 validDefaultSector:", validDefaultSector?.id || "não definido");
    console.log("📋 defaultServices length:", defaultServices?.length || 0);
    console.log("📋 dataReady:", dataReady);
    
    if (!loading && validDefaultSector && defaultServices.length > 0) {
      // Log diagnóstico justo antes de definir o formSector
      console.log("⚠️ Renderizando formulário com:", validDefaultSector, defaultServices);
      console.log("⚠️ Timestamp de definição do formSector:", Date.now());
      setFormSector(validDefaultSector);
      updateDataReady(true);
    }
  }, [validDefaultSector, defaultServices, loading, updateDataReady]);

  const handleForceRefreshLocal = () => {
    setForceRefreshingState(true);
    handleForceRefresh();
  };

  console.log("📊 PeritagemForm - Estado para decisão de render:", {
    loading,
    formSector: !!formSector,
    dataReady,
    defaultServicesLength: defaultServices?.length || 0,
    validDefaultSector: !!validDefaultSector,
    hasTimeout
  });

  // Critério de renderização melhorado conforme solicitado
  if (!loading && formSector && dataReady && defaultServices.length > 0 && validDefaultSector) {
    console.log("✅ PeritagemForm - Renderizando formulário", Date.now());
    return (
      <PageLayoutWrapper>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <PeritagemHeader isEditing={isEditing} />
            <ConnectionStatus status={connectionStatus} />
          </div>
          
          {errorMessage && <ErrorMessage message={errorMessage} />}
          {submitError && <ErrorMessage message={submitError} />}
          {connectionStatus === 'offline' && <OfflineWarning />}
          
          <Card className="border-none shadow-lg">
            <div className="p-6">
              <SectorForm 
                sector={formSector}
                onSubmit={(data) => handleSubmit(data, isEditing, id)}
                mode="review"
                photoRequired={true}
                isLoading={isSaving}
              />
            </div>
          </Card>
        </div>
      </PageLayoutWrapper>
    );
  }

  if (loading && !hasTimeout) {
    console.log("⏳ PeritagemForm - Renderizando loading", Date.now());
    return (
      <PageLayoutWrapper>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <PeritagemHeader isEditing={isEditing} />
            <ConnectionStatus status={connectionStatus} />
          </div>
          <LoadingState 
            message="Carregando formulário de peritagem" 
            showTiming={true} 
            details={connectionStatus === 'offline' ? 
              "Tentando reconectar ao servidor..." : 
              "Buscando tipos de serviços e preparando formulário..."}
          />
        </div>
      </PageLayoutWrapper>
    );
  }

  if (hasTimeout || forceRefreshingState) {
    console.log("⚠️ PeritagemForm - Renderizando timeout error", Date.now());
    return (
      <PageLayoutWrapper>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <PeritagemHeader isEditing={isEditing} />
            <ConnectionStatus status={connectionStatus} />
          </div>
          <TimeoutError
            forceRefreshing={forceRefreshing}
            mountTime={mountTime}
            authVerified={authVerified}
            services={defaultServices}
            connectionStatus={connectionStatus}
            defaultSector={validDefaultSector}
            sector={validDefaultSector}
            errorMessage={errorMessage}
            onRetry={handleForceRefreshLocal}
            onBack={() => navigate('/peritagem')}
          />
        </div>
      </PageLayoutWrapper>
    );
  }

  console.log("⏳ PeritagemForm - Renderizando fallback loading", Date.now());
  return (
    <PageLayoutWrapper>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <PeritagemHeader isEditing={isEditing} />
          <ConnectionStatus status={connectionStatus} />
        </div>
        <LoadingState 
          message="Carregando peritagem" 
          showTiming={true}
          details="Aguarde, estamos preparando o formulário..."
        />
      </div>
    </PageLayoutWrapper>
  );
}
