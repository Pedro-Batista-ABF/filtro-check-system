
import { useState } from 'react';
import { Sector, Service, CycleOutcome } from '@/types';
import { format } from 'date-fns';
import { toast } from "sonner";
import { findServicesWithoutPhotos } from '@/utils/peritagemValidation';

export interface FormState {
  tagNumber: string;
  tagPhotoUrl?: string;
  entryInvoice: string;
  entryDate?: Date;
  entryObservations: string;
  services: Service[];
  isScrap: boolean;
  scrapObservations: string;
  scrapDate?: Date;
  scrapInvoice: string;
}

export function useSectorFormSubmit() {
  const validateForm = (formData: FormState) => {
    const errors = {
      tagNumber: !formData.tagNumber.trim(),
      tagPhoto: !formData.tagPhotoUrl,
      entryInvoice: !formData.entryInvoice.trim(),
      entryDate: !formData.entryDate,
      services: false,
      photos: false,
      exitDate: false,
      exitInvoice: false,
      scrapObservations: formData.isScrap && !formData.scrapObservations.trim()
    };

    // Se não for sucateamento, verificar serviços
    if (!formData.isScrap) {
      // Verificar se ao menos um serviço foi selecionado
      const selectedServices = formData.services.filter(s => s.selected);
      errors.services = selectedServices.length === 0;

      // Verificar se serviços selecionados têm quantidade e foto
      const servicesWithoutPhotos = selectedServices.filter(
        service => !service.photos || service.photos.length === 0
      );

      // Verificar se serviços selecionados têm quantidade válida
      const servicesWithoutQuantity = selectedServices.filter(
        service => !service.quantity || service.quantity <= 0
      );

      errors.photos = servicesWithoutPhotos.length > 0 || servicesWithoutQuantity.length > 0;

      // Validação extra para o console
      if (servicesWithoutPhotos.length > 0) {
        console.warn('Serviços sem fotos:', servicesWithoutPhotos.map(s => s.name));
      }
      
      if (servicesWithoutQuantity.length > 0) {
        console.warn('Serviços sem quantidade:', servicesWithoutQuantity.map(s => s.name));
      }
    }

    return errors;
  };

  const prepareFormData = (formState: FormState, isEditing: boolean, sectorId?: string) => {
    const entryDateStr = formState.entryDate ? format(formState.entryDate, 'yyyy-MM-dd') : '';
    
    // Caso especial: sucateamento
    if (formState.isScrap) {
      return {
        tagNumber: formState.tagNumber,
        tagPhotoUrl: formState.tagPhotoUrl,
        entryInvoice: formState.entryInvoice,
        entryDate: entryDateStr,
        entryObservations: formState.entryObservations,
        peritagemDate: format(new Date(), 'yyyy-MM-dd'),
        scrapObservations: formState.scrapObservations,
        scrapReturnInvoice: formState.scrapInvoice || "",
        scrapReturnDate: formState.scrapDate ? format(formState.scrapDate, "yyyy-MM-dd") : undefined,
        status: 'sucateadoPendente',
        outcome: 'Sucateado' as CycleOutcome,
        services: [],
        beforePhotos: [],
        afterPhotos: []
      } as Partial<Sector>;
    }

    // Caso normal
    // Filtrar apenas serviços selecionados e garantir que possuem quantidade
    const selectedServices = formState.services
      .filter(service => service.selected)
      .map(service => ({
        ...service,
        quantity: service.quantity || 1, // Garantir quantidade mínima
        stage: 'peritagem' // Adicionar etapa do processo
      }));
    
    const formData: Partial<Sector> = {
      tagNumber: formState.tagNumber,
      tagPhotoUrl: formState.tagPhotoUrl,
      entryInvoice: formState.entryInvoice,
      entryDate: entryDateStr,
      peritagemDate: format(new Date(), 'yyyy-MM-dd'),
      entryObservations: formState.entryObservations,
      services: selectedServices,
      beforePhotos: selectedServices.flatMap(s => (s.photos || []).map(photo => ({
        ...photo,
        stage: 'peritagem', // Garantir que fotos tenham etapa
        serviceId: s.id
      }))),
      afterPhotos: []
    };

    if (isEditing && formState.isScrap) {
      formData.scrapObservations = formState.scrapObservations;
      formData.scrapReturnInvoice = formState.scrapInvoice;
      formData.scrapReturnDate = formState.scrapDate ? format(formState.scrapDate, "yyyy-MM-dd") : undefined;
      formData.scrapValidated = true;
      formData.outcome = 'Sucateado' as CycleOutcome;
    }

    return formData;
  };

  return { validateForm, prepareFormData };
}
