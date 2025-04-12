
import PageLayout from "@/components/layout/PageLayout";
import { useNavigate, useParams } from "react-router-dom";
import { useApi } from "@/contexts/ApiContext";
import SectorForm from "@/components/sectors/SectorForm";
import { Sector } from "@/types";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PeritagemForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getSectorById, createSector, updateSector, getDefaultServices } = useApi();
  
  const sector = id ? getSectorById(id) : undefined;
  const isEditing = !!sector;

  const handleSubmit = async (data: Omit<Sector, 'id'>) => {
    try {
      if (isEditing && sector) {
        await updateSector({ ...sector, ...data } as Sector);
      } else {
        await createSector(data);
      }
      navigate('/peritagem');
    } catch (error) {
      console.error('Error saving sector:', error);
    }
  };

  return (
    <PageLayout>
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => navigate('/peritagem')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="page-title">
            {isEditing ? 'Editar Peritagem' : 'Nova Peritagem'}
          </h1>
        </div>
        
        <div className="form-container">
          <SectorForm 
            defaultValues={sector}
            services={getDefaultServices()}
            onSubmit={handleSubmit}
            formType="entry"
          />
        </div>
      </div>
    </PageLayout>
  );
}
