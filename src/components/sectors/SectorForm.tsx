
import { useState, useEffect } from "react";
import { Sector, Service, Cycle, Photo, CycleOutcome } from "@/types";
import { format } from "date-fns";
import { toast } from "sonner";

// Import our component files
import ReviewForm from "./forms/ReviewForm";
import ProductionForm from "./forms/ProductionForm";
import QualityForm from "./forms/QualityForm";
import ScrapForm from "./forms/ScrapForm";
import FormActions from "./forms/FormActions";

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

  // Manipulador para upload de foto do TAG (nova versão simplificada)
  const handleTagPhotoUpload = (url: string) => {
    console.log("Recebendo URL da foto do TAG:", url);
    if (url && !url.startsWith('blob:')) {
      setTagPhotoUrl(url);
    } else {
      console.warn("URL de foto inválida recebida:", url);
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
    
    // Verificar se há valores obrigatórios faltando
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
      toast.error("Formulário Incompleto", {
        description: "Por favor, preencha todos os campos obrigatórios."
      });
      return;
    }
    
    // Validação específica para a foto do TAG
    if (photoRequired && (!tagPhotoUrl || tagPhotoUrl.startsWith('blob:'))) {
      toast.error("Foto do TAG inválida", {
        description: "É necessário fazer o upload da foto do TAG."
      });
      setFormErrors(prev => ({ ...prev, tagPhoto: true }));
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
      
      <FormActions 
        loading={loading} 
        mode={mode} 
        isScrap={isScrap} 
        qualityCompleted={qualityCompleted} 
      />
    </form>
  );
}
