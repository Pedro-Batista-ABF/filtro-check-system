
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
import { AlertCircle, RefreshCw, Bug, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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
    setLoading: updateLoadingState
  } = usePeritagemData(id);
  
  const { 
    handleSubmit, 
    isSaving, 
    errorMessage: submitError 
  } = usePeritagemSubmit();

  const [formSector, setFormSector] = useState<Sector | null>(null);
  const [dataReady, setDataReady] = useState(false);
  const [hasTimeout, setHasTimeout] = useState(false);
  const [mountTime] = useState(Date.now());
  const [forceRefreshing, setForceRefreshing] = useState(false);
  const [authVerified, setAuthVerified] = useState(false);
  const [maxLoadTime] = useState(12000); // 12 segundos máximo para carregamento

  // Verificação extra de autenticação
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const isAuth = !!data.session?.user;
        setAuthVerified(isAuth);
        
        if (!isAuth) {
          console.error("PeritagemForm: Usuário não autenticado na verificação direta");
          toast.error("Sessão expirada", {
            description: "Faça login novamente para continuar"
          });
          navigate('/login');
        } else {
          console.log("PeritagemForm: Autenticação verificada diretamente:", data.session.user.id);
        }
      } catch (error) {
        console.error("PeritagemForm: Erro ao verificar autenticação:", error);
      }
    };
    
    checkAuth();
  }, []);

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
        
        setDataReady(true);
        setLoading(false);
        setHasTimeout(false); // Desativa o componente de timeout para mostrar o formulário
        
        toast.warning("Carregamento parcial", {
          description: "Alguns dados podem estar usando valores padrão devido ao tempo de carregamento excedido."
        });
      }
    }, maxLoadTime);
    
    return () => clearTimeout(timer);
  }, [loading, formSector, defaultSector, sector, services, maxLoadTime]);

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
  }, []);

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
      temFormSector: !!formSector
    });
  }, [loading, errorMessage, services, defaultSector, sector, isEditing, hasValidData, mountTime, authVerified, formSector]);

  // Garantir que temos um setor válido para o formulário
  useEffect(() => {
    if (loading) return;
    
    // Atualizar formSector assim que tivermos dados disponíveis
    if (isEditing && sector) {
      setFormSector(sector);
      setDataReady(true);
      console.log("PeritagemForm: Usando setor existente para edição");
    } else if (!isEditing && defaultSector) {
      setFormSector(defaultSector);
      setDataReady(true);
      console.log("PeritagemForm: Usando setor padrão para criação");
    }
  }, [sector, defaultSector, isEditing, loading]);

  // Forçar recarregamento da página
  const handleForceRefresh = () => {
    setForceRefreshing(true);
    window.location.reload();
  };

  // Se temos os dados necessários, mostrar formulário mesmo com erro
  if (!loading && formSector) {
    return (
      <PageLayoutWrapper>
        <div className="space-y-6">
          <PeritagemHeader isEditing={isEditing} />
          
          {errorMessage && (
            <ErrorMessage message={errorMessage} />
          )}
          
          {submitError && (
            <ErrorMessage message={submitError} />
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
          <PeritagemHeader isEditing={isEditing} />
          <LoadingState 
            message="Carregando formulário de peritagem" 
            showTiming={true} 
            details="Buscando tipos de serviços e preparando formulário..."
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
          <PeritagemHeader isEditing={isEditing} />
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
          <PeritagemHeader isEditing={isEditing} />
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
        <PeritagemHeader isEditing={isEditing} />
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
