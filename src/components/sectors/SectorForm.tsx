
import React, { useEffect } from 'react';
import { EntryFormSection } from "./form-sections/EntryFormSection";
import ScrapForm from "./forms/ScrapForm";
import ReviewForm from "./forms/ReviewForm";
import { Sector } from "@/types";
import { toast } from "sonner";
import { useSectorFormState } from '@/hooks/useSectorFormState';
import { useSectorFormSubmit } from '@/hooks/useSectorFormSubmit';
import { useSectorPhotoHandling } from '@/hooks/useSectorPhotoHandling';
import { useSectorServiceHandling } from '@/hooks/useSectorServiceHandling';
import { FormValidationAlert } from './form-parts/FormValidationAlert';
import { FormSubmitButton } from './form-parts/FormSubmitButton';

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
  const { handleTagPhotoUpload, handleServicePhotoUpload } = useSectorPhotoHandling();
  const { handleServiceChange, handleQuantityChange, handleObservationChange } = useSectorServiceHandling();

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

    if (mode === 'scrap') {
      formState.setIsScrap(sector.scrapValidated || false);
    }
  }, [sector, mode]);

  const handlePhotoUploadWrapper = async (files: FileList) => {
    const url = await handleTagPhotoUpload(files);
    if (url) formState.setTagPhotoUrl(url);
  };

  const handleServicePhotoUploadWrapper = (id: string, files: FileList, type: "before" | "after") => {
    const updatedServices = handleServicePhotoUpload(id, files, type, formState.services);
    formState.setServices(updatedServices);
    toast.success("Foto adicionada ao serviço");
  };

  const handleServiceChangeWrapper = (id: string, checked: boolean) => {
    const updatedServices = handleServiceChange(formState.services, id, checked);
    formState.setServices(updatedServices);
  };

  const handleQuantityChangeWrapper = (id: string, quantity: number) => {
    const updatedServices = handleQuantityChange(formState.services, id, quantity);
    formState.setServices(updatedServices);
  };

  const handleObservationChangeWrapper = (id: string, observations: string) => {
    const updatedServices = handleObservationChange(formState.services, id, observations);
    formState.setServices(updatedServices);
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
          handleServicePhotoUploadWrapper(serviceId, target.files, 'before');
        } else {
          handlePhotoUploadWrapper(target.files);
        }
      }
    });
    
    fileInput.click();
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

  if (mode === 'create') {
    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        <FormValidationAlert 
          show={Object.values(formState.formErrors).some(error => error)} 
        />
        
        <ReviewForm
          tagNumber={formState.tagNumber}
          setTagNumber={formState.setTagNumber}
          entryInvoice={formState.entryInvoice}
          setEntryInvoice={formState.setEntryInvoice}
          entryDate={formState.entryDate}
          setEntryDate={formState.setEntryDate}
          tagPhotoUrl={formState.tagPhotoUrl}
          handleTagPhotoUpload={handlePhotoUploadWrapper}
          entryObservations={formState.entryObservations}
          setEntryObservations={formState.setEntryObservations}
          services={formState.services}
          handleServiceChange={handleServiceChangeWrapper}
          handleQuantityChange={handleQuantityChangeWrapper}
          handleObservationChange={handleObservationChangeWrapper}
          handlePhotoUpload={handleServicePhotoUploadWrapper}
          formErrors={formState.formErrors}
          photoRequired={photoRequired}
          handleCameraCapture={handleCameraCapture}
        />
        
        <FormSubmitButton 
          isLoading={isLoading} 
          mode={mode} 
          fullWidth 
        />
      </form>
    );
  }

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
        handleTagPhotoUpload={handlePhotoUploadWrapper}
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
      
      <FormSubmitButton 
        isLoading={isLoading} 
        mode={mode} 
        fullWidth 
      />
    </form>
  );
}
