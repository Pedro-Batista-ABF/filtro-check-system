
import React, { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { EntryFormSection } from "./form-sections/EntryFormSection";
import ScrapForm from "./forms/ScrapForm";
import ReviewForm from "./forms/ReviewForm";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Sector } from "@/types";
import { toast } from "sonner";
import { useSectorFormState } from '@/hooks/useSectorFormState';
import { useSectorFormSubmit } from '@/hooks/useSectorFormSubmit';

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
  const formState = useSectorFormState(sector);
  const { validateForm, prepareFormData } = useSectorFormSubmit();

  // Effect para inicializar o formulário com os dados do setor
  useEffect(() => {
    formState.setTagNumber(sector.tagNumber || '');
    formState.setEntryInvoice(sector.entryInvoice || '');
    formState.setEntryDate(sector.entryDate ? new Date(sector.entryDate) : new Date());
    formState.setTagPhotoUrl(sector.tagPhotoUrl);
    formState.setEntryObservations(sector.entryObservations || '');
    
    if (Array.isArray(sector.services)) {
      formState.setServices(sector.services);
    } else {
      console.warn("Services não é um array válido:", sector.services);
      formState.setServices([]);
    }

    if (mode === 'scrap') {, after the user has confirmed running the SQL commands. Share first the SQL commands in a `lov-sql` block, then the code changes in a `lov-code` block after the user has confirmed running the SQL commands.
      formState.setIsScrap(sector.scrapValidated || false);
    }
  }, [sector, mode]);

  const handleServiceChange = (id: string, checked: boolean) => {
    formState.setServices(prev => 
      prev.map(service => 
        service.id === id 
          ? { ...service, selected: checked } 
          : service
      )
    );
  };

  const handleQuantityChange = (id: string, quantity: number) => {
    formState.setServices(prev => 
      prev.map(service => 
        service.id === id 
          ? { ...service, quantity } 
          : service
      )
    );
  };

  const handleObservationChange = (id: string, observations: string) => {
    formState.setServices(prev => 
      prev.map(service => 
        service.id === id 
          ? { ...service, observations } 
          : service
      )
    );
  };

  const handleTagPhotoUpload = async (files: FileList) => {
    if (files.length > 0) {
      const tempUrl = URL.createObjectURL(files[0]);
      formState.setTagPhotoUrl(tempUrl);
      toast.success("Foto da TAG capturada");
    }
  };

  const handlePhotoUpload = (id: string, files: FileList, type: "before" | "after") => {
    if (files.length > 0) {
      formState.setServices(prev => 
        prev.map(service => {
          if (service.id === id) {
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
                file
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors = validateForm({
      tagNumber: formState.tagNumber,
      tagPhotoUrl: formState.tagPhotoUrl,
      entryInvoice: formState.entryInvoice,
      entryDate: formState.entryDate,
      entryObservations: formState.entryObservations,
      services: formState.services,
      isScrap: formState.isScrap,
      scrapObservations: formState.scrapObservations,
      scrapDate: formState.scrapDate,
      scrapInvoice: formState.scrapInvoice
    });
    
    formState.setFormErrors(errors);
    
    if (Object.values(errors).some(error => error)) {
      toast.error("Formulário com erros", {
        description: "Verifique os campos destacados e tente novamente."
      });
      return;
    }
    
    if (onSubmit) {
      const formData = prepareFormData(
        {
          tagNumber: formState.tagNumber,
          tagPhotoUrl: formState.tagPhotoUrl,
          entryInvoice: formState.entryInvoice,
          entryDate: formState.entryDate,
          entryObservations: formState.entryObservations,
          services: formState.services,
          isScrap: formState.isScrap,
          scrapObservations: formState.scrapObservations,
          scrapDate: formState.scrapDate,
          scrapInvoice: formState.scrapInvoice
        },
        mode === 'edit',
        sector.id
      );
      
      onSubmit(formData);
    }
  };
  
  const handleCameraCapture = (e: React.MouseEvent, serviceId?: string) => {
    e.preventDefault();
    
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.capture = 'environment';
    
    fileInput.addEventListener('change', (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        if (serviceId) {
          handlePhotoUpload(serviceId, target.files, 'before');
        } else {
          handleTagPhotoUpload(target.files);
        }
      }
    });
    
    fileInput.click();
  };

  // Se estamos em modo de criação, usar o ReviewForm que tem todos os elementos necessários
  if (mode === 'create') {
    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        {Object.values(formState.formErrors).some(error => error) && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Formulário com erros</AlertTitle>
            <AlertDescription>
              Verifique os campos destacados em vermelho e tente novamente.
            </AlertDescription>
          </Alert>
        )}
        
        <ReviewForm
          tagNumber={formState.tagNumber}
          setTagNumber={formState.setTagNumber}
          entryInvoice={formState.entryInvoice}
          setEntryInvoice={formState.setEntryInvoice}
          entryDate={formState.entryDate}
          setEntryDate={formState.setEntryDate}
          tagPhotoUrl={formState.tagPhotoUrl}
          handleTagPhotoUpload={handleTagPhotoUpload}
          entryObservations={formState.entryObservations}
          setEntryObservations={formState.setEntryObservations}
          services={formState.services}
          handleServiceChange={handleServiceChange}
          handleQuantityChange={handleQuantityChange}
          handleObservationChange={handleObservationChange}
          handlePhotoUpload={handlePhotoUpload}
          formErrors={formState.formErrors}
          photoRequired={photoRequired}
          handleCameraCapture={handleCameraCapture}
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
        tagNumber={formState.tagNumber}
        setTagNumber={formState.setTagNumber}
        entryInvoice={formState.entryInvoice}
        setEntryInvoice={formState.setEntryInvoice}
        entryDate={formState.entryDate}
        setEntryDate={formState.setEntryDate}
        tagPhotoUrl={formState.tagPhotoUrl}
        handleTagPhotoUpload={handleTagPhotoUpload}
        handleCameraCapture={handleCameraCapture}
        entryObservations={formState.entryObservations}
        setEntryObservations={formState.setEntryObservations}
        formErrors={formState.formErrors}
      />

      {mode === 'scrap' && (
        <ScrapForm 
          sector={sector}
          isScrap={formState.isScrap}
          setIsScrap={formState.setIsScrap}
          scrapObservations={formState.scrapObservations}
          setScrapObservations={formState.setScrapObservations}
          scrapDate={formState.scrapDate}
          setScrapDate={formState.setScrapDate}
          scrapInvoice={formState.scrapInvoice}
          setScrapInvoice={formState.setScrapInvoice}
          formErrors={{}}
        />
      )}
      
      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? "Salvando..." : (mode === 'checagem' ? "Concluir Checagem" : "Salvar")}
      </Button>
    </form>
  );
}
