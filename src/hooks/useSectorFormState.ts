
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
    photos: false,
    exitDate: false,
    exitInvoice: false,
    scrapObservations: false
  });
  
  // Estados para sucateamento
  const [isScrap, setIsScrap] = useState(sector.status === 'sucateadoPendente' || false);
  const [scrapObservations, setScrapObservations] = useState(sector.scrapObservations || '');
  const [scrapDate, setScrapDate] = useState<Date | undefined>(
    sector.scrapReturnDate ? new Date(sector.scrapReturnDate) : undefined
  );
  const [scrapInvoice, setScrapInvoice] = useState(sector.scrapReturnInvoice || '');
  
  // Estados para checagem final
  const [exitInvoice, setExitInvoice] = useState(sector.exitInvoice || '');
  const [exitDate, setExitDate] = useState<Date | undefined>(
    sector.exitDate ? new Date(sector.exitDate) : undefined
  );
  const [exitObservations, setExitObservations] = useState(sector.exitObservations || '');
  const [qualityCompleted, setQualityCompleted] = useState(
    sector.status === 'concluido' || false
  );
  const [selectedTab, setSelectedTab] = useState('services');

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
  };
}
