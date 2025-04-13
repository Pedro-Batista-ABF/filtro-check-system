
import { useParams } from "react-router-dom";
import SectorForm from "@/components/sectors/SectorForm";
import { Card } from "@/components/ui/card";
import PageLayoutWrapper from "@/components/layout/PageLayoutWrapper";
import { usePeritagemData } from "@/hooks/usePeritagemData";
import { usePeritagemSubmit } from "@/hooks/usePeritagemSubmit";
import PeritagemHeader from "@/components/peritagem/PeritagemHeader";
import ErrorMessage from "@/components/peritagem/ErrorMessage";
import LoadingState from "@/components/peritagem/LoadingState";

export default function PeritagemForm() {
  const { id } = useParams<{ id: string }>();
  const { 
    sector, 
    defaultSector, 
    loading, 
    errorMessage, 
    isEditing 
  } = usePeritagemData(id);
  
  const { 
    handleSubmit, 
    isSaving, 
    errorMessage: submitError 
  } = usePeritagemSubmit();

  if (loading) {
    return <LoadingState />;
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
            <SectorForm 
              sector={sector || defaultSector}
              onSubmit={(data) => handleSubmit(data, isEditing, sector?.id)}
              mode="review"
              photoRequired={true}
              loading={isSaving}
            />
          </div>
        </Card>
      </div>
    </PageLayoutWrapper>
  );
}
