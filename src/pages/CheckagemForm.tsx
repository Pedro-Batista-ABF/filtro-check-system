
import { useNavigate, useParams } from "react-router-dom";
import { useApi } from "@/contexts/ApiContextExtended";
import SectorForm from "@/components/sectors/SectorForm";
import { Sector } from "@/types";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import PageLayoutWrapper from "@/components/layout/PageLayoutWrapper";

export default function CheckagemForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getSectorById, updateSector } = useApi();
  const [sector, setSector] = useState<Sector | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  
  // Buscar dados ao carregar o componente
  useEffect(() => {
    const fetchData = async () => {
      if (id) {
        const sectorData = await getSectorById(id);
        setSector(sectorData);
      }
      setLoading(false);
    };
    
    fetchData();
  }, [id, getSectorById]);

  if (loading) {
    return (
      <PageLayoutWrapper>
        <div className="text-center py-12">
          <h1 className="text-xl font-semibold">Carregando...</h1>
        </div>
      </PageLayoutWrapper>
    );
  }

  if (!sector) {
    return (
      <PageLayoutWrapper>
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
      </PageLayoutWrapper>
    );
  }

  if (sector.status !== 'checagemFinalPendente') {
    return (
      <PageLayoutWrapper>
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
      </PageLayoutWrapper>
    );
  }

  const handleSubmit = async (data: Partial<Sector>) => {
    try {
      await updateSector(sector.id, data);
      navigate('/checagem');
    } catch (error) {
      console.error('Error updating sector:', error);
    }
  };

  return (
    <PageLayoutWrapper>
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
            sector={sector}
            onSubmit={handleSubmit}
            mode="quality"
          />
        </div>
      </div>
    </PageLayoutWrapper>
  );
}
