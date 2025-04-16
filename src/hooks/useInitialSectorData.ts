
import { useState } from 'react';
import { Sector, Service } from '@/types';
import { format } from 'date-fns';

export function useInitialSectorData() {
  const [defaultSector, setDefaultSector] = useState<Sector | null>(null);
  const [dataReady, setDataReady] = useState(false);
  const [loadStartTime] = useState(Date.now());
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const [servicesFetched, setServicesFetched] = useState(false);

  const createDefaultSector = (availableServices: Service[]): Sector => {
    if (!Array.isArray(availableServices) || availableServices.length === 0) {
      console.error("useInitialSectorData: Não é possível criar setor padrão sem serviços, usando padrões emergenciais");
      availableServices = [{
        id: "servico_emergencial",
        name: "Serviço Emergencial",
        selected: false,
        type: "servico_emergencial" as any,
        photos: [],
        quantity: 1
      }];
    }
    
    const now = new Date();
    const nowStr = format(now, 'yyyy-MM-dd');
    
    return {
      id: '',
      tagNumber: '',
      tagPhotoUrl: '',
      entryInvoice: '',
      entryDate: nowStr,
      peritagemDate: nowStr,
      services: availableServices,
      beforePhotos: [],
      afterPhotos: [],
      scrapPhotos: [],
      productionCompleted: false,
      cycleCount: 1,
      status: 'peritagemPendente',
      outcome: 'EmAndamento',
      updated_at: now.toISOString()
    } as Sector;
  };

  return {
    defaultSector,
    setDefaultSector,
    dataReady,
    setDataReady,
    loadStartTime,
    loadingTimeout,
    setLoadingTimeout,
    servicesFetched,
    setServicesFetched,
    createDefaultSector
  };
}
