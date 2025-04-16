import { useParams, useNavigate } from "react-router-dom";
import SectorForm from "@/components/sectors/SectorForm";
import { Card } from "@/components/ui/card";
import PageLayoutWrapper from "@/components/layout/PageLayoutWrapper";
import { usePeritagemData } from "@/hooks/usePeritagemData";
import { usePeritagemSubmit } from "@/hooks/usePeritagemSubmit";
import PeritagemHeader from "@/components/peritagem/PeritagemHeader";
import ErrorMessage from "@/components/peritagem/ErrorMessage";
import LoadingState from "@/components/peritagem/LoadingState";
import { useEffect, useState } from "react";
import { Sector } from "@/types";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, Bug, Loader2, Wifi, WifiOff } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { checkSupabaseConnection } from "@/utils/serviceUtils";

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
  const [maxLoadTime] = useState(12000); // 12 segundos máximo para carregamento
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  // Verificação extra de autenticação
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
          
          // Verificar conexão com Supabase
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

  // Tentativas de reconexão periódicas se estiver offline
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
      }, 10000); // Tentar a cada 10 segundos
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [connectionStatus]);

  // Definir timeout máximo absoluto
  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading || !formSector) {
        console.warn(`PeritagemForm: Timeout máximo de ${maxLoadTime/1000}s atingido, forçando exibição do formulário`);
        
        // Força a criação de um setor padrão se ainda não existe
        if (!formSector && defaultSector) {
          setFormSector(defaultSector);
          console.log("PeritagemForm: Forçando uso do defaultSector");
        } else if (!formSector && sector) {
          setFormSector(sector);
          console.log("PeritagemForm: Forçando uso do sector");
        } else if (!formSector) {
          // Criar um setor de emergência se nenhum estiver disponível
          const emergencySector: Sector = {
            id: '',
            tagNumber: '',
            tagPhotoUrl: '',
            entryInvoice: '',
            entryDate: new Date().toISOString().split('T')[0],
            peritagemDate: new Date().toISOString().split('T')[0],
            services: services && services.length > 0 ? services : [{
              id: "emergencia_timeout",
              name: "Serviço de Emergência (Timeout)",
              selected: false,
              type: "emergencia_timeout" as any,
              photos: [],
              quantity: 1
            }],
            beforePhotos: [],
            afterPhotos: [],
            scrapPhotos: [],
            productionCompleted: false,
            cycleCount: 1,
            status: 'peritagemPendente',
            outcome: 'EmAndamento',
            updated_at: new Date().toISOString()
          };
          
          setFormSector(emergencySector);
          console.log("PeritagemForm: Criado setor de emergência por timeout");
        }
        
        updateDataReady(true);
        setHasTimeout(false); // Desativa o componente de timeout para mostrar o formulário
        
        toast.warning("Carregamento parcial", {
          description: "Alguns dados podem estar usando valores padrão devido ao tempo de carregamento excedido."
        });
      }
    }, maxLoadTime);
    
    return () => clearTimeout(timer);
  }, [loading, formSector, defaultSector, sector, services, maxLoadTime, updateDataReady]);

  // Timeout de segurança para mostrar opção de recarregar
  useEffect(() => {
    const timer = setTimeout(() => {
      // Se ainda estiver carregando após o tempo definido, mostrar opção de recarregar
      if (loading) {
        console.warn("PeritagemForm: Timeout de carregamento de página atingido");
        setHasTimeout(true);
      }
    }, 15000);
    
    return () => clearTimeout(timer);
  }, [loading]);

  // Log para diagnóstico
  useEffect(() => {
    console.log("PeritagemForm - Estado atual:", { 
      loading, 
      errorMessage, 
      hasServicos: services?.length || 0,
      temDefaultSector: !!defaultSector,
      temSector: !!sector,
      isEditing,
      hasValidData,
      tempoDecorrido: `${Date.now() - mountTime}ms`,
      authVerified,
      temFormSector: !!formSector,
      connectionStatus
    });
  }, [loading, errorMessage, services, defaultSector, sector, isEditing, hasValidData, mountTime, authVerified, formSector, connectionStatus]);

  // Garantir que temos um setor válido para o formulário
  useEffect(() => {
    if (loading) return;
    
    // Atualizar formSector assim que tivermos dados disponíveis
    if (isEditing && sector) {
      setFormSector(sector);
      updateDataReady(true);
      console.log("PeritagemForm: Usando setor existente para edição");
    } else if (!isEditing && defaultSector) {
      setFormSector(defaultSector);
      updateDataReady(true);
      console.log("PeritagemForm: Usando setor padrão para criação");
    }
  }, [sector, defaultSector, isEditing, loading, updateDataReady]);

  // Forçar recarregamento da página
  const handleForceRefresh = () => {
    setForceRefreshing(true);
    window.location.reload();
  };

  // Componente para mostrar status de conexão
  const ConnectionStatus = () => (
    <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
      connectionStatus === 'online' ? 'bg-green-100 text-green-800' : 
      connectionStatus === 'offline' ? 'bg-red-100 text-red-800' : 
      'bg-yellow-100 text-yellow-800'
    }`}>
      {connectionStatus === 'online' ? (
        <>
          <Wifi className="h-3 w-3 mr-1" />
          Conectado
        </>
      ) : connectionStatus === 'offline' ? (
        <>
          <WifiOff className="h-3 w-3 mr-1" />
          Desconectado
        </>
      ) : (
        <>
          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
          Verificando
        </>
      )}
    </div>
  );

  // Se temos os dados necessários, mostrar formulário mesmo com erro
  if (!loading && formSector) {
    return (
      <PageLayoutWrapper>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <PeritagemHeader isEditing={isEditing} />
            <ConnectionStatus />
          </div>
          
          {errorMessage && (
            <ErrorMessage message={errorMessage} />
          )}
          
          {submitError && (
            <ErrorMessage message={submitError} />
          )}
          
          {connectionStatus === 'offline' && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <WifiOff className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    Você está trabalhando no modo offline. Suas alterações serão salvas localmente,
                    mas não serão sincronizadas com o servidor até que a conexão seja restaurada.
                  </p>
                </div>
              </div>
            </div>
          )}
          
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

  // Componente de carregamento
  if (loading && !hasTimeout) {
    return (
      <PageLayoutWrapper>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <PeritagemHeader isEditing={isEditing} />
            <ConnectionStatus />
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

  // Caso o carregamento esteja demorando muito
  if (hasTimeout || forceRefreshing) {
    return (
      <PageLayoutWrapper>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <PeritagemHeader isEditing={isEditing} />
            <ConnectionStatus />
          </div>
          <Card className="border-none shadow-lg">
            <div className="p-6">
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <RefreshCw className="h-10 w-10 text-amber-500 mb-4 animate-spin" />
                <h2 className="text-xl font-bold mb-2">
                  {forceRefreshing ? "Recarregando página..." : "Carregamento prolongado"}
                </h2>
                <p className="text-gray-600 mb-4">
                  {forceRefreshing 
                    ? "Aguarde enquanto a página é recarregada..." 
                    : "O carregamento está demorando mais do que o esperado. Você pode aguardar mais um pouco ou tentar novamente."}
                </p>
                <div className="space-y-2 w-full max-w-md">
                  {!forceRefreshing && (
                    <>
                      <Button onClick={handleForceRefresh} variant="default" className="w-full">
                        Tentar novamente
                      </Button>
                      <Button onClick={() => navigate('/peritagem')} variant="outline" className="w-full">
                        Voltar para Peritagem
                      </Button>
                    </>
                  )}
                  <details className="mt-4 text-left border p-2 rounded-md">
                    <summary className="font-medium cursor-pointer">Informações de diagnóstico</summary>
                    <div className="text-xs mt-2 whitespace-pre-wrap bg-gray-50 p-2 rounded">
                      <p>Tempo: {Date.now() - mountTime}ms</p>
                      <p>Autenticado: {authVerified ? 'Sim' : 'Não'}</p>
                      <p>Serviços: {services?.length || 0}</p>
                      <p>Conexão: {connectionStatus}</p>
                      <p>Default Sector: {defaultSector ? 'Sim' : 'Não'}</p>
                      <p>Setor em Edição: {sector ? 'Sim' : 'Não'}</p>
                      <p>Erro: {errorMessage || 'Nenhum'}</p>
                    </div>
                  </details>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </PageLayoutWrapper>
    );
  }

  // Componente de erro
  if (errorMessage) {
    return (
      <PageLayoutWrapper>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <PeritagemHeader isEditing={isEditing} />
            <ConnectionStatus />
          </div>
          <Card className="border-none shadow-lg">
            <div className="p-6">
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <AlertCircle className="h-10 w-10 text-red-500 mb-4" />
                <h2 className="text-xl font-bold mb-2">Erro ao carregar</h2>
                <p className="text-gray-600 mb-4">{errorMessage}</p>
                <div className="flex gap-4 mt-2">
                  <Button onClick={handleForceRefresh} variant="default">
                    Tentar novamente
                  </Button>
                  <Button onClick={() => navigate('/peritagem')} variant="outline">
                    Voltar para Peritagem
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </PageLayoutWrapper>
    );
  }

  // Fallback para qualquer outro caso
  return (
    <PageLayoutWrapper>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <PeritagemHeader isEditing={isEditing} />
          <ConnectionStatus />
        </div>
        <Card className="border-none shadow-lg">
          <div className="p-6">
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <AlertCircle className="h-10 w-10 text-amber-500 mb-4" />
              <h2 className="text-xl font-bold mb-2">Carregando peritagem</h2>
              <p className="text-gray-600 mb-4">
                Aguarde, estamos preparando o formulário...
              </p>
              <div className="flex gap-4 mt-2">
                <Button onClick={handleForceRefresh} variant="default">
                  Tentar novamente
                </Button>
                <Button onClick={() => navigate('/peritagem')} variant="outline">
                  Voltar para Peritagem
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </PageLayoutWrapper>
  );
}
