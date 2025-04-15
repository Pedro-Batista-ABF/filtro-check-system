
import { useParams } from "react-router-dom";
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

export default function PeritagemForm() {
  const { id } = useParams<{ id: string }>();
  const { 
    sector, 
    defaultSector, 
    loading, 
    errorMessage, 
    isEditing,
    services 
  } = usePeritagemData(id);
  
  const { 
    handleSubmit, 
    isSaving, 
    errorMessage: submitError 
  } = usePeritagemSubmit();

  const [formSector, setFormSector] = useState<Sector | null>(null);

  // Garantir que temos um setor válido para o formulário
  useEffect(() => {
    if (isEditing && sector) {
      setFormSector(sector);
    } else if (!isEditing && defaultSector) {
      setFormSector(defaultSector);
    }
  }, [sector, defaultSector, isEditing]);

  if (loading) {
    return <LoadingState />;
  }

  // Validação adicional para garantir que temos dados válidos
  if (!formSector && !loading) {
    console.error("Sem dados de setor disponíveis para renderizar o formulário");
    return (
      <PageLayoutWrapper>
        <ErrorMessage message="Não foi possível carregar os dados necessários. Por favor, tente novamente." />
      </PageLayoutWrapper>
    );
  }

  return (
    <PageLayoutWrapper>
      <div className="space-y-6">
        <PeritagemHeader isEditing={isEditing} />
        
        {(errorMessage || submitError) && (
          <ErrorMessage message={errorMessage || submitError || ""} />
        )}
        
        <Card className="border-none shadow-lg">
          <div className="p-6">
            {formSector && (
              <SectorForm 
                sector={formSector}
                onSubmit={(data) => handleSubmit(data, isEditing, sector?.id)}
                mode="create"
                photoRequired={true}
                isLoading={isSaving}
              />
            )}
          </div>
        </Card>
      </div>
    </PageLayoutWrapper>
  );
}
