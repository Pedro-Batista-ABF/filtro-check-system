
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useApi } from "@/contexts/ApiContextExtended";
import { useAuth } from "@/contexts/AuthContext";
import PageLayoutWrapper from "@/components/layout/PageLayoutWrapper";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save } from "lucide-react";
import { Sector, Photo, Service } from "@/types";
import { useSectorStatus } from "@/hooks/useSectorStatus";
import { toast } from "sonner";
import QualityForm from "@/components/sectors/forms/QualityForm";
import { useSectorPhotoHandling } from "@/hooks/useSectorPhotoHandling";
import { supabase } from "@/integrations/supabase/client";

export default function CheckagemDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getSector, refreshData } = useApi();
  const { user } = useAuth();
  const { updateSectorStatus } = useSectorStatus();
  
  const [sector, setSector] = useState<Sector | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedTab, setSelectedTab] = useState("services");
  
  const [exitDate, setExitDate] = useState<Date | undefined>(undefined);
  const [exitInvoice, setExitInvoice] = useState("");
  const [exitObservations, setExitObservations] = useState("");
  const [qualityCompleted, setQualityCompleted] = useState(false);
  
  const [formErrors, setFormErrors] = useState({
    photos: false,
    exitDate: false,
    exitInvoice: false,
    exitObservations: false
  });

  const { handlePhotoUpload } = useSectorPhotoHandling(services, setServices);
  
  // Verificar se todos os serviços têm fotos "after"
  const hasAfterPhotosForAllServices = services.every(service => 
    service.photos && service.photos.some(photo => photo.type === 'after')
  );

  useEffect(() => {
    const loadSector = async () => {
      try {
        setLoading(true);
        
        if (!id) {
          navigate('/checagem');
          return;
        }
        
        // Carregar informações do setor
        const sectorData = await getSector(id);
        
        if (!sectorData || sectorData.status !== 'checagemFinalPendente') {
          toast.error("Setor não encontrado ou não está pendente de checagem");
          navigate('/checagem');
          return;
        }
        
        setSector(sectorData);
        
        // Carregar serviços do ciclo atual
        if (sectorData.cycleId) {
          const { data: servicesData, error: servicesError } = await supabase
            .from('cycle_services')
            .select('*')
            .eq('cycle_id', sectorData.cycleId)
            .eq('selected', true);
            
          if (servicesError) {
            console.error("Erro ao carregar serviços:", servicesError);
            toast.error("Erro ao carregar serviços");
            return;
          }
          
          if (servicesData) {
            // Buscar fotos para cada serviço
            const servicesWithPhotos = await Promise.all(servicesData.map(async (service) => {
              const { data: photosData } = await supabase
                .from('photos')
                .select('*')
                .eq('cycle_id', sectorData.cycleId)
                .eq('service_id', service.service_id);
                
              return {
                id: service.service_id,
                name: service.service_id, // Este campo pode ser atualizado posteriormente com o nome real
                selected: service.selected,
                quantity: service.quantity || 1,
                observations: service.observations || "",
                completed: service.completed || false,
                photos: photosData || []
              } as Service;
            }));
            
            setServices(servicesWithPhotos);
          }
        }
        
        // Carregar dados de saída
        if (sectorData.exitInvoice) setExitInvoice(sectorData.exitInvoice);
        if (sectorData.exitDate) setExitDate(new Date(sectorData.exitDate));
        if (sectorData.exitObservations) setExitObservations(sectorData.exitObservations);
        
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        toast.error("Erro ao carregar dados do setor");
      } finally {
        setLoading(false);
      }
    };
    
    loadSector();
  }, [id, getSector, navigate]);
  
  const validateForm = () => {
    const errors = {
      photos: !hasAfterPhotosForAllServices,
      exitDate: !exitDate,
      exitInvoice: !exitInvoice.trim(),
      exitObservations: false
    };
    
    setFormErrors(errors);
    
    return !Object.values(errors).some(Boolean);
  };
  
  const handleSubmit = async () => {
    try {
      if (!validateForm()) {
        toast.error("Por favor, corrija os erros no formulário");
        return;
      }
      
      if (!sector || !id || !user) {
        toast.error("Dados incompletos");
        return;
      }
      
      setSaving(true);
      
      // Atualizar dados do setor
      const sectorData: Partial<Sector> = {
        exitDate,
        exitInvoice,
        exitObservations,
        services
      };
      
      // Atualizar ciclo
      if (sector.cycleId) {
        await supabase
          .from('cycles')
          .update({
            exit_date: exitDate?.toISOString(),
            exit_invoice: exitInvoice,
            exit_observations: exitObservations,
            status: qualityCompleted ? 'concluido' : 'checagemFinalPendente',
            updated_at: new Date().toISOString(),
            updated_by: user.id
          })
          .eq('id', sector.cycleId);
      }
      
      // Atualizar status do setor se concluído
      if (qualityCompleted) {
        await updateSectorStatus(id, sectorData, 'concluido');
      }
      
      // Atualizar fotos no banco de dados
      // Implementação simplificada - aqui você adicionaria a lógica completa
      
      await refreshData();
      
      toast.success(qualityCompleted ? "Checagem final concluída" : "Checagem final salva");
      navigate('/checagem');
      
    } catch (error) {
      console.error("Erro ao salvar checagem:", error);
      toast.error("Erro ao salvar checagem final");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <PageLayoutWrapper>
        <div className="flex justify-center items-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </PageLayoutWrapper>
    );
  }

  return (
    <PageLayoutWrapper>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={() => navigate('/checagem')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
            <h1 className="text-2xl font-bold">
              Checagem Final - TAG {sector?.tagNumber}
            </h1>
          </div>
          
          <div className="flex space-x-2">
            <Button
              variant="default"
              className="ml-auto"
              onClick={handleSubmit}
              disabled={saving}
            >
              <Save className="mr-2 h-4 w-4" />
              {saving ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </div>

        <Card className="p-6">
          {sector && (
            <QualityForm
              services={services}
              selectedTab={selectedTab}
              setSelectedTab={setSelectedTab}
              exitDate={exitDate}
              setExitDate={setExitDate}
              exitInvoice={exitInvoice}
              setExitInvoice={setExitInvoice}
              exitObservations={exitObservations}
              setExitObservations={setExitObservations}
              qualityCompleted={qualityCompleted}
              setQualityCompleted={setQualityCompleted}
              handlePhotoUpload={handlePhotoUpload}
              formErrors={formErrors}
              hasAfterPhotosForAllServices={hasAfterPhotosForAllServices}
            />
          )}
        </Card>
      </div>
    </PageLayoutWrapper>
  );
}
