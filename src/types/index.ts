
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  created_at?: string;
  updated_at?: string;
}

export interface ServiceType {
  id: string;
  name: string;
  description?: string;
  price?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Service {
  id: string;
  name: string;
  description?: string;
  price?: number;
  selected: boolean;
  quantity?: number;
  observations?: string;
  photos?: (Photo | PhotoWithFile)[];
  type?: ServiceType | string;
  created_at?: string;
  updated_at?: string;
}

export interface Photo {
  id: string;
  url: string;
  type: 'before' | 'after' | 'service' | 'tag' | 'scrap';
  serviceId?: string;
  metadata?: any;
  created_at?: string;
  updated_at?: string;
}

export interface PhotoWithFile extends Photo {
  id: string;
  file: File | null;
  url: string;
  type: 'before' | 'after' | 'service' | 'tag' | 'scrap';
  serviceId?: string;
  metadata?: any;
  created_at?: string;
  updated_at?: string;
}

export interface Cycle {
  id: string;
  sector_id: string;
  tag_number: string;
  entry_invoice: string;
  entry_date: string;
  peritagem_date?: string;
  entry_observations?: string;
  production_completed: boolean;
  exit_date?: string;
  exit_invoice?: string;
  checagem_date?: string;
  exit_observations?: string;
  scrap_observations?: string;
  scrap_validated: boolean;
  scrap_return_date?: string;
  scrap_return_invoice?: string;
  status: SectorStatus;
  outcome: CycleOutcome;
  created_at?: string;
  updated_at?: string;
  comments?: string;
  technician_id?: string;
}

// Make sure SectorStatus includes the sucateadoPendente and sucateado options
export type SectorStatus = 
  | 'peritagemPendente' 
  | 'emExecucao' 
  | 'checagemFinalPendente' 
  | 'concluido'
  | 'sucateadoPendente'
  | 'sucateado';

export type CycleOutcome = 'recovered' | 'scrapped' | 'redirected' | 'EmAndamento';

export interface Sector {
  id: string;
  tagNumber: string;
  tagPhotoUrl?: string;
  entryInvoice: string;
  entryDate: string;
  peritagemDate: string;
  services: Service[];
  beforePhotos: Photo[];
  afterPhotos: Photo[];
  scrapPhotos: Photo[];
  productionCompleted: boolean;
  status: SectorStatus;
  outcome: CycleOutcome;
  cycleCount: number;
  updated_at?: string;
  entryObservations?: string;
  exitDate?: string;
  exitInvoice?: string;
  checagemDate?: string;
  exitObservations?: string;
  scrapObservations?: string;
  scrapValidated?: boolean;
  scrapReturnDate?: string;
  scrapReturnInvoice?: string;
  cycles?: Cycle[];
  nf_entrada?: string;
  nf_saida?: string;
  data_entrada?: string;
  data_saida?: string;
}
