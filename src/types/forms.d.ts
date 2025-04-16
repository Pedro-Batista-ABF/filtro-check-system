
import { Service, Photo, SectorStatus, CycleOutcome } from './index';

export interface SectorFormValues {
  tagNumber: string;
  entryInvoice: string;
  entryDate: string;
  peritagemDate: string;
  services: Service[];
  beforePhotos: Photo[];
  productionCompleted: boolean;
  status: SectorStatus;
  outcome: CycleOutcome;
  entryObservations?: string;
  exitDate?: string;
  exitInvoice?: string;
  checagemDate?: string;
  exitObservations?: string;
  scrapObservations?: string;
  scrapValidated?: boolean;
  scrapReturnDate?: string;
  scrapReturnInvoice?: string;
}

export type ServicePhotoType = 'before' | 'after' | 'service' | 'tag' | 'scrap';
