
import React, { useState, useEffect } from "react";
import { Sector, Service, PhotoWithFile, SectorStatus, CycleOutcome } from "@/types";
import { toast } from "sonner";
import ServicesList from "./ServicesList";
import ScrapToggle from "./forms/ScrapToggle";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import SectorInfoSection from "./forms/review/SectorInfoSection";
import { useSectorPhotoHandling } from "@/hooks/useSectorPhotoHandling";
import ScrapForm from "./forms/ScrapForm";

interface SectorFormProps {
  initialSector: Sector;
  onSubmit: (data: Sector) => void;
  isLoading?: boolean;
  mode?: "peritagem" | "sucateamento" | "scrap" | "quality";
}

export default function SectorForm({
  initialSector,
  onSubmit,
  isLoading = false,
  mode = "peritagem"
}: SectorFormProps) {
  // Estado local para o setor
  const [sector, setSector] = useState<Sector>(initialSector);
  
  // Estados específicos para campos individuais
  const [tagNumber, setTagNumber] = useState(initialSector.tagNumber || "");
  const [entryInvoice, setEntryInvoice] = useState(initialSector.entryInvoice || "");
  const [entryDate, setEntryDate] = useState<Date | undefined>(
    initialSector.entryDate ? new Date(initialSector.entryDate) : undefined
  );
  const [tagPhotoUrl, setTagPhotoUrl] = useState(initialSector.tagPhotoUrl || "");
  const [entryObservations, setEntryObservations] = useState(initialSector.entryObservations || "");
  const [services, setServices] = useState<Service[]>(initialSector.services || []);
  const [isScrap, setIsScrap] = useState(initialSector.status === "sucateadoPendente");
  const [scrapObservations, setScrapObservations] = useState(initialSector.scrapObservations || "");
  const [servicesError, setServicesError] = useState(false);
  const [formErrors, setFormErrors] = useState({
    tagNumber: false,
    tagPhoto: false,
    entryInvoice: false,
    entryDate: false,
  });
  // Adicionando campos para sucateamento que estavam faltando no tipo Sector
  const [scrapDate, setScrapDate] = useState<Date | undefined>(
    initialSector.scrapReturnDate ? new Date(initialSector.scrapReturnDate) : undefined
  );
  const [scrapInvoice, setScrapInvoice] = useState(initialSector.scrapReturnInvoice || "");
  const [scrapPhotos, setScrapPhotos] = useState<PhotoWithFile[]>(
    initialSector.scrapPhotos?.map(photo => ({ ...photo, file: null })) || []
  );
  const [scrapFormErrors, setScrapFormErrors] = useState({
    scrapObservations: false,
    scrapDate: false,
    scrapInvoice: false,
    scrapPhotos: false
  });

  // Handlers para manipulação de fotos
  const { 
    handleTagPhotoUpload: tagPhotoHandler,
    handlePhotoUpload: servicePhotoHandler,
    handleCameraCapture 
  } = useSectorPhotoHandling(services, setServices);

  // Efeito para atualizar o estado do setor quando o initialSector mudar
  useEffect(() => {
    setSector(initialSector);
    setTagNumber(initialSector.tagNumber || "");
    setEntryInvoice(initialSector.entryInvoice || "");
    setEntryDate(initialSector.entryDate ? new Date(initialSector.entryDate) : undefined);
    setTagPhotoUrl(initialSector.tagPhotoUrl || "");
    setEntryObservations(initialSector.entryObservations || "");
    setServices(initialSector.services || []);
    setIsScrap(initialSector.status === "sucateadoPendente");
    setScrapObservations(initialSector.scrapObservations || "");
    // Atualizando os campos de sucateamento
    setScrapDate(initialSector.scrapReturnDate ? new Date(initialSector.scrapReturnDate) : undefined);
    setScrapInvoice(initialSector.scrapReturnInvoice || "");
    setScrapPhotos(initialSector.scrapPhotos?.map(photo => ({ ...photo, file: null })) || []);
  }, [initialSector]);

  // Handler para mudança nos serviços
  const handleServiceChange = (id: string, checked: boolean) => {
    setServices(prevServices =>
      prevServices.map(service =>
        service.id === id ? { ...service, selected: checked } : service
      )
    );
    setServicesError(false);
  };

  // Handler para mudança na quantidade
  const handleQuantityChange = (id: string, quantity: number) => {
    setServices(prevServices =>
      prevServices.map(service =>
        service.id === id ? { ...service, quantity } : service
      )
    );
  };

  // Handler para mudança em observações
  const handleObservationChange = (id: string, observations: string) => {
    setServices(prevServices =>
      prevServices.map(service =>
        service.id === id ? { ...service, observations } : service
      )
    );
  };

  // Handler para upload de foto da TAG
  const handleTagPhotoUpload = async (files: FileList) => {
    const photoUrl = await tagPhotoHandler(files);
    if (photoUrl) {
      setTagPhotoUrl(photoUrl);
      setFormErrors(prev => ({ ...prev, tagPhoto: false }));
    }
  };

  // Handler para upload de foto de serviço
  const handleServicePhotoUpload = (serviceId: string, files: FileList, type: "before" | "after") => {
    servicePhotoHandler(serviceId, files, type);
    setServicesError(false);
  };

  // Handler para upload de foto de sucateamento
  const handleScrapPhotoUpload = (files: FileList) => {
    if (!files.length) return;
    
    const newPhotos: PhotoWithFile[] = Array.from(files).map(file => ({
      id: `scrap-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      url: URL.createObjectURL(file),
      type: 'scrap',
      file
    }));
    
    setScrapPhotos(prev => [...prev, ...newPhotos]);
    setScrapFormErrors(prev => ({ ...prev, scrapPhotos: false }));
  };

  // Função de validação do formulário
  const validateForm = (): boolean => {
    const errors = {
      tagNumber: !tagNumber.trim(),
      tagPhoto: !tagPhotoUrl,
      entryInvoice: !entryInvoice.trim(),
      entryDate: !entryDate,
    };
    
    setFormErrors(errors);
    
    // Validação específica para sucateamento
    if (isScrap) {
      const scrapErrors = {
        scrapObservations: !scrapObservations.trim(),
        scrapDate: mode === "scrap" && !scrapDate,
        scrapInvoice: mode === "scrap" && !scrapInvoice.trim(),
        scrapPhotos: scrapPhotos.length === 0
      };
      
      setScrapFormErrors(scrapErrors);
      
      // Verificar se há erros de sucateamento
      if (Object.values(scrapErrors).some(Boolean)) {
        return false;
      }
    } else {
      // Validação para serviços quando não está sucateando
      const selectedServices = services.filter(s => s.selected);
      const hasServicesWithoutPhotos = selectedServices.some(
        service => !service.photos || service.photos.length === 0
      );
      
      if (selectedServices.length === 0 || hasServicesWithoutPhotos) {
        setServicesError(true);
        return false;
      }
    }
    
    // Verificar se há erros gerais
    return !Object.values(errors).some(Boolean);
  };

  // Handler para submissão do formulário
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Verifique os campos obrigatórios", {
        description: "Há campos obrigatórios não preenchidos."
      });
      return;
    }
    
    // Construindo o objeto de setor com os campos corretos para evitar erros de tipo
    const updatedSector: Sector = {
      ...sector,
      tagNumber,
      entryInvoice,
      entryDate: entryDate ? entryDate.toISOString() : undefined,
      tagPhotoUrl,
      entryObservations,
      services,
      status: isScrap ? "sucateadoPendente" as SectorStatus : sector.status,
      scrapObservations: isScrap ? scrapObservations : "",
      // Mapeando os campos específicos para sucateamento para os campos do tipo Sector
      scrapReturnDate: isScrap && scrapDate ? scrapDate.toISOString() : undefined,
      scrapReturnInvoice: isScrap ? scrapInvoice : "",
      scrapPhotos: isScrap ? scrapPhotos : [],
      outcome: isScrap ? "Sucateado" as CycleOutcome : sector.outcome
    };
    
    onSubmit(updatedSector);
  };

  // Render para modo de sucateamento
  if (mode === "scrap") {
    return (
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <ScrapForm
            tagNumber={tagNumber}
            setTagNumber={setTagNumber}
            entryInvoice={entryInvoice}
            setEntryInvoice={setEntryInvoice}
            entryDate={entryDate}
            setEntryDate={setEntryDate}
            tagPhotoUrl={tagPhotoUrl}
            handleTagPhotoUpload={handleTagPhotoUpload}
            scrapObservations={scrapObservations}
            setScrapObservations={setScrapObservations}
            scrapDate={scrapDate}
            setScrapDate={setScrapDate}
            scrapInvoice={scrapInvoice}
            setScrapInvoice={setScrapInvoice}
            scrapPhotos={scrapPhotos}
            handleScrapPhotoUpload={handleScrapPhotoUpload}
            formErrors={{
              ...formErrors,
              ...scrapFormErrors
            }}
            onCameraCapture={handleCameraCapture}
            disabled={isLoading}
          />
          
          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirmar Sucateamento
            </Button>
          </div>
        </div>
      </form>
    );
  }

  // Render padrão para peritagem
  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        <SectorInfoSection
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
          onCameraCapture={handleCameraCapture}
          formErrors={formErrors}
        />
        
        <ScrapToggle
          isScrap={isScrap}
          setIsScrap={setIsScrap}
          scrapObservations={scrapObservations}
          setScrapObservations={setScrapObservations}
          scrapPhotos={scrapPhotos}
          handleScrapPhotoUpload={handleScrapPhotoUpload}
          error={{
            observations: scrapFormErrors.scrapObservations,
            photos: scrapFormErrors.scrapPhotos
          }}
          disabled={isLoading}
          onCameraCapture={handleCameraCapture}
        />
        
        {!isScrap && (
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-medium mb-4">Serviços Necessários</h2>
              
              <ServicesList
                services={services}
                error={servicesError}
                photoRequired={true}
                onServiceChange={handleServiceChange}
                onQuantityChange={handleQuantityChange}
                onObservationChange={handleObservationChange}
                onServicePhotoUpload={handleServicePhotoUpload}
                disabled={isLoading}
                onCameraCapture={handleCameraCapture}
              />
            </div>
          </Card>
        )}
        
        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isScrap ? "Registrar Sucateamento" : "Salvar Peritagem"}
          </Button>
        </div>
      </div>
    </form>
  );
}
