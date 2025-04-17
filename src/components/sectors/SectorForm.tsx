
import React from 'react';
import { Sector } from '@/types';
import { useSectorFormState } from '@/hooks/useSectorFormState';
import { useSectorFormSubmit } from '@/hooks/useSectorFormSubmit'; 
import { useSectorServiceHandling } from '@/hooks/useSectorServiceHandling';
import { useSectorPhotoHandling } from '@/hooks/useSectorPhotoHandling';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import ReviewForm from './forms/ReviewForm';
import ProductionForm from './forms/ProductionForm';
import QualityForm from './forms/QualityForm';
import ScrapForm from './forms/ScrapForm';
import ScrapToggle from './forms/ScrapToggle';
import FormActions from './forms/FormActions';
import { FormValidationAlert } from './form-parts/FormValidationAlert';

export interface SectorFormProps {
  initialSector: Sector;
  onSubmit: (data: Partial<Sector>) => Promise<void>;
  mode: 'peritagem' | 'production' | 'quality' | 'scrap';
  photoRequired: boolean;
  isLoading: boolean;
  disableEntryFields: boolean;
}

function SectorForm({
  initialSector,
  onSubmit,
  mode,
  photoRequired,
  isLoading,
  disableEntryFields
}: SectorFormProps) {
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
    formErrors: formValidationErrors,
    setFormErrors,
    isScrap,
    setIsScrap,
    scrapObservations,
    setScrapObservations,
    scrapDate,
    setScrapDate,
    scrapInvoice,
    setScrapInvoice,
    exitInvoice,
    setExitInvoice,
    exitDate,
    setExitDate,
    exitObservations,
    setExitObservations,
    qualityCompleted,
    setQualityCompleted,
    selectedTab,
    setSelectedTab
  } = useSectorFormState(initialSector);

  const { validateForm, prepareFormData } = useSectorFormSubmit();
  const { handleServiceChange, handleQuantityChange, handleObservationChange } = useSectorServiceHandling(services, setServices);
  const { handleTagPhotoUpload, handlePhotoUpload, handleCameraCapture } = useSectorPhotoHandling(services, setServices);

  const handleSubmit = async () => {
    const errors = validateForm({
      tagNumber,
      tagPhotoUrl,
      entryInvoice,
      entryDate,
      services,
      isScrap,
      scrapObservations,
      scrapDate,
      scrapInvoice
    });

    setFormErrors(errors);

    if (Object.values(errors).some(error => error)) {
      console.warn('Formulário com erros:', errors);
      return;
    }

    const formData = prepareFormData({
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
    }, !!initialSector.id, initialSector.id);

    await onSubmit(formData);
  };
  
  const handleTabChange = (value: string) => {
    setSelectedTab(value);
  };

  return (
    <div className="space-y-6">
      <FormValidationAlert formErrors={formValidationErrors} />

      <ScrapToggle isScrap={isScrap} setIsScrap={setIsScrap} />

      <Tabs value={selectedTab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="services">Peritagem</TabsTrigger>
          {mode === 'production' && <TabsTrigger value="production">Produção</TabsTrigger>}
          {mode === 'quality' && <TabsTrigger value="quality">Qualidade</TabsTrigger>}
          {isScrap && <TabsTrigger value="scrap">Sucateamento</TabsTrigger>}
        </TabsList>

        <TabsContent value="services">
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
            formErrors={formValidationErrors}
            photoRequired={photoRequired}
            handleCameraCapture={handleCameraCapture}
          />
        </TabsContent>

        {mode === 'production' && (
          <TabsContent value="production">
            <ProductionForm />
          </TabsContent>
        )}

        {mode === 'quality' && (
          <TabsContent value="quality">
            <QualityForm
              exitInvoice={exitInvoice}
              setExitInvoice={setExitInvoice}
              exitDate={exitDate}
              setExitDate={setExitDate}
              exitObservations={exitObservations}
              setExitObservations={setExitObservations}
              qualityCompleted={qualityCompleted}
              setQualityCompleted={setQualityCompleted}
            />
          </TabsContent>
        )}

        {isScrap && (
          <TabsContent value="scrap">
            <ScrapForm
              scrapObservations={scrapObservations}
              setScrapObservations={setScrapObservations}
              scrapDate={scrapDate}
              setScrapDate={setScrapDate}
              scrapInvoice={scrapInvoice}
              setScrapInvoice={setScrapInvoice}
            />
          </TabsContent>
        )}
      </Tabs>

      <FormActions
        isLoading={isLoading}
        handleSubmit={handleSubmit}
        mode={mode}
        isScrap={isScrap}
        qualityCompleted={qualityCompleted}
      />
    </div>
  );
}

export default SectorForm;
