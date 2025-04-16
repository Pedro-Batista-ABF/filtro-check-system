
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
import { FormValidationAlert } from "@/components/sectors/form-parts/FormValidationAlert";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

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
    hasValidData
  } = usePeritagemData(id);
  
  const { 
    handleSubmit, 
    isSaving, 
    errorMessage: submitError 
  } = usePeritagemSubmit();

  const [formSector, setFormSector] = useState<Sector | null>(null);
  const [dataReady, setDataReady] = useState(false);
  const [hasTimeout, setHasTimeout] = useState(false);

  // Definir timeout de segurança para evitar loading infinito
  useEffect(() => {
    const timer = setTimeout(() => {
      // Se ainda estiver carregando após 20 segundos, mostrar opção de recarregar
      if (loading) {
        console.warn("Timeout de carregamento de página atingido");
        setHasTimeout(true);
      }
    }, 20000);
    
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
      hasValidData
    });
  }, [loading, errorMessage, services, defaultSector, sector, isEditing, hasValidData]);

  // Garantir que temos um setor válido para o formulário
  useEffect(() => {
    if (loading) return;
    
    if (isEditing && sector) {
      setFormSector(sector);
      setDataReady(true);
      console.log("Usando setor existente para edição");
    } else if (!isEditing && defaultSector) {
      setFormSector(defaultSector);
      setDataReady(true);
      console.log("Usando setor padrão para criação");
    } else {
      setDataReady(false);
      console.log("Sem dados de setor válidos");
    }
  }, [sector, defaultSector, isEditing, loading]);

  // Componente de carregamento
  if (loading) {
    return (
      <LoadingState />
    );
  }

  // Caso o carregamento esteja demorando muito
  if (hasTimeout) {
    return (
      <PageLayoutWrapper>
        <div className="space-y-4">
          <PeritagemHeader isEditing={isEditing} />
          <Card className="border-none shadow-lg">
            <div className="p-6">
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <RefreshCw className="h-10 w-10 text-amber-500 mb-4 animate-spin" />
                <h2 className="text-xl font-bold mb-2">Carregamento prolongado</h2>
                <p className="text-gray-600 mb-4">
                  O carregamento está demorando mais do que o esperado. Você pode aguardar mais um pouco ou tentar novamente.
                </p>
                <div className="flex gap-4 mt-2">
                  <Button onClick={() => window.location.reload()} variant="default">
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

  // Componente de erro
  if (errorMessage) {
    return (
      <PageLayoutWrapper>
        <div className="space-y-4">
          <PeritagemHeader isEditing={isEditing} />
          <ErrorMessage message={errorMessage} />
          <div className="flex justify-center mt-4">
            <Button onClick={() => navigate('/peritagem')} variant="outline">
              Voltar para Peritagem
            </Button>
          </div>
        </div>
      </PageLayoutWrapper>
    );
  }

  // Verificação adicional para garantir que temos dados válidos
  if (!formSector || !services || !Array.isArray(services) || services.length === 0) {
    return (
      <PageLayoutWrapper>
        <div className="space-y-4">
          <PeritagemHeader isEditing={isEditing} />
          <Card className="border-none shadow-lg">
            <div className="p-6">
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <AlertCircle className="h-10 w-10 text-amber-500 mb-4" />
                <h2 className="text-xl font-bold mb-2">Dados insuficientes</h2>
                <p className="text-gray-600 mb-4">
                  Não foi possível carregar os dados necessários para a peritagem.
                  {!services || services.length === 0 ? 
                    " Não foram encontrados serviços disponíveis na tabela 'service_types'." : 
                    " Ocorreu um erro ao preparar o formulário."}
                </p>
                <div className="flex gap-4 mt-2">
                  <Button onClick={() => window.location.reload()} variant="default">
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

  // Log explícito antes de renderização final
  console.log("🔥 Renderizando formulário completo. Dados carregados com sucesso.");
  console.log("Services:", services.length, "FormSector:", formSector !== null);

  return (
    <PageLayoutWrapper>
      <div className="space-y-6">
        <PeritagemHeader isEditing={isEditing} />
        
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
