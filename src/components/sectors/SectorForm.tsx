
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Service, Sector } from '@/types';
import { useSectorFormState } from '@/hooks/useSectorFormState';
import { useSectorServiceHandling } from '@/hooks/useSectorServiceHandling';
import { useSectorPhotoHandling } from '@/hooks/useSectorPhotoHandling';
import { useSectorFormSubmit } from '@/hooks/useSectorFormSubmit';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { FormValidationAlert } from '@/components/sectors/form-parts/FormValidationAlert';
import { EntryFormSection } from '@/components/sectors/form-sections/EntryFormSection';
import ServicesList from '@/components/sectors/ServicesList';
import FormActions from '@/components/sectors/forms/FormActions';

interface SectorFormProps {
  sector: Sector;
  onSubmit: (data: Partial<Sector>) => void;
  mode?: 'review' | 'production' | 'quality' | 'scrap';
  photoRequired?: boolean;
  isLoading?: boolean;
}

const SectorForm: React.FC<SectorFormProps> = ({
  sector,
  onSubmit,
  mode = 'review',
  photoRequired = true,
  isLoading = false,
}) => {
  const {
    tagNumber,
    setTagNumber,
    entryInvoice,
    setEntryInvoice,
    entryDate,
    setEntryDate,
    tagPhotoUrl,
    setTagPhotoUrl,
    entryObservations,
    setEntryObservations,
    services,
    setServices,
    formErrors,
    setFormErrors,
    isScrap,
    setIsScrap,
    scrapObservations,
    setScrapObservations,
    scrapDate,
    setScrapDate,
    scrapInvoice,
    setScrapInvoice
  } = useSectorFormState(sector);

  const {
    handleServiceChange,
    handleQuantityChange,
    handleObservationChange
  } = useSectorServiceHandling();

  const {
    handleTagPhotoUpload,
    handleServicePhotoUpload
  } = useSectorPhotoHandling();

  const { validateForm, prepareFormData } = useSectorFormSubmit();

  // Initialize services from sector if available
  useEffect(() => {
    console.log("🔄 SectorForm useEffect - Atualizando services do sector", Date.now());
    console.log("🔄 sector:", sector?.id || "não definido");
    console.log("🔄 services length:", sector?.services?.length || 0);
    
    if (sector && Array.isArray(sector.services)) {
      setServices(sector.services);
    }
  }, [sector, setServices]);

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("📝 SectorForm handleSubmitForm - Iniciando submissão", Date.now());

    const formData = {
      tagNumber,
      tagPhotoUrl,
      entryInvoice,
      entryDate,
      entryObservations,
      services,
      isScrap,
      scrapObservations,
      scrapDate,
      scrapInvoice
    };

    const errors = validateForm(formData);
    setFormErrors(errors);

    const hasErrors = Object.values(errors).some(error => error);
    if (hasErrors) {
      console.log("❌ SectorForm - Erros de validação encontrados:", errors);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    console.log("✅ SectorForm - Validação passou, preparando dados", Date.now());
    // Update sector with form data
    const updatedSector = prepareFormData(formData, mode !== 'review', sector?.id);
    console.log("✅ SectorForm - Enviando dados para onSubmit", Date.now());
    onSubmit(updatedSector);
  };

  const onServiceChange = (id: string, checked: boolean) => {
    setServices(handleServiceChange(services, id, checked));
  };

  const onQuantityChange = (id: string, quantity: number) => {
    setServices(handleQuantityChange(services, id, quantity));
  };

  const onObservationChange = (id: string, observations: string) => {
    setServices(handleObservationChange(services, id, observations));
  };

  const onServicePhotoUpload = async (serviceId: string, files: FileList) => {
    setServices(await handleServicePhotoUpload(serviceId, files, 'before', services));
  };

  const onTagPhotoUpload = async (files: FileList) => {
    const url = await handleTagPhotoUpload(files);
    if (url) {
      setTagPhotoUrl(url);
    }
  };

  console.log("🖥️ SectorForm render - Estado atual", Date.now());
  console.log("🖥️ sector:", sector?.id || "não definido");
  console.log("🖥️ services:", services?.length || 0);
  console.log("🖥️ formErrors:", formErrors);

  return (
    <form onSubmit={handleSubmitForm} className="space-y-8">
      {Object.values(formErrors).some(error => error) && (
        <FormValidationAlert 
          tagNumber={formErrors.tagNumber}
          tagPhoto={formErrors.tagPhoto}
          entryInvoice={formErrors.entryInvoice}
          entryDate={formErrors.entryDate}
          services={formErrors.services}
          photos={formErrors.photos}
        />
      )}

      <EntryFormSection
        tagNumber={tagNumber}
        setTagNumber={setTagNumber}
        entryInvoice={entryInvoice}
        setEntryInvoice={setEntryInvoice}
        entryDate={entryDate}
        setEntryDate={setEntryDate}
        tagPhotoUrl={tagPhotoUrl}
        onPhotoUpload={onTagPhotoUpload}
        entryObservations={entryObservations}
        setEntryObservations={setEntryObservations}
        errors={{
          tagNumber: formErrors.tagNumber || false,
          tagPhoto: formErrors.tagPhoto || false,
          entryInvoice: formErrors.entryInvoice || false,
          entryDate: formErrors.entryDate || false
        }}
        photoRequired={photoRequired}
      />

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Serviços a Executar</h2>
        <ServicesList
          services={services}
          error={formErrors.services || formErrors.photos || false}
          photoRequired={photoRequired}
          onServiceChange={onServiceChange}
          onQuantityChange={onQuantityChange}
          onObservationChange={onObservationChange}
          onServicePhotoUpload={onServicePhotoUpload}
        />
      </Card>

      <FormActions
        loading={isLoading}
        mode={mode}
      />
    </form>
  );
};

export default SectorForm;
