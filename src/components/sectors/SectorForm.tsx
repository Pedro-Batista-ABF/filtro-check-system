
import React, { useState, useEffect } from 'react';
import { useSectorFormState } from '@/hooks/useSectorFormState';
import { useSectorFormSubmit } from '@/hooks/useSectorFormSubmit';
import { useSectorServiceHandling } from '@/hooks/useSectorServiceHandling';
import { useSectorPhotoHandling } from '@/hooks/useSectorPhotoHandling';
import { Sector, Service, PhotoWithFile } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from '@/hooks/use-mobile';
import ScrapToggle from './forms/ScrapToggle';
import ScrapForm from './forms/ScrapForm';
import ReviewForm from './forms/ReviewForm';
import FormActions from './forms/FormActions';
import { FormValidationAlert } from './form-parts/FormValidationAlert';
import { usePhotosManagement } from '@/hooks/usePhotosManagement';

interface SectorFormProps {
  initialSector: Sector;
  onSubmit: (data: Partial<Sector>) => Promise<void>;
  mode: 'peritagem' | 'production' | 'quality' | 'scrap';
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
  const [scrapPhotos, setScrapPhotos] = useState<PhotoWithFile[]>([]);
  
  // Hooks para gerenciamento de estado e submissão do formulário
  const sectorState = useSectorFormState(initialSector);
  const { validateForm, prepareFormData } = useSectorFormSubmit();
  
  // Hooks para manipulação de serviços e fotos
  const { 
    handleServiceChange, 
    handleQuantityChange, 
    handleObservationChange 
  } = useSectorServiceHandling();
  
  const { 
    handleTagPhotoUpload,
    handlePhotoUpload,
    handleCameraCapture 
  } = useSectorPhotoHandling(sectorState.services, sectorState.setServices);
  
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
      
      // Set scrap photos if available
      if (initialSector.scrapPhotos && initialSector.scrapPhotos.length > 0) {
        setScrapPhotos(initialSector.scrapPhotos as PhotoWithFile[]);
      }
    }
  }, [initialSector]);
  
  // Handle scrap photo upload
  const handleScrapPhotoUpload = (files: FileList) => {
    if (!files.length) return;
    
    const newPhotos: PhotoWithFile[] = [...scrapPhotos];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      newPhotos.push({
        id: `scrap-${Date.now()}-${i}`,
        file,
        url: URL.createObjectURL(file),
        type: 'scrap'
      });
    }
    
    setScrapPhotos(newPhotos);
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
      scrapInvoice: sectorState.scrapInvoice,
      scrapPhotos: scrapPhotos
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

  // Funções para lidar com a mudança de serviços adaptadas para a interface esperada
  const onServiceChange = (id: string, checked: boolean) => {
    const updatedServices = handleServiceChange(sectorState.services, id, checked);
    sectorState.setServices(updatedServices);
  };

  const onQuantityChange = (id: string, quantity: number) => {
    const updatedServices = handleQuantityChange(sectorState.services, id, quantity);
    sectorState.setServices(updatedServices);
  };

  const onObservationChange = (id: string, observations: string) => {
    const updatedServices = handleObservationChange(sectorState.services, id, observations);
    sectorState.setServices(updatedServices);
  };

  // Função para lidar com upload de foto da TAG
  const handleTagPhotoUploadLocal = async (files: FileList) => {
    const url = await handleTagPhotoUpload(files);
    if (url) {
      sectorState.setTagPhotoUrl(url);
    }
  };
  
  return (
    <form onSubmit={handleFormSubmit} className="space-y-6">
      {/* Toggle para modo sucateamento */}
      {mode === 'peritagem' && (
        <ScrapToggle
          isScrap={sectorState.isScrap}
          setIsScrap={sectorState.setIsScrap}
          scrapObservations={sectorState.scrapObservations}
          setScrapObservations={sectorState.setScrapObservations}
          scrapPhotos={scrapPhotos}
          handleScrapPhotoUpload={handleScrapPhotoUpload}
          onCameraCapture={handleCameraCapture}
          error={{
            observations: sectorState.formErrors.scrapObservations,
            photos: sectorState.formErrors.scrapPhotos
          }}
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
          scrapPhotos={scrapPhotos}
          handleScrapPhotoUpload={handleScrapPhotoUpload}
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
                handleServiceChange={onServiceChange}
                handleQuantityChange={onQuantityChange}
                handleObservationChange={onObservationChange}
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
                handleServiceChange={onServiceChange}
                handleQuantityChange={onQuantityChange}
                handleObservationChange={onObservationChange}
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
            handleServiceChange={onServiceChange}
            handleQuantityChange={onQuantityChange}
            handleObservationChange={onObservationChange}
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
        loading={isLoading} 
        mode={mode} 
        isScrap={sectorState.isScrap}
      />
    </form>
  );
};

export default SectorForm;
