
import { useState } from 'react';
import { Sector, Service } from '@/types';
import { format } from 'date-fns';
import { toast } from "sonner";

interface FormState {
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
      photos: false
    };

    const selectedServices = formData.services.filter(s => s.selected);
    errors.services = selectedServices.length === 0;

    const servicesWithoutPhotos = selectedServices.filter(
      service => !service.photos || service.photos.length === 0
    );
    errors.photos = servicesWithoutPhotos.length > 0;

    return errors;
  };

  const prepareFormData = (formState: FormState, isEditing: boolean, sectorId?: string) => {
    const entryDateStr = formState.entryDate ? format(formState.entryDate, 'yyyy-MM-dd') : '';
    
    const formData: Partial<Sector> = {
      tagNumber: formState.tagNumber,
      tagPhotoUrl: formState.tagPhotoUrl,
      entryInvoice: formState.entryInvoice,
      entryDate: entryDateStr,
      peritagemDate: format(new Date(), 'yyyy-MM-dd'),
      entryObservations: formState.entryObservations,
      services: formState.services,
      beforePhotos: formState.services.flatMap(s => s.photos || []),
      afterPhotos: []
    };

    if (isEditing && formState.isScrap) {
      formData.scrapObservations = formState.scrapObservations;
      formData.scrapReturnInvoice = formState.scrapInvoice;
      formData.scrapReturnDate = formState.scrapDate ? format(formState.scrapDate, "yyyy-MM-dd") : undefined;
      formData.scrapValidated = true;
      formData.outcome = 'scrapped';
    }

    return formData;
  };

  return { validateForm, prepareFormData };
}
