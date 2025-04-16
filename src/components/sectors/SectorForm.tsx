
import React, { useState, useEffect } from 'react';
import { useSectorFormState } from '@/hooks/useSectorFormState';
import { useSectorFormSubmit } from '@/hooks/useSectorFormSubmit';
import { useSectorServiceHandling } from '@/hooks/useSectorServiceHandling';
import { useSectorPhotoHandling } from '@/hooks/useSectorPhotoHandling';
import { useTagPhotoUpload } from '@/hooks/useTagPhotoUpload';
import { Sector, Service } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from '@/hooks/use-mobile';
import ScrapToggle from './forms/ScrapToggle';
import ScrapForm from './forms/ScrapForm';
import ReviewForm from './forms/ReviewForm';
import FormActions from './forms/FormActions';
import FormValidationAlert from './form-parts/FormValidationAlert';

interface SectorFormProps {
  initialSector: Sector;
  onSubmit: (data: Partial<Sector>) => Promise<void>;
  mode: string;
  photoRequired: boolean;
  isLoading: boolean;
  disableEntryFields: boolean;
}

const SectorForm: React.FC<SectorFormProps> = ({
  initialSector,
  onSubmit,
  mode,
  photoRequired,
  isLoading,
  disableEntryFields
}) => {
  const isMobile = useIsMobile();
  const [showValidationErrors, setShowValidationErrors] = useState(false);
  
  // Hooks para gerenciamento de estado e submissão do formulário
  const sectorState = useSectorFormState(initialSector);
  const { validateForm, prepareFormData } = useSectorFormSubmit();
  
  // Hooks para manipulação de serviços e fotos
  const { 
    handleServiceChange, 
    handleQuantityChange, 
    handleObservationChange 
  } = useSectorServiceHandling(sectorState.services, sectorState.setServices);
  
  const { 
    handlePhotoUpload,
    handleCameraCapture 
  } = useSectorPhotoHandling(sectorState.services, sectorState.setServices);
  
  const { 
    handleTagPhotoUpload, 
    isUploading: isTagPhotoUploading 
  } = useTagPhotoUpload();
  
  // Atualizar o estado inicial quando mudar o setor
  useEffect(() => {
    if (initialSector && initialSector.id) {
      sectorState.setTagNumber(initialSector.tagNumber || '');
      sectorState.setEntryInvoice(initialSector.entryInvoice || '');
      sectorState.setEntryDate(initialSector.entryDate ? new Date(initialSector.entryDate) : undefined);
      sectorState.setTagPhotoUrl(initialSector.tagPhotoUrl);
      sectorState.setEntryObservations(initialSector.entryObservations || '');
      sectorState.setServices(Array.isArray(initialSector.services) ? initialSector.services : []);
      sectorState.setIsScrap(initialSector.status === 'sucateadoPendente' || false);
      sectorState.setScrapObservations(initialSector.scrapObservations || '');
      sectorState.setScrapDate(
        initialSector.scrapReturnDate ? new Date(initialSector.scrapReturnDate) : undefined
      );
      sectorState.setScrapInvoice(initialSector.scrapReturnInvoice || '');
    }
  }, [initialSector]);
  
  // Função para lidar com upload de foto da TAG
  const handleTagPhotoUploadLocal = async (files: FileList) => {
    if (files && files.length > 0) {
      const file = files[0];
      const url = await handleTagPhotoUpload(file);
      if (url) {
        sectorState.setTagPhotoUrl(url);
      }
    }
  };
  
  // Função para submeter o formulário
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const formState = {
      tagNumber: sectorState.tagNumber,
      tagPhotoUrl: sectorState.tagPhotoUrl,
      entryInvoice: sectorState.entryInvoice,
      entryDate: sectorState.entryDate,
      entryObservations: sectorState.entryObservations,
      services: sectorState.services,
      isScrap: sectorState.isScrap,
      scrapObservations: sectorState.scrapObservations,
      scrapDate: sectorState.scrapDate,
      scrapInvoice: sectorState.scrapInvoice
    };
    
    // Validar formulário
    const errors = validateForm(formState);
    sectorState.setFormErrors(errors);
    
    // Verificar se há erros
    const hasErrors = Object.values(errors).some(Boolean);
    
    if (hasErrors) {
      setShowValidationErrors(true);
      return;
    }
    
    // Preparar dados para envio
    const formData = prepareFormData(formState, !!initialSector.id, initialSector.id);
    
    // Submeter dados
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error("Erro ao submeter formulário:", error);
    }
  };
  
  return (
    <form onSubmit={handleFormSubmit} className="space-y-6">
      {/* Toggle para modo sucateamento */}
      {mode === 'peritagem' && (
        <ScrapToggle
          isScrap={sectorState.isScrap}
          setIsScrap={sectorState.setIsScrap}
        />
      )}
      
      {/* Formulário de sucateamento */}
      {sectorState.isScrap ? (
        <ScrapForm
          tagNumber={sectorState.tagNumber}
          setTagNumber={sectorState.setTagNumber}
          entryInvoice={sectorState.entryInvoice}
          setEntryInvoice={sectorState.setEntryInvoice}
          entryDate={sectorState.entryDate}
          setEntryDate={sectorState.setEntryDate}
          tagPhotoUrl={sectorState.tagPhotoUrl}
          handleTagPhotoUpload={handleTagPhotoUploadLocal}
          scrapObservations={sectorState.scrapObservations}
          setScrapObservations={sectorState.setScrapObservations}
          scrapDate={sectorState.scrapDate}
          setScrapDate={sectorState.setScrapDate}
          scrapInvoice={sectorState.scrapInvoice}
          setScrapInvoice={sectorState.setScrapInvoice}
          formErrors={sectorState.formErrors}
          onCameraCapture={handleCameraCapture}
          disabled={disableEntryFields}
        />
      ) : (
        /* Abas para navegação entre seções do formulário em modo mobile */
        isMobile ? (
          <Tabs defaultValue="info" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="info">Informações</TabsTrigger>
              <TabsTrigger value="services">Serviços</TabsTrigger>
            </TabsList>
            <TabsContent value="info" className="mt-4">
              <ReviewForm
                tagNumber={sectorState.tagNumber}
                setTagNumber={sectorState.setTagNumber}
                entryInvoice={sectorState.entryInvoice}
                setEntryInvoice={sectorState.setEntryInvoice}
                entryDate={sectorState.entryDate}
                setEntryDate={sectorState.setEntryDate}
                tagPhotoUrl={sectorState.tagPhotoUrl}
                handleTagPhotoUpload={handleTagPhotoUploadLocal}
                entryObservations={sectorState.entryObservations}
                setEntryObservations={sectorState.setEntryObservations}
                services={[]} // Apenas serviços na aba de serviços
                handleServiceChange={handleServiceChange}
                handleQuantityChange={handleQuantityChange}
                handleObservationChange={handleObservationChange}
                handlePhotoUpload={handlePhotoUpload}
                formErrors={sectorState.formErrors}
                photoRequired={photoRequired}
                handleCameraCapture={handleCameraCapture}
              />
            </TabsContent>
            <TabsContent value="services" className="mt-4">
              <ReviewForm
                tagNumber={sectorState.tagNumber}
                setTagNumber={sectorState.setTagNumber}
                entryInvoice={sectorState.entryInvoice}
                setEntryInvoice={sectorState.setEntryInvoice}
                entryDate={sectorState.entryDate}
                setEntryDate={sectorState.setEntryDate}
                tagPhotoUrl={sectorState.tagPhotoUrl}
                handleTagPhotoUpload={handleTagPhotoUploadLocal}
                entryObservations={sectorState.entryObservations}
                setEntryObservations={sectorState.setEntryObservations}
                services={sectorState.services}
                handleServiceChange={handleServiceChange}
                handleQuantityChange={handleQuantityChange}
                handleObservationChange={handleObservationChange}
                handlePhotoUpload={handlePhotoUpload}
                formErrors={sectorState.formErrors}
                photoRequired={photoRequired}
                handleCameraCapture={handleCameraCapture}
              />
            </TabsContent>
          </Tabs>
        ) : (
          /* Visualização desktop completa */
          <ReviewForm
            tagNumber={sectorState.tagNumber}
            setTagNumber={sectorState.setTagNumber}
            entryInvoice={sectorState.entryInvoice}
            setEntryInvoice={sectorState.setEntryInvoice}
            entryDate={sectorState.entryDate}
            setEntryDate={sectorState.setEntryDate}
            tagPhotoUrl={sectorState.tagPhotoUrl}
            handleTagPhotoUpload={handleTagPhotoUploadLocal}
            entryObservations={sectorState.entryObservations}
            setEntryObservations={sectorState.setEntryObservations}
            services={sectorState.services}
            handleServiceChange={handleServiceChange}
            handleQuantityChange={handleQuantityChange}
            handleObservationChange={handleObservationChange}
            handlePhotoUpload={handlePhotoUpload}
            formErrors={sectorState.formErrors}
            photoRequired={photoRequired}
            handleCameraCapture={handleCameraCapture}
          />
        )
      )}
      
      {/* Alerta de validação */}
      {showValidationErrors && (
        <FormValidationAlert 
          formErrors={sectorState.formErrors}
          isScrap={sectorState.isScrap}
        />
      )}
      
      {/* Botões de ação */}
      <FormActions 
        isSubmitting={isLoading || isTagPhotoUploading} 
        mode={mode} 
        isScrap={sectorState.isScrap}
      />
    </form>
  );
};

export default SectorForm;
