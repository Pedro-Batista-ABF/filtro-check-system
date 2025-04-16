
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
import QualityForm from './forms/QualityForm';

interface SectorFormProps {
  sector: Sector;
  onSubmit: (data: Partial<Sector>) => void;
  mode?: 'review' | 'production' | 'quality' | 'scrap';
  photoRequired?: boolean;
  isLoading?: boolean;
  disableEntryFields?: boolean;
  hasAfterPhotosForAllServices?: boolean;
}

const SectorForm: React.FC<SectorFormProps> = ({
  sector,
  onSubmit,
  mode = 'review',
  photoRequired = true,
  isLoading = false,
  disableEntryFields = false,
  hasAfterPhotosForAllServices = false
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
    setScrapInvoice,
    // Campos específicos para checagem final
    exitDate,
    setExitDate,
    exitInvoice,
    setExitInvoice,
    exitObservations,
    setExitObservations,
    qualityCompleted,
    setQualityCompleted,
    selectedTab,
    setSelectedTab
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

    // Verificações específicas para o modo de qualidade
    if (mode === 'quality') {
      const qualityErrors = {
        exitInvoice: !exitInvoice.trim(),
        exitDate: !exitDate,
        photos: false
      };

      // Verificar se todos os serviços têm fotos "after"
      const selectedServices = services.filter(s => s.selected);
      const servicesWithoutAfterPhotos = selectedServices.filter(service => {
        const afterPhotos = service.photos?.filter(p => p.type === "after") || [];
        return afterPhotos.length === 0;
      });

      qualityErrors.photos = servicesWithoutAfterPhotos.length > 0;

      setFormErrors({
        ...formErrors,
        ...qualityErrors
      });

      if (Object.values(qualityErrors).some(error => error)) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      // Preparar dados para o modo de qualidade
      const qualityData: Partial<Sector> = {
        exitInvoice,
        exitDate: exitDate ? format(exitDate, 'yyyy-MM-dd') : undefined,
        exitObservations,
        checagemDate: format(new Date(), 'yyyy-MM-dd'),
        status: qualityCompleted ? 'concluido' : 'checagemFinalPendente',
        // Incluir fotos "after" de todos os serviços
        afterPhotos: services.flatMap(service => 
          (service.photos?.filter(p => p.type === "after") || []).map(photo => ({
            ...photo,
            serviceId: service.id
          }))
        )
      };

      onSubmit(qualityData);
      return;
    }

    // Para outros modos (review, production, scrap)
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
    // No modo de qualidade, não permitimos mudar a seleção dos serviços
    if (mode === 'quality') return;
    
    setServices(handleServiceChange(services, id, checked));
  };

  const onQuantityChange = (id: string, quantity: number) => {
    // No modo de qualidade, não permitimos mudar a quantidade
    if (mode === 'quality') return;
    
    setServices(handleQuantityChange(services, id, quantity));
  };

  const onObservationChange = (id: string, observations: string) => {
    setServices(handleObservationChange(services, id, observations));
  };

  const onServicePhotoUpload = async (serviceId: string, files: FileList, type: "before" | "after") => {
    // No modo de qualidade, sempre usamos "after" independente do parâmetro passado
    const photoType = mode === 'quality' ? "after" : type;
    
    setServices(await handleServicePhotoUpload(serviceId, files, photoType, services));
  };

  const onTagPhotoUpload = async (files: FileList) => {
    // No modo de qualidade, não permitimos alterar a foto da TAG
    if (mode === 'quality') return;
    
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
          exitDate={formErrors.exitDate}
          exitInvoice={formErrors.exitInvoice}
        />
      )}

      {mode === 'quality' ? (
        <>
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Informações do Setor (somente leitura)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">TAG</p>
                <p className="font-medium">{tagNumber}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Nota Fiscal de Entrada</p>
                <p className="font-medium">{entryInvoice}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Data de Entrada</p>
                <p className="font-medium">{entryDate ? format(entryDate, 'dd/MM/yyyy') : 'Não informado'}</p>
              </div>
              {tagPhotoUrl && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Foto da TAG</p>
                  <img 
                    src={tagPhotoUrl} 
                    alt="Foto da TAG" 
                    className="mt-1 w-32 h-32 object-cover rounded-md border"
                  />
                </div>
              )}
            </div>
          </Card>
          
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
            handlePhotoUpload={onServicePhotoUpload}
            formErrors={{
              photos: formErrors.photos,
              exitDate: formErrors.exitDate,
              exitInvoice: formErrors.exitInvoice
            }}
            hasAfterPhotosForAllServices={hasAfterPhotosForAllServices || false}
          />
        </>
      ) : (
        <>
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
            disabled={disableEntryFields}
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
              disabled={mode === 'quality'}
            />
          </Card>
        </>
      )}

      <FormActions
        loading={isLoading}
        mode={mode}
        isScrap={isScrap}
        qualityCompleted={qualityCompleted}
      />
    </form>
  );
};

export default SectorForm;
