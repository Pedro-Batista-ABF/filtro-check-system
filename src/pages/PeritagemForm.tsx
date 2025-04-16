
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Sector } from "@/types";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { checkSupabaseConnection } from "@/utils/serviceUtils";

import SectorForm from "@/components/sectors/SectorForm";
import { Card } from "@/components/ui/card";
import PageLayoutWrapper from "@/components/layout/PageLayoutWrapper";
import { usePeritagemData } from "@/hooks/usePeritagemData";
import { usePeritagemSubmit } from "@/hooks/usePeritagemSubmit";
import PeritagemHeader from "@/components/peritagem/PeritagemHeader";
import ErrorMessage from "@/components/peritagem/ErrorMessage";
import LoadingState from "@/components/peritagem/LoadingState";
import ConnectionStatus from "@/components/peritagem/ConnectionStatus";
import TimeoutError from "@/components/peritagem/TimeoutError";
import OfflineWarning from "@/components/peritagem/OfflineWarning";

export default function PeritagemForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { 
    sector, 
    defaultSector, 
    loading, 
    errorMessage, 
    isEditing,
    services,
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
  const [hasTimeout, setHasTimeout] = useState(false);
  const [mountTime] = useState(Date.now());
  const [forceRefreshing, setForceRefreshing] = useState(false);
  const [authVerified] = useState(false);
  const [maxLoadTime] = useState(12000);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const isAuth = !!data.session?.user;
        
        if (!isAuth) {
          console.error("PeritagemForm: Usuário não autenticado na verificação direta");
          toast.error("Sessão expirada", {
            description: "Faça login novamente para continuar"
          });
          navigate('/login');
        } else {
          console.log("PeritagemForm: Autenticação verificada diretamente:", data.session.user.id);
          
          const isConnected = await checkSupabaseConnection();
          setConnectionStatus(isConnected ? 'online' : 'offline');
          
          if (!isConnected) {
            toast.error("Problemas de conexão", {
              description: "Não foi possível estabelecer uma conexão estável com o servidor"
            });
          }
        }
      } catch (error) {
        console.error("PeritagemForm: Erro ao verificar autenticação:", error);
        setConnectionStatus('offline');
      }
    };
    
    checkAuth();
  }, [navigate]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    if (connectionStatus === 'offline') {
      interval = setInterval(async () => {
        console.log("PeritagemForm: Tentando reconectar...");
        const isConnected = await checkSupabaseConnection();
        if (isConnected) {
          setConnectionStatus('online');
          toast.success("Conexão estabelecida", {
            description: "A conexão com o servidor foi restaurada"
          });
          clearInterval(interval);
        }
      }, 10000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [connectionStatus]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading || !formSector) {
        console.warn(`PeritagemForm: Timeout máximo de ${maxLoadTime/1000}s atingido`);
        if (!formSector && defaultSector) {
          setFormSector(defaultSector);
        } else if (!formSector && sector) {
          setFormSector(sector);
        }
        updateDataReady(true);
        setHasTimeout(false);
        
        toast.warning("Carregamento parcial", {
          description: "Alguns dados podem estar usando valores padrão devido ao tempo de carregamento excedido."
        });
      }
    }, maxLoadTime);
    
    return () => clearTimeout(timer);
  }, [loading, formSector, defaultSector, sector, maxLoadTime, updateDataReady]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) {
        setHasTimeout(true);
      }
    }, 15000);
    
    return () => clearTimeout(timer);
  }, [loading]);

  useEffect(() => {
    if (!loading) {
      if (isEditing && sector) {
        setFormSector(sector);
        updateDataReady(true);
      } else if (!isEditing && defaultSector) {
        setFormSector(defaultSector);
        updateDataReady(true);
      }
    }
  }, [sector, defaultSector, isEditing, loading, updateDataReady]);

  const handleForceRefresh = () => {
    setForceRefreshing(true);
    window.location.reload();
  };

  if (!loading && formSector) {
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
                onSubmit={(data) => handleSubmit(data, isEditing, sector?.id)}
                mode="create"
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

  if (hasTimeout || forceRefreshing) {
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
            services={services}
            connectionStatus={connectionStatus}
            defaultSector={defaultSector}
            sector={sector}
            errorMessage={errorMessage}
            onRetry={handleForceRefresh}
            onBack={() => navigate('/peritagem')}
          />
        </div>
      </PageLayoutWrapper>
    );
  }

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
