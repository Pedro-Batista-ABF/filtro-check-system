export type ServiceType = 
  | 'substituicao_parafusos'
  | 'troca_trecho'
  | 'desempeno'
  | 'troca_tela_lado_a'
  | 'troca_tela_lado_b'
  | 'troca_ambos_lados'
  | 'fabricacao_canaleta'
  | 'fabricacao_setor_completo';

export interface Photo {
  id: string;
  url: string;
  type: 'before' | 'after';
  serviceId?: ServiceType;
}

export interface Service {
  id: ServiceType;
  name: string;
  selected: boolean;
  quantity?: number;
  photos?: Photo[];
  observations?: string;
}

export type SectorStatus = 
  | 'peritagemPendente' 
  | 'emExecucao' 
  | 'checagemFinalPendente' 
  | 'concluido'
  | 'sucateado'
  | 'sucateadoPendente';

export type CycleOutcome = 'Recuperado' | 'Sucateado' | 'EmAndamento';

export interface Cycle {
  id: string;
  tagNumber: string;
  entryInvoice: string;
  entryDate: string;
  peritagemDate: string;
  services: Service[];
  beforePhotos: Photo[];
  entryObservations?: string;
  
  // Execução field
  productionCompleted: boolean;
  
  // Checagem final fields
  exitDate?: string;
  exitInvoice?: string;
  checagemDate?: string;
  afterPhotos?: Photo[];
  completedServices?: ServiceType[];
  exitObservations?: string;
  
  // Sucateamento fields
  scrapObservations?: string;
  scrapPhotos?: Photo[];
  scrapValidated?: boolean;
  scrapReturnDate?: string;
  scrapReturnInvoice?: string;
  
  status: SectorStatus;
  outcome: CycleOutcome;
}

export interface Sector {
  id: string;
  tagNumber: string;
  tagPhotoUrl?: string;
  entryInvoice: string;
  entryDate: string;
  peritagemDate: string;
  services: Service[];
  beforePhotos: Photo[];
  entryObservations?: string;
  
  // Execução field
  productionCompleted: boolean;
  
  // Checagem final fields
  exitDate?: string;
  exitInvoice?: string;
  checagemDate?: string;
  afterPhotos?: Photo[];
  completedServices?: ServiceType[];
  exitObservations?: string;
  
  // Sucateamento fields
  scrapObservations?: string;
  scrapPhotos?: Photo[];
  scrapValidated?: boolean;
  scrapReturnDate?: string;
  scrapReturnInvoice?: string;
  
  // History tracking
  cycleCount: number;
  previousCycles?: Cycle[];
  
  status: SectorStatus;
  outcome?: CycleOutcome;
}

export interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
}

// You can add these extensions to the Sector interface to track user actions
export interface SectorWithUserTracking extends Sector {
  _createdBy?: string;
  _createdAt?: string;
  _updatedBy?: string;
  _updatedAt?: string;
}

export interface PhotoWithUserTracking extends Photo {
  _addedBy?: string;
  _addedAt?: string;
}
