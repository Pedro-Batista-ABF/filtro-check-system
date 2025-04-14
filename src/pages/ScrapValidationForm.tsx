import { useNavigate, useParams } from "react-router-dom";
import { useApi } from "@/contexts/ApiContextExtended";
import SectorForm from "@/components/sectors/SectorForm";
import { Sector, Service } from "@/types";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function ScrapValidationForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getSectorById, updateSector, getDefaultServices } = useApi();
  const [sector, setSector] = useState<Sector | undefined>(undefined);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    document.title = "Validação de Sucateamento - Gestão de Recuperação";
    
    const fetchData = async () => {
      try {
        if (id) {
          const sectorData = await getSectorById(id);
          setSector(sectorData);
          const servicesData = await getDefaultServices();
          setServices(servicesData);
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        toast.error("Erro ao carregar dados do setor");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, getSectorById, getDefaultServices]);
  
  if (loading) {
    return (
      <div className="text-center py-12">
        <h1 className="text-xl font-semibold">Carregando...</h1>
      </div>
    );
  }
  
  if (!sector) {
    return (
      <div className="text-center py-12">
        <h1 className="text-xl font-bold text-red-500">
          Setor não encontrado
        </h1>
        <Button 
          onClick={() => navigate('/sucateamento')} 
          className="mt-4"
          variant="outline"
        >
          Voltar para Validação de Sucateamento
        </Button>
      </div>
    );
  }
  
  if (sector.status !== 'sucateadoPendente') {
    return (
      <div className="text-center py-12">
        <h1 className="text-xl font-bold text-red-500">
          Este setor não está pendente de validação de sucateamento
        </h1>
        <Button 
          onClick={() => navigate('/sucateamento')} 
          className="mt-4"
          variant="outline"
        >
          Voltar para Validação de Sucateamento
        </Button>
      </div>
    );
  }

  const handleSubmit = async (data: Partial<Sector>) => {
    try {
      const updates = {
        ...data,
        status: 'sucateado' as const,
        outcome: 'scrapped' as const // Explicitamente definir outcome como 'scrapped'
      };
      await updateSector(sector.id, updates);
      toast.success('Sucateamento validado com sucesso!');
      navigate('/sucateamento');
    } catch (error) {
      console.error('Error saving sector:', error);
      toast.error('Erro ao validar sucateamento');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => navigate('/sucateamento')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="page-title">
          Validação de Sucateamento
        </h1>
      </div>
      
      <Alert variant="destructive" className="bg-red-50 border-red-200">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>TAG: {sector.tagNumber}</AlertTitle>
        <AlertDescription>
          Este setor foi marcado como sucateado durante a peritagem. 
          Por favor, valide o sucateamento e registre a devolução.
        </AlertDescription>
      </Alert>
      
      <div className="form-container">
        <SectorForm 
          sector={sector}
          onSubmit={handleSubmit}
          mode="scrap"
        />
      </div>
    </div>
  );
}
