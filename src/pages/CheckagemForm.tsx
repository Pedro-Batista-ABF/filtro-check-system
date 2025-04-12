
import PageLayout from "@/components/layout/PageLayout";
import { useNavigate, useParams } from "react-router-dom";
import { useApi } from "@/contexts/ApiContext";
import SectorForm from "@/components/sectors/SectorForm";
import { Sector } from "@/types";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CheckagemForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getSectorById, updateSector, getDefaultServices } = useApi();
  
  const sector = id ? getSectorById(id) : undefined;

  if (!sector || sector.status !== 'checagemFinalPendente') {
    return (
      <PageLayout>
        <div className="text-center py-12">
          <h1 className="text-xl font-bold text-red-500">
            {!sector ? 'Setor não encontrado' : 'Este setor não está pendente de checagem'}
          </h1>
          <Button 
            onClick={() => navigate('/checagem')} 
            className="mt-4"
            variant="outline"
          >
            Voltar para Checagem
          </Button>
        </div>
      </PageLayout>
    );
  }

  const handleSubmit = async (data: Omit<Sector, 'id'>) => {
    try {
      await updateSector({ ...sector, ...data } as Sector);
      navigate('/checagem');
    } catch (error) {
      console.error('Error updating sector:', error);
    }
  };

  return (
    <PageLayout>
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => navigate('/checagem')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="page-title">Checagem Final</h1>
        </div>
        
        <div className="form-container">
          <SectorForm 
            defaultValues={sector}
            services={getDefaultServices()}
            onSubmit={handleSubmit}
            formType="exit"
          />
        </div>
      </div>
    </PageLayout>
  );
}
