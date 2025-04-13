
import { useState, useEffect } from "react";
import { useApi } from "@/contexts/ApiContextExtended";
import { Sector, Service } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

export function usePeritagemData(id?: string) {
  const [sector, setSector] = useState<Sector | undefined>(undefined);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { getSectorById, getDefaultServices } = useApi();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Carregar lista de serviços
        const defaultServices = await getDefaultServices();
        
        if (!defaultServices || defaultServices.length === 0) {
          console.error("Não foi possível carregar os serviços padrão");
          throw new Error("Não foi possível carregar os serviços disponíveis");
        }
        
        setServices(defaultServices);
        
        // Se tem ID, buscar o setor
        if (id) {
          const sectorData = await getSectorById(id);
          
          if (!sectorData) {
            console.warn(`Setor com ID ${id} não encontrado.`);
            toast({
              title: "Setor não encontrado",
              description: `O setor com ID ${id} não foi encontrado.`,
              variant: "destructive"
            });
            navigate('/peritagem/novo', { replace: true });
            return;
          }
          
          setSector(sectorData);
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        setErrorMessage("Não foi possível carregar os dados necessários para a peritagem");
        toast({
          title: "Erro de carregamento",
          description: "Não foi possível carregar os dados necessários para a peritagem",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, getSectorById, navigate, getDefaultServices, toast]);

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
    status: 'peritagemPendente',
    outcome: 'EmAndamento'
  };

  return {
    sector,
    services,
    loading,
    errorMessage,
    setErrorMessage,
    defaultSector,
    isEditing: !!sector
  };
}
