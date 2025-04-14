import React, { useState, useEffect } from "react";
import { Sector, Service, Cycle, Photo, CycleOutcome } from "@/types";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button"; 

// Import our new component files
import ReviewForm from "./forms/ReviewForm";
import ProductionForm from "./forms/ProductionForm";
import QualityForm from "./forms/QualityForm";
import ScrapForm from "./forms/ScrapForm";

interface SectorFormProps {
  sector: Sector;
  onSubmit: (sector: Sector) => void;
  loading?: boolean;
  mode: 'review' | 'production' | 'quality' | 'scrap';
  services?: Service[]; 
  formType?: string;    
  photoRequired?: boolean;
}

export default function SectorForm({
  sector: initialSector,
  onSubmit,
  loading = false,
  mode,
  services: initialServices,
  photoRequired = false
}: SectorFormProps) {
  const [sector, setSector] = useState<Sector>(initialSector);
  const [services, setServices] = useState<Service[]>(initialServices || initialSector.services || []);
  const [exitDate, setExitDate] = useState<Date | undefined>(
    sector.exitDate ? new Date(sector.exitDate) : undefined
  );
  const [exitInvoice, setExitInvoice] = useState(sector.exitInvoice || "");
  const [exitObservations, setExitObservations] = useState(sector.exitObservations || "");
  const [selectedTab, setSelectedTab] = useState("services");
  const [tagNumber, setTagNumber] = useState(sector.tagNumber || "");
  const [entryInvoice, setEntryInvoice] = useState(sector.entryInvoice || "");
  const [entryDate, setEntryDate] = useState<Date | undefined>(
    sector.entryDate ? new Date(sector.entryDate) : new Date()
  );
  const [tagPhotoUrl, setTagPhotoUrl] = useState<string | undefined>(sector.tagPhotoUrl);
  const [entryObservations, setEntryObservations] = useState(sector.entryObservations || "");
  const [productionCompleted, setProductionCompleted] = useState(
    initialSector.status === "checagemFinalPendente" || 
    initialSector.status === "concluido" ||
    initialSector.status === "sucateado"
  );
  const [qualityCompleted, setQualityCompleted] = useState(
    initialSector.status === "concluido" ||
    initialSector.status === "sucateado"
  );

  // Para sucateamento
  const [isScrap, setIsScrap] = useState(false);
  const [scrapObservations, setScrapObservations] = useState(sector.scrapObservations || "");
  const [scrapDate, setScrapDate] = useState<Date | undefined>(
    sector.scrapReturnDate ? new Date(sector.scrapReturnDate) : new Date()
  );
  const [scrapInvoice, setScrapInvoice] = useState(sector.scrapReturnInvoice || "");

  const { toast: shadcnToast } = useToast();

  // Form validation
  const [formErrors, setFormErrors] = useState({
    services: false,
    photos: false,
    exitDate: false,
    exitInvoice: false,
    exitObservations: false,
    scrapObservations: false,
    scrapDate: false,
    scrapInvoice: false,
    tagNumber: false,
    tagPhoto: false,
    entryInvoice: false,
    entryDate: false
  });

  // Manipulador para upload de foto do TAG
  const handleTagPhotoUpload = (files: FileList) => {
    if (files.length > 0) {
      const file = files[0];
      const url = URL.createObjectURL(file);
      setTagPhotoUrl(url);
    }
  };

  // Check if all selected services have photos
  const checkServicePhotos = () => {
    if (mode !== 'quality') return true;
    
    let allPhotosValid = true;
    const selectedServiceIds = services.filter(s => s.selected).map(s => s.id);
    
    selectedServiceIds.forEach(serviceId => {
      const service = services.find(s => s.id === serviceId);
      const hasAfterPhoto = service?.photos?.some(p => typeof p === 'object' && p.type === 'after');
      if (!hasAfterPhoto) {
        allPhotosValid = false;
      }
    });
    
    return allPhotosValid;
  };

  // Verifica se os serviços selecionados têm fotos (para modo peritagem)
  const checkBeforePhotos = () => {
    if (mode !== 'review') return true;
    
    let allValid = true;
    const selectedServices = services.filter(s => s.selected);
    
    // Se não há serviços selecionados, não é necessário validar fotos
    if (selectedServices.length === 0) return true;
    
    selectedServices.forEach(service => {
      const hasBeforePhoto = service.photos?.some(p => typeof p === 'object' && p.type === 'before');
      if (!hasBeforePhoto) {
        allValid = false;
      }
    });
    
    return allValid;
  };

  const handleServiceChange = (id: string, checked: boolean) => {
    setServices(prev => 
      prev.map(service => 
        service.id === id 
          ? { ...service, selected: checked } 
          : service
      )
    );
  };

  const handleQuantityChange = (id: string, quantity: number) => {
    setServices(prev => 
      prev.map(service => 
        service.id === id 
          ? { ...service, quantity } 
          : service
      )
    );
  };

  const handleObservationChange = (id: string, observations: string) => {
    setServices(prev => 
      prev.map(service => 
        service.id === id 
          ? { ...service, observations } 
          : service
      )
    );
  };

  const handlePhotoUpload = (id: string, files: FileList, type: "before" | "after") => {
    setServices(prev => 
      prev.map(service => {
        if (service.id === id) {
          // Keep existing photos of other types, add new ones
          const existingPhotos = service.photos || [];
          const newPhotos: Photo[] = Array.from(files).map((file, index) => ({
            id: `${id}-${Date.now()}-${index}`,
            url: URL.createObjectURL(file),
            file,
            type
          }));
          
          return { 
            ...service, 
            photos: [...existingPhotos, ...newPhotos] 
          };
        }
        return service;
      })
    );
  };

  const handleProductionToggle = (checked: boolean) => {
    setProductionCompleted(checked);
    
    // Se produção foi marcada como concluída, atualize o status
    if (checked && sector.status === "emExecucao") {
      setSector(prev => ({
        ...prev,
        status: "checagemFinalPendente"
      }));
    }
    // Se produção foi desmarcada, volte ao status anterior
    else if (!checked && sector.status === "checagemFinalPendente") {
      setSector(prev => ({
        ...prev,
        status: "emExecucao"
      }));
    }
  };

  // New function to handle complete peritagem action
  const handleCompletePeritagem = async () => {
    try {
      shadcnToast({
        title: "Finalizando peritagem...",
        description: "Atualizando status do setor para execução"
      });
      
      // Update sector status - usando updated_at em vez de modified_at
      const { error } = await supabase
        .from('sectors')
        .update({ 
          current_status: 'emExecucao',
          updated_at: new Date().toISOString() // Alterado de modified_at para updated_at
        })
        .eq('id', sector.id);
        
      if (error) {
        console.error("Erro na atualização do status:", error);
        throw new Error(`Erro ao finalizar peritagem: ${error.message}`);
      }
      
      // Update local state
      setSector(prev => ({
        ...prev,
        status: "emExecucao"
      }));
      
      shadcnToast({
        title: "Peritagem finalizada!",
        description: "Setor enviado para execução",
        variant: "default"
      });
      
      // Navigate to execution page after a short delay
      setTimeout(() => {
        window.location.href = '/execucao';
      }, 1500);
    } catch (error) {
      console.error("Erro ao finalizar peritagem:", error);
      shadcnToast({
        title: "Erro ao finalizar peritagem",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      });
    }
  };
  
  // Function to handle scrap sector action
  const handleScrapSector = async () => {
    try {
      const scrapReason = prompt("Informe o motivo do sucateamento:");
      
      if (!scrapReason) {
        shadcnToast({
          title: "Operação cancelada",
          description: "É necessário informar o motivo do sucateamento",
          variant: "default"
        });
        return;
      }
      
      shadcnToast({
        title: "Processando sucateamento...",
        description: "Atualizando status do setor"
      });
      
      // Update sector status - using updated_at instead of modified_at
      const { error } = await supabase
        .from('sectors')
        .update({ 
          current_status: 'sucateado',
          current_outcome: 'scrapped',
          scrap_observations: scrapReason,
          updated_at: new Date().toISOString() // Changed from modified_at to updated_at
        })
        .eq('id', sector.id);
        
      if (error) {
        throw new Error(`Erro ao sucatear setor: ${error.message}`);
      }
      
      shadcnToast({
        title: "Setor sucateado!",
        description: "Enviado para validação na qualidade",
        variant: "default"
      });
      
      // Navigate to quality page after a short delay
      setTimeout(() => {
        window.location.href = '/qualidade';
      }, 1500);
    } catch (error) {
      console.error("Erro ao sucatear setor:", error);
      shadcnToast({
        title: "Erro ao sucatear setor",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      });
    }
  };

  const createCycle = (type: "recovered" | "scrapped", comments: string): Cycle => {
    return {
      id: Date.now().toString(),
      tagNumber: sector.tagNumber,
      entryInvoice: sector.entryInvoice,
      entryDate: sector.entryDate,
      peritagemDate: sector.peritagemDate,
      services: sector.services,
      beforePhotos: sector.beforePhotos || [],
      status: type === "recovered" ? "concluido" : "sucateado",
      outcome: type as CycleOutcome,
      createdAt: new Date().toISOString(),
      comments,
      technicianId: "sistema", // Considere pegar do usuário atual em um sistema real
      productionCompleted: true
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar campos obrigatórios
    const errors = {
      ...formErrors,
      tagNumber: !tagNumber,
      tagPhoto: photoRequired && !tagPhotoUrl,
      entryInvoice: !entryInvoice,
      entryDate: !entryDate,
      services: mode === 'review' && !services.some(s => s.selected),
      photos: mode === 'review' && !checkBeforePhotos() // Verifica fotos apenas se houver serviços selecionados
    };
    
    setFormErrors(errors);
    
    if (Object.values(errors).some(Boolean)) {
      shadcnToast({
        title: "Formulário Incompleto",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }
    
    // Construir objeto do setor atualizado
    const updatedSector = {
      ...sector,
      tagNumber,
      tagPhotoUrl,
      entryInvoice,
      entryDate: entryDate ? format(entryDate, 'yyyy-MM-dd') : '',
      entryObservations,
      services,
    };
    
    // Lógica específica para cada modo
    if (mode === 'production') {
      // Se a produção está concluída, atualize o status
      if (productionCompleted && sector.status === "emExecucao") {
        updatedSector.status = "checagemFinalPendente";
      }
    } 
    else if (mode === 'quality') {
      // Se qualidade está concluída, marque como concluído e adicione dados da saída
      if (qualityCompleted) {
        updatedSector.status = "concluido";
        updatedSector.exitDate = exitDate ? format(exitDate, 'yyyy-MM-dd') : undefined;
        updatedSector.exitInvoice = exitInvoice;
        updatedSector.exitObservations = exitObservations;
        
        // Criar um ciclo para o setor recuperado
        const newCycle: Cycle = {
          id: Date.now().toString(),
          tagNumber: updatedSector.tagNumber,
          entryInvoice: updatedSector.entryInvoice,
          entryDate: updatedSector.entryDate,
          peritagemDate: updatedSector.peritagemDate,
          services: updatedSector.services,
          beforePhotos: updatedSector.beforePhotos || [],
          status: "concluido",
          outcome: "recovered" as CycleOutcome,
          createdAt: new Date().toISOString(),
          comments: exitObservations || "",
          technicianId: "sistema", // Considere pegar do usuário atual em um sistema real
          productionCompleted: true
        };
        
        updatedSector.cycles = [...(sector.cycles || []), newCycle];
      }
    }
    else if (mode === 'scrap') {
      // Marcar como sucateado se necessário
      if (isScrap) {
        updatedSector.status = "sucateado";
        updatedSector.scrapObservations = scrapObservations;
        updatedSector.scrapReturnDate = scrapDate ? format(scrapDate, 'yyyy-MM-dd') : undefined;
        updatedSector.scrapReturnInvoice = scrapInvoice;
        
        // Criar um ciclo para o setor sucateado
        const newCycle: Cycle = {
          id: Date.now().toString(),
          tagNumber: updatedSector.tagNumber,
          entryInvoice: updatedSector.entryInvoice,
          entryDate: updatedSector.entryDate,
          peritagemDate: updatedSector.peritagemDate,
          services: updatedSector.services,
          beforePhotos: updatedSector.beforePhotos || [],
          status: "sucateado",
          outcome: "scrapped" as CycleOutcome,
          createdAt: new Date().toISOString(),
          comments: scrapObservations || "",
          technicianId: "sistema",
          productionCompleted: true
        };
        
        updatedSector.cycles = [...(sector.cycles || []), newCycle];
      }
    }
    
    onSubmit(updatedSector);
  };

  // Renderização condicional com base no modo
  const renderFormContent = () => {
    switch (mode) {
      case 'review':
        return (
          <ReviewForm
            tagNumber={tagNumber}
            setTagNumber={setTagNumber}
            entryInvoice={entryInvoice}
            setEntryInvoice={setEntryInvoice}
            entryDate={entryDate}
            setEntryDate={setEntryDate}
            tagPhotoUrl={tagPhotoUrl}
            handleTagPhotoUpload={handleTagPhotoUpload}
            entryObservations={entryObservations}
            setEntryObservations={setEntryObservations}
            services={services}
            handleServiceChange={handleServiceChange}
            handleQuantityChange={handleQuantityChange}
            handleObservationChange={handleObservationChange}
            handlePhotoUpload={handlePhotoUpload}
            formErrors={formErrors}
            photoRequired={photoRequired}
          />
        );
        
      case 'production':
        return (
          <ProductionForm
            services={services}
            productionCompleted={productionCompleted}
            handleProductionToggle={handleProductionToggle}
            sectorStatus={sector.status}
          />
        );
        
      case 'quality':
        return (
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
          />
        );
        
      case 'scrap':
        return (
          <ScrapForm
            sector={sector}
            isScrap={isScrap}
            setIsScrap={setIsScrap}
            scrapObservations={scrapObservations}
            setScrapObservations={setScrapObservations}
            scrapDate={scrapDate}
            setScrapDate={setScrapDate}
            scrapInvoice={scrapInvoice}
            setScrapInvoice={setScrapInvoice}
            formErrors={formErrors}
          />
        );
        
      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {renderFormContent()}
      
      <div className="flex flex-col-reverse sm:flex-row sm:justify-between sm:space-x-2">
        <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row sm:space-x-2">
          {/* Botão de Sucatear para modo peritagem */}
          {mode === 'review' && initialSector.id && (
            <Button
              type="button"
              variant="destructive"
              onClick={handleScrapSector}
              className="mb-2 sm:mb-0"
            >
              Sucatear setor
            </Button>
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          {/* Botão de finalizar peritagem para modo peritagem */}
          {mode === 'review' && initialSector.id && (
            <Button
              type="button"
              variant="default"
              onClick={handleCompletePeritagem}
              className="mb-2 sm:mb-0 sm:mr-2"
            >
              Completar peritagem
            </Button>
          )}
          
          {/* Botão de submissão padrão */}
          <Button 
            type="submit" 
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
                Processando...
              </span>
            ) : (
              <>
                {mode === 'review' && !initialSector.id && "Cadastrar Peritagem"}
                {mode === 'review' && initialSector.id && "Atualizar Peritagem"}
                {mode === 'production' && "Salvar Produção"}
                {mode === 'quality' && "Finalizar Checagem"}
                {mode === 'scrap' && isScrap && "Confirmar Sucateamento"}
                {mode === 'scrap' && !isScrap && "Salvar"}
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
