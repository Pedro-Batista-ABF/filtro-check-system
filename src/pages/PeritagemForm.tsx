
import { useNavigate, useParams } from "react-router-dom";
import { useApi } from "@/contexts/ApiContextExtended";
import SectorForm from "@/components/sectors/SectorForm";
import { Sector, Service } from "@/types";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import PageLayoutWrapper from "@/components/layout/PageLayoutWrapper";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function PeritagemForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getSectorById, addSector, updateSector, getDefaultServices } = useApi();
  const [sector, setSector] = useState<Sector | undefined>(undefined);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  // Buscar dados ao carregar o componente
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Carregar lista de serviços
        const defaultServices = await getDefaultServices();
        setServices(defaultServices);
        
        // Se tem ID, buscar o setor
        if (id) {
          const sectorData = await getSectorById(id);
          setSector(sectorData);
          
          if (!sectorData) {
            console.warn(`Setor com ID ${id} não encontrado.`);
            navigate('/peritagem/novo', { replace: true });
          }
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, getSectorById, navigate, getDefaultServices]);
  
  const isEditing = !!sector;

  if (loading) {
    return (
      <PageLayoutWrapper>
        <div className="text-center py-12">
          <h1 className="text-xl font-semibold">Carregando...</h1>
        </div>
      </PageLayoutWrapper>
    );
  }

  const handleSubmit = async (data: Partial<Sector>) => {
    try {
      // Verificar se a foto do TAG foi adicionada
      if (!data.tagPhotoUrl) {
        toast({
          title: "Foto do TAG obrigatória",
          description: "Por favor, adicione uma foto do TAG do setor",
          variant: "destructive"
        });
        return;
      }

      // Definir data da peritagem como hoje se for nova peritagem
      if (!isEditing) {
        data.peritagemDate = format(new Date(), 'yyyy-MM-dd');
        data.status = 'emExecucao';
      }

      // Verificar se pelo menos um serviço foi selecionado
      const hasSelectedService = data.services?.some(service => service.selected);
      if (!hasSelectedService) {
        toast({
          title: "Serviço obrigatório",
          description: "Selecione pelo menos um serviço",
          variant: "destructive"
        });
        return;
      }

      if (isEditing && sector) {
        await updateSector(sector.id, data);
      } else {
        await addSector(data as Omit<Sector, 'id'>);
      }
      navigate('/peritagem');
    } catch (error) {
      console.error('Error saving sector:', error);
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar os dados do setor",
        variant: "destructive"
      });
    }
  };

  // Definir a data da peritagem como a data atual no formato ISO
  const currentDate = format(new Date(), 'yyyy-MM-dd');

  const defaultSector: Sector = {
    id: '',
    tagNumber: '',
    tagPhotoUrl: '',
    entryInvoice: '',
    entryDate: '',
    peritagemDate: currentDate,
    services: services,
    beforePhotos: [],
    productionCompleted: false,
    cycleCount: 1,
    status: 'peritagemPendente'
  };

  return (
    <PageLayoutWrapper>
      <div className="space-y-6">
        <div className="flex items-center space-x-3 pb-2 border-b">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/peritagem')}
            className="hover:bg-primary/10"
          >
            <ArrowLeft className="h-5 w-5 text-primary" />
          </Button>
          <h1 className="text-2xl font-bold text-primary">
            {isEditing ? 'Editar Peritagem' : 'Nova Peritagem'}
          </h1>
        </div>
        
        <Card className="border-none shadow-lg">
          <div className="p-6">
            <SectorForm 
              sector={sector || defaultSector}
              onSubmit={handleSubmit}
              mode="review"
              photoRequired={true}
            />
          </div>
        </Card>
      </div>
    </PageLayoutWrapper>
  );
}
