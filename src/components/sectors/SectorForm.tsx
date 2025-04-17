
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
    formErrors: stateFormErrors,
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
  const { handleServiceChange, handleQuantityChange, handleObservationChange } = useSectorServiceHandling();
  const { handleTagPhotoUpload, handlePhotoUpload, handleCameraCapture } = useSectorPhotoHandling(services, setServices);

  const handleSubmit = async () => {
    const errors = validateForm({
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

  // Manipuladores para os serviços
  const onServiceChange = (id: string, checked: boolean) => {
    setServices(handleServiceChange(services, id, checked));
  };

  const onQuantityChange = (id: string, quantity: number) => {
    setServices(handleQuantityChange(services, id, quantity));
  };

  const onObservationChange = (id: string, observations: string) => {
    setServices(handleObservationChange(services, id, observations));
  };

  // Renderizar o componente baseado no mode
  return (
    <div className="space-y-6">
      <FormValidationAlert formErrors={stateFormErrors} isScrap={isScrap} />

      <ScrapToggle 
        isScrap={isScrap} 
        setIsScrap={setIsScrap} 
        scrapObservations={scrapObservations}
        setScrapObservations={setScrapObservations}
        error={{}}
      />

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
            handleServiceChange={onServiceChange}
            handleQuantityChange={onQuantityChange}
            handleObservationChange={onObservationChange}
            handlePhotoUpload={handlePhotoUpload}
            formErrors={stateFormErrors}
            photoRequired={photoRequired}
            handleCameraCapture={handleCameraCapture}
          />
        </TabsContent>

        {mode === 'production' && (
          <TabsContent value="production">
            <ProductionForm 
              services={services} 
              productionCompleted={false} 
              handleProductionToggle={() => {}} 
              sectorStatus="emExecucao"
            />
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
              services={services}
              selectedTab={selectedTab}
              setSelectedTab={setSelectedTab}
              handlePhotoUpload={handlePhotoUpload}
              handleCameraCapture={handleCameraCapture}
            />
          </TabsContent>
        )}

        {isScrap && (
          <TabsContent value="scrap">
            <ScrapForm
              tagNumber={tagNumber}
              setTagNumber={setTagNumber}
              entryInvoice={entryInvoice}
              setEntryInvoice={setEntryInvoice}
              entryDate={entryDate}
              setEntryDate={setEntryDate}
              scrapObservations={scrapObservations}
              setScrapObservations={setScrapObservations}
              scrapDate={scrapDate}
              setScrapDate={setScrapDate}
              scrapInvoice={scrapInvoice}
              setScrapInvoice={setScrapInvoice}
              handlePhotoUpload={() => {}}
              tagPhotoUrl={tagPhotoUrl}
              handleTagPhotoUpload={handleTagPhotoUpload}
            />
          </TabsContent>
        )}
      </Tabs>

      <FormActions
        loading={isLoading}
        handleSubmit={handleSubmit}
        mode={mode}
        isScrap={isScrap}
        qualityCompleted={qualityCompleted}
      />
    </div>
  );
}

export default SectorForm;
