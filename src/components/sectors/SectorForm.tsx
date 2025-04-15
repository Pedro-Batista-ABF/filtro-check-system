import React from 'react';
import { Button } from "@/components/ui/button";
import { EntryFormSection } from "./form-sections/EntryFormSection";
import ScrapForm from "./forms/ScrapForm";
import ReviewForm from "./forms/ReviewForm";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Sector } from "@/types";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { format } from 'date-fns';
import { Service } from "@/types";

interface SectorFormProps {
  sector: Sector;
  onSubmit?: (data: Partial<Sector>) => void;
  mode?: 'create' | 'edit' | 'view' | 'checagem' | 'scrap';
  isLoading?: boolean;
  photoRequired?: boolean;
}

export default function SectorForm({ 
  sector,
  onSubmit,
  mode = 'create',
  isLoading = false,
  photoRequired = false
}: SectorFormProps) {
  const [tagNumber, setTagNumber] = useState(sector.tagNumber || '');
  const [entryInvoice, setEntryInvoice] = useState(sector.entryInvoice || '');
  const [entryDate, setEntryDate] = useState<Date | undefined>(
    sector.entryDate ? new Date(sector.entryDate) : new Date()
  );
  const [tagPhotoUrl, setTagPhotoUrl] = useState<string | undefined>(sector.tagPhotoUrl);
  const [entryObservations, setEntryObservations] = useState(sector.entryObservations || '');
  
  const [services, setServices] = useState<Service[]>(
    Array.isArray(sector.services) ? sector.services : []
  );
  
  const [formErrors, setFormErrors] = useState({
    tagNumber: false,
    tagPhoto: false,
    entryInvoice: false,
    entryDate: false,
    services: false,
    photos: false
  });
  
  const [isScrap, setIsScrap] = useState(false);
  const [scrapObservations, setScrapObservations] = useState('');
  const [scrapDate, setScrapDate] = useState<Date | undefined>();
  const [scrapInvoice, setScrapInvoice] = useState('');

  // Effect para inicializar o formulário com os dados do setor
  useEffect(() => {
    setTagNumber(sector.tagNumber || '');
    setEntryInvoice(sector.entryInvoice || '');
    setEntryDate(sector.entryDate ? new Date(sector.entryDate) : new Date());
    setTagPhotoUrl(sector.tagPhotoUrl);
    setEntryObservations(sector.entryObservations || '');
    
    // Garantir que services seja sempre um array
    if (Array.isArray(sector.services)) {
      setServices(sector.services);
    } else {
      console.warn("Services não é um array válido:", sector.services);
      setServices([]);
    }

    // Quando estamos em modo de sucateamento
    if (mode === 'scrap') {
      setIsScrap(sector.scrapValidated || false);
    }
  }, [sector, mode]);

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

  const handleTagPhotoUpload = async (files: FileList) => {
    if (files.length > 0) {
      // Simular URL temporária para visualização
      const tempUrl = URL.createObjectURL(files[0]);
      setTagPhotoUrl(tempUrl);
      
      // Aqui você adicionaria a lógica para upload real
      // E então atualizaria a URL após o upload completar
      toast.success("Foto da TAG capturada");
    }
  };

  const handlePhotoUpload = (id: string, files: FileList, type: "before" | "after") => {
    if (files.length > 0) {
      setServices(prev => 
        prev.map(service => {
          if (service.id === id) {
            // Criar foto com URL temporária
            const newPhotos = [...(service.photos || [])];
            
            for (let i = 0; i < files.length; i++) {
              const file = files[i];
              const tempId = `temp-${Date.now()}-${i}`;
              const tempUrl = URL.createObjectURL(file);
              
              newPhotos.push({
                id: tempId,
                url: tempUrl,
                type,
                serviceId: id,
                file // Armazenar o arquivo para upload posterior
              });
            }
            
            return { ...service, photos: newPhotos };
          }
          return service;
        })
      );
      
      toast.success("Foto adicionada ao serviço");
    }
  };

  const validateForm = (): boolean => {
    const errors = {
      tagNumber: !tagNumber.trim(),
      tagPhoto: !tagPhotoUrl,
      entryInvoice: !entryInvoice.trim(),
      entryDate: !entryDate,
      services: false,
      photos: false
    };

    const selectedServices = services.filter(s => s.selected);
    errors.services = selectedServices.length === 0;

    // Verificar se todos os serviços selecionados têm fotos
    const servicesWithoutPhotos = selectedServices.filter(
      service => !service.photos || service.photos.length === 0
    );
    errors.photos = servicesWithoutPhotos.length > 0;

    setFormErrors(errors);
    return !Object.values(errors).some(error => error);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Formulário com erros", {
        description: "Verifique os campos destacados e tente novamente."
      });
      return;
    }
    
    if (onSubmit) {
      // Formatar a data para string no formato ISO
      const entryDateStr = entryDate ? format(entryDate, 'yyyy-MM-dd') : '';
      
      const formData: Partial<Sector> = {
        tagNumber,
        tagPhotoUrl,
        entryInvoice,
        entryDate: entryDateStr,
        peritagemDate: format(new Date(), 'yyyy-MM-dd'),
        entryObservations,
        services,
        beforePhotos: services.flatMap(s => s.photos || []),
        afterPhotos: []
      };
      
      // Informações específicas de sucateamento
      if (mode === 'scrap' && isScrap) {
        formData.scrapObservations = scrapObservations;
        formData.scrapReturnInvoice = scrapInvoice;
        formData.scrapReturnDate = scrapDate ? format(scrapDate, "yyyy-MM-dd") : undefined;
        formData.scrapValidated = true;
        formData.outcome = 'scrapped';
      }
      
      onSubmit(formData);
    }
  };

  // Se estamos em modo de criação, usar o ReviewForm que tem todos os elementos necessários
  if (mode === 'create') {
    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        {Object.values(formErrors).some(error => error) && (
          <Alert variant="destructive">
            <AlertTitle>Formulário com erros</AlertTitle>
            <AlertDescription>
              Verifique os campos destacados em vermelho e tente novamente.
            </AlertDescription>
          </Alert>
        )}
        
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
        
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? "Salvando..." : "Registrar Peritagem"}
        </Button>
      </form>
    );
  }

  // Renderizar versão simplificada para outros modos
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <EntryFormSection
        tagNumber={tagNumber}
        setTagNumber={setTagNumber}
        entryInvoice={entryInvoice}
        setEntryInvoice={setEntryInvoice}
        entryDate={entryDate}
        setEntryDate={setEntryDate}
        tagPhotoUrl={tagPhotoUrl}
        handleTagPhotoUpload={handleTagPhotoUpload}
        handleCameraCapture={handleCameraCapture}
        entryObservations={entryObservations}
        setEntryObservations={setEntryObservations}
        formErrors={formErrors}
      />

      {mode === 'scrap' && (
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
          formErrors={{}}
        />
      )}
      
      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? "Salvando..." : (mode === 'checagem' ? "Concluir Checagem" : "Salvar")}
      </Button>
    </form>
  );
}
