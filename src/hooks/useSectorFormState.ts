
import { useState } from 'react';
import { Service, Sector } from '@/types';
import { format } from 'date-fns';

export function useSectorFormState(sector: Sector) {
  const [tagNumber, setTagNumber] = useState(sector.tagNumber || '');
  const [entryInvoice, setEntryInvoice] = useState(sector.entryInvoice || '');
  const [entryDate, setEntryDate] = useState<Date | undefined>(
    sector.entryDate ? new Date(sector.entryDate) : new Date()
  );
  const [tagPhotoUrl, setTagPhotoUrl] = useState<string | undefined>(sector.tagPhotoUrl);
  const [entryObservations, setEntryObservations] = useState(sector.entryObservations || '');
  const [services, setServices] = useState<Service[]>(
    Array.isArray(sector.services) ? sector.services : []
  );
  const [formErrors, setFormErrors] = useState({
    tagNumber: false,
    tagPhoto: false,
    entryInvoice: false,
    entryDate: false,
    services: false,
    photos: false
  });
  const [isScrap, setIsScrap] = useState(false);
  const [scrapObservations, setScrapObservations] = useState('');
  const [scrapDate, setScrapDate] = useState<Date | undefined>();
  const [scrapInvoice, setScrapInvoice] = useState('');

  return {
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
  };
}
