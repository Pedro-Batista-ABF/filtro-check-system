
import { useState, useEffect } from "react";
import { useApi } from "@/contexts/ApiContextExtended";
import { Sector, Service, Photo, ServiceType } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ensureUserProfile } from "@/utils/ensureUserProfile";
import { supabase } from "@/integrations/supabase/client";

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
        
        // Verificar e criar o perfil do usuário se necessário
        try {
          console.log("⏳ Verificando perfil de usuário antes de carregar dados...");
          await ensureUserProfile();
          console.log("✅ Perfil de usuário verificado com sucesso");
        } catch (profileError) {
          console.error("❌ Erro ao verificar perfil:", profileError);
          toast({
            title: "Erro de autenticação",
            description: profileError instanceof Error ? profileError.message : "Erro desconhecido de autenticação",
            variant: "destructive"
          });
          throw profileError;
        }
        
        // Carregar lista de serviços
        const defaultServices = await getDefaultServices();
        
        if (!defaultServices || defaultServices.length === 0) {
          console.error("Não foi possível carregar os serviços padrão");
          throw new Error("Não foi possível carregar os serviços disponíveis");
        }
        
        // Processa os serviços para garantir tipagens corretas
        const processedServices: Service[] = defaultServices.map(service => ({
          id: service.id,
          name: service.name,
          selected: false,
          type: service.id as ServiceType,
          photos: []
        }));
        
        setServices(processedServices);
        
        // Se tem ID, buscar o setor
        if (id) {
          console.log("Buscando setor pelo ID:", id);
          
          // Primeiro tentar a função do contexto
          let sectorData = await getSectorById(id);
          
          // Se falhar, tentar buscar diretamente do Supabase
          if (!sectorData) {
            try {
              console.log(`Setor com ID ${id} não encontrado via getSectorById. Tentando buscar diretamente do Supabase...`);
              
              // Buscar o setor
              const { data: sectorDb, error: sectorError } = await supabase
                .from('sectors')
                .select('*')
                .eq('id', id)
                .single();
                
              if (sectorError || !sectorDb) {
                console.warn(`Setor com ID ${id} não encontrado no Supabase.`);
                toast({
                  title: "Setor não encontrado",
                  description: `O setor com ID ${id} não foi encontrado.`,
                  variant: "destructive"
                });
                navigate('/peritagem/novo', { replace: true });
                return;
              }
              
              // Buscar o ciclo atual do setor
              const { data: cycleData, error: cycleError } = await supabase
                .from('cycles')
                .select('*')
                .eq('sector_id', id)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();
              
              if (cycleError) {
                console.warn(`Ciclo para o setor ${id} não encontrado.`);
                // Criar um setor mínimo apenas com dados básicos
                const minimalSector: Sector = {
                  id: sectorDb.id,
                  tagNumber: sectorDb.tag_number,
                  tagPhotoUrl: sectorDb.tag_photo_url || undefined,
                  entryInvoice: "Pendente",
                  entryDate: new Date().toISOString().split('T')[0],
                  peritagemDate: format(new Date(), 'yyyy-MM-dd'),
                  services: processedServices,
                  beforePhotos: [],
                  afterPhotos: [],
                  productionCompleted: false,
                  status: sectorDb.current_status as any || 'peritagemPendente',
                  outcome: sectorDb.current_outcome as any || 'EmAndamento',
                  cycleCount: sectorDb.cycle_count || 1,
                  updated_at: new Date().toISOString()
                };
                
                setSector(minimalSector);
                return;
              }
              
              // Buscar serviços associados ao ciclo
              const { data: cycleServicesData, error: servicesError } = await supabase
                .from('cycle_services')
                .select('*')
                .eq('cycle_id', cycleData.id);
              
              if (servicesError) {
                console.warn(`Erro ao buscar serviços para o ciclo ${cycleData.id}:`, servicesError);
              }
              
              // Buscar fotos associadas ao ciclo
              const { data: photosData, error: photosError } = await supabase
                .from('photos')
                .select('*')
                .eq('cycle_id', cycleData.id);
              
              if (photosError) {
                console.warn(`Erro ao buscar fotos para o ciclo ${cycleData.id}:`, photosError);
              }
              
              // Buscar foto da TAG do setor
              const { data: tagPhotoData, error: tagPhotoError } = await supabase
                .from('photos')
                .select('*')
                .eq('cycle_id', cycleData.id)
                .eq('type', 'tag')
                .maybeSingle();
              
              if (tagPhotoError) {
                console.warn(`Erro ao buscar foto da TAG do setor ${id}:`, tagPhotoError);
              }
              
              // Mapear serviços para o formato esperado pelo frontend
              const servicesWithDetails: Service[] = processedServices.map(service => {
                const cycleService = (cycleServicesData || []).find(cs => cs.service_id === service.id);
                
                // Se o serviço existe no ciclo, adicionar detalhes
                if (cycleService) {
                  const serviceId = service.id;
                  const servicePhotos = (photosData || [])
                    .filter(photo => photo.service_id === serviceId)
                    .map(photo => ({
                      id: photo.id,
                      url: photo.url,
                      type: photo.type as "before" | "after",
                      serviceId: photo.service_id
                    }));
                  
                  return {
                    ...service,
                    selected: cycleService.selected || false,
                    quantity: cycleService.quantity || 1,
                    observations: cycleService.observations || "",
                    photos: servicePhotos
                  };
                }
                
                return service;
              });
              
              // Criar objeto de setor completo
              const completeSector: Sector = {
                id: sectorDb.id,
                tagNumber: sectorDb.tag_number,
                tagPhotoUrl: tagPhotoData?.url || sectorDb.tag_photo_url || undefined,
                entryInvoice: cycleData.entry_invoice || "Pendente",
                entryDate: cycleData.entry_date || new Date().toISOString().split('T')[0],
                peritagemDate: cycleData.peritagem_date || format(new Date(), 'yyyy-MM-dd'),
                services: servicesWithDetails,
                beforePhotos: (photosData || [])
                  .filter(photo => photo.type === 'before' && !photo.service_id)
                  .map(photo => ({
                    id: photo.id,
                    url: photo.url,
                    type: 'before' as const
                  })),
                afterPhotos: (photosData || [])
                  .filter(photo => photo.type === 'after' && !photo.service_id)
                  .map(photo => ({
                    id: photo.id,
                    url: photo.url,
                    type: 'after' as const
                  })),
                productionCompleted: cycleData.production_completed || false,
                status: cycleData.status as any || sectorDb.current_status,
                outcome: cycleData.outcome as any || sectorDb.current_outcome || 'EmAndamento',
                cycleCount: sectorDb.cycle_count || 1,
                entryObservations: cycleData.entry_observations || '',
                updated_at: new Date().toISOString()
              };
              
              console.log("Setor construído com dados do Supabase:", completeSector);
              setSector(completeSector);
              setServices(servicesWithDetails);
            } catch (directError) {
              console.error("Erro ao tentar buscar setor diretamente:", directError);
              toast({
                title: "Erro ao carregar setor",
                description: "Não foi possível carregar os dados do setor.",
                variant: "destructive"
              });
              navigate('/peritagem/novo', { replace: true });
              return;
            }
          } else {
            console.log("Setor encontrado via getSectorById:", sectorData);
            setSector(sectorData);
            
            // Se o setor já tem serviços, atualizar a lista de serviços
            if (sectorData.services && sectorData.services.length > 0) {
              console.log("Usando serviços do setor encontrado:", sectorData.services);
              setServices(sectorData.services);
            } else {
              console.log("Setor não tem serviços, usando serviços padrão");
              // Verifica se o setor está sem serviços mas precisa ter serviços
              if (sectorData.status === 'peritagemPendente' || sectorData.status === 'emExecucao') {
                // Atualiza o setor com os serviços padrão
                setSector({
                  ...sectorData,
                  services: processedServices
                });
              }
            }
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
    afterPhotos: [],
    productionCompleted: false,
    cycleCount: 1,
    status: 'peritagemPendente',
    outcome: 'EmAndamento',
    updated_at: new Date().toISOString()
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
