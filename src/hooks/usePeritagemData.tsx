
import { useState, useEffect } from "react";
import { useApi } from "@/contexts/ApiContextExtended";
import { Sector, Service } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { toast } from "sonner";

// Serviços padrão como fallback caso a API falhe
const DEFAULT_SERVICES: Service[] = [
  { id: 'limpeza', name: 'Limpeza', description: 'Limpeza geral do setor', selected: false, quantity: 1 },
  { id: 'troca_elemento', name: 'Troca de Elemento', description: 'Substituição do elemento filtrante', selected: false, quantity: 1 },
  { id: 'reparo_estrutural', name: 'Reparo Estrutural', description: 'Reparos na estrutura do filtro', selected: false, quantity: 1 },
  { id: 'pintura', name: 'Pintura', description: 'Pintura do setor', selected: false, quantity: 1 },
  { id: 'teste_vazamento', name: 'Teste de Vazamento', description: 'Teste para identificar vazamentos', selected: false, quantity: 1 }
];

export function usePeritagemData(id?: string) {
  const [sector, setSector] = useState<Sector | undefined>(undefined);
  const [services, setServices] = useState<Service[]>(DEFAULT_SERVICES);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { getSectorById, getDefaultServices } = useApi();
  const { toast: uiToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Carregar lista de serviços
        let servicesList: Service[] = [];
        
        try {
          const defaultServices = await getDefaultServices();
          
          if (defaultServices && defaultServices.length > 0) {
            servicesList = defaultServices;
            console.log("Serviços carregados com sucesso:", defaultServices.length);
          } else {
            console.warn("API retornou lista vazia de serviços, usando fallback");
            servicesList = DEFAULT_SERVICES;
            toast.warning("Usando serviços padrão", { 
              description: "Não foi possível carregar os serviços do servidor" 
            });
          }
        } catch (servicesError) {
          console.error("Erro ao carregar serviços:", servicesError);
          servicesList = DEFAULT_SERVICES;
          toast.warning("Usando serviços padrão", { 
            description: "Erro ao carregar serviços do servidor" 
          });
        }
        
        // Atualizar os serviços
        setServices(servicesList);
        
        // Se tem ID, buscar o setor
        if (id) {
          try {
            const sectorData = await getSectorById(id);
            
            if (!sectorData) {
              console.warn(`Setor com ID ${id} não encontrado.`);
              toast.error("Setor não encontrado", {
                description: `O setor com ID ${id} não foi encontrado.`
              });
              navigate('/peritagem/novo', { replace: true });
              return;
            }
            
            setSector(sectorData);
          } catch (sectorError) {
            console.error("Erro ao carregar setor:", sectorError);
            toast.error("Erro ao carregar setor", {
              description: "Não foi possível carregar os dados do setor"
            });
            
            // Não redirecionamos aqui, apenas mostramos o erro
            setErrorMessage("Não foi possível carregar os dados do setor");
          }
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        setErrorMessage("Ocorreu um erro ao carregar os dados necessários");
        uiToast({
          title: "Erro de carregamento",
          description: "Erro ao carregar dados necessários para a peritagem",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, getSectorById, navigate, getDefaultServices, uiToast]);

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
