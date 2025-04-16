
export type SectorStatus = 
  | 'peritagemPendente' 
  | 'emExecucao' 
  | 'execucaoConcluida' 
  | 'checagemFinalPendente' 
  | 'emChecagem' 
  | 'concluido' 
  | 'sucateadoPendente' 
  | 'sucateado';

export type CycleOutcome = 
  | 'EmAndamento' 
  | 'Concluido' 
  | 'Sucateado';

export type FormMode = 'peritagem' | 'sucateamento' | 'scrap' | 'quality' | 'production';

export interface Photo {
  id: string;
  url: string;
  type: string;
  serviceId?: string;
  metadata?: any;
}

export interface PhotoWithFile extends Photo {
  file: File | null;
}

export interface Service {
  id: string;
  name: string;
  type: string;
  selected: boolean;
  quantity?: number;
  observations?: string;
  photos?: Photo[];
  stage?: string;
  completed?: boolean;
}

export interface Sector {
  id: string;
  tagNumber: string;
  tagPhotoUrl?: string;
  entryInvoice: string;
  entryDate?: string;
  peritagemDate?: string;
  entryObservations?: string;
  services: Service[];
  productionCompleted?: boolean;
  exitDate?: string;
  exitInvoice?: string;
  checagemDate?: string;
  afterPhotos?: Photo[];
  beforePhotos?: Photo[];
  exitObservations?: string;
  scrapObservations?: string;
  scrapPhotos?: PhotoWithFile[];
  scrapValidated?: boolean;
  // Adicionando campos específicos de sucateamento
  scrapReturnDate?: string;
  scrapReturnInvoice?: string;
  status: SectorStatus;
  outcome?: CycleOutcome;
  cycleCount?: number;
  cycles?: Cycle[];
  updated_at?: string;
}

export interface Cycle {
  id: string;
  sectorId: string;
  status: SectorStatus;
  createdAt: string;
  updatedAt: string;
  services?: Service[];
  photos?: Photo[];
}

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  role: 'admin' | 'producao' | 'peritagem' | 'qualidade';
}
