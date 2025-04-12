
import PageLayout from "@/components/layout/PageLayout";
import { useNavigate, useParams } from "react-router-dom";
import { useApi } from "@/contexts/ApiContextExtended";
import SectorForm from "@/components/sectors/SectorForm";
import { Sector, Service } from "@/types";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export default function CheckagemForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getSectorById, updateSector } = useApi();
  const [sector, setSector] = useState<Sector | undefined>(undefined);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Buscar dados ao carregar o componente
  useEffect(() => {
    const fetchData = async () => {
      if (id) {
        const sectorData = await getSectorById(id);
        setSector(sectorData);
        // Utilizamos os serviços já disponíveis no setor
        if (sectorData?.services) {
          setServices(sectorData.services);
        }
      }
      setLoading(false);
    };
    
    fetchData();
  }, [id, getSectorById]);

  if (loading) {
    return (
      <PageLayout>
        <div className="text-center py-12">
          <h1 className="text-xl font-semibold">Carregando...</h1>
        </div>
      </PageLayout>
    );
  }

  if (!sector) {
    return (
      <PageLayout>
        <div className="text-center py-12">
          <h1 className="text-xl font-bold text-red-500">Setor não encontrado</h1>
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

  if (sector.status !== 'checagemFinalPendente') {
    return (
      <PageLayout>
        <div className="text-center py-12">
          <h1 className="text-xl font-bold text-red-500">
            Este setor não está pendente de checagem
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
      await updateSector(sector.id, data as Partial<Sector>);
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
            services={services}
            onSubmit={handleSubmit}
            formType="exit"
          />
        </div>
      </div>
    </PageLayout>
  );
}
