
import { useNavigate, useParams } from "react-router-dom";
import { useApi } from "@/contexts/ApiContextExtended";
import SectorForm from "@/components/sectors/SectorForm";
import { Sector, Service } from "@/types";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import PageLayoutWrapper from "@/components/layout/PageLayoutWrapper";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function PeritagemForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getSectorById, addSector, updateSector, getDefaultServices } = useApi();
  const [sector, setSector] = useState<Sector | undefined>(undefined);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
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
  
  const isEditing = !!sector;

  if (loading) {
    return (
      <PageLayoutWrapper>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
          <h1 className="text-xl font-semibold">Carregando...</h1>
        </div>
      </PageLayoutWrapper>
    );
  }

  const handleSubmit = async (data: Partial<Sector>) => {
    try {
      setIsSaving(true);
      setErrorMessage(null);
      
      // Verificar se a foto do TAG foi adicionada
      if (!data.tagPhotoUrl) {
        toast({
          title: "Foto do TAG obrigatória",
          description: "Por favor, adicione uma foto do TAG do setor",
          variant: "destructive"
        });
        setIsSaving(false);
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
        setIsSaving(false);
        return;
      }

      // Verificar se todos os serviços selecionados têm pelo menos uma foto de defeito
      const missingPhotoServices = data.services?.filter(
        service => service.selected && (!service.photos || !service.photos.some(p => typeof p === 'object' && p.type === 'before'))
      );

      if (missingPhotoServices && missingPhotoServices.length > 0) {
        toast({
          title: "Fotos de defeito obrigatórias",
          description: `Adicione pelo menos uma foto para cada defeito selecionado: ${missingPhotoServices.map(s => s.name).join(', ')}`,
          variant: "destructive"
        });
        setIsSaving(false);
        return;
      }

      // Garantir que os IDs de serviço estão como ServiceType
      if (data.services) {
        data.services = data.services.map(service => ({
          ...service,
          type: service.id as any  // Garantir que type é definido como o ID do serviço
        }));
      }

      // Processar as fotos
      if (data.services) {
        // Inicializar beforePhotos se necessário
        data.beforePhotos = data.beforePhotos || [];
        
        // Para cada serviço com fotos, adicionar as fotos à coleção principal
        for (const service of data.services) {
          if (service.photos && service.photos.length > 0) {
            // Filtrar apenas fotos do tipo "before"
            const beforePhotos = service.photos.filter(photo => 
              typeof photo === 'object' && photo.type === 'before'
            );
            
            // Adicionar serviceId às fotos
            const processedPhotos = beforePhotos.map(photo => ({
              ...photo,
              serviceId: service.id
            }));
            
            // Adicionar à coleção principal
            data.beforePhotos = [...data.beforePhotos, ...processedPhotos];
          }
        }
      }

      if (isEditing && sector) {
        await updateSector(sector.id, data);
        toast({
          title: "Peritagem atualizada",
          description: "A peritagem foi atualizada com sucesso."
        });
      } else {
        await addSector(data as Omit<Sector, 'id'>);
        toast({
          title: "Peritagem registrada",
          description: "Nova peritagem registrada com sucesso."
        });
      }
      navigate('/peritagem');
    } catch (error) {
      console.error('Error saving sector:', error);
      
      // Mensagem de erro mais específica
      let errorMsg = "Ocorreu um erro ao salvar os dados do setor";
      
      if (error instanceof Error) {
        errorMsg = error.message;
        setErrorMessage(errorMsg);
      }
      
      toast({
        title: "Erro ao salvar",
        description: errorMsg,
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
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
        
        {errorMessage && (
          <Alert variant="destructive" className="bg-red-50 border-red-200">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro encontrado</AlertTitle>
            <AlertDescription>
              <p>{errorMessage}</p>
              <p className="text-sm mt-2">
                Se o erro persistir, entre em contato com o suporte técnico.
              </p>
            </AlertDescription>
          </Alert>
        )}
        
        <Card className="border-none shadow-lg">
          <div className="p-6">
            <SectorForm 
              sector={sector || defaultSector}
              onSubmit={handleSubmit}
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
