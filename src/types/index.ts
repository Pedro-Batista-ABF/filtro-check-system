
export type ServiceType = 
  | 'substituicao_parafusos'
  | 'troca_trecho'
  | 'desempeno'
  | 'troca_tela_lado_a'
  | 'troca_tela_lado_b'
  | 'troca_ambos_lados'
  | 'fabricacao_canaleta'
  | 'fabricacao_setor_completo'
  | 'lavagem'
  | 'pintura'
  | 'troca_elemento';

export interface Photo {
  id: string;
  url: string;
  type: 'before' | 'after' | 'tag' | 'scrap';
  serviceId?: string;
  file?: File;
}

// Interface para trabalhar com uploads de arquivos
export interface PhotoWithFile extends Photo {
  file?: File;
}

// Add this at the appropriate place in your types file
export interface PhotoWithMetadata extends Photo {
  metadata?: {
    sector_id?: string;
    service_id?: string;
    stage?: 'peritagem' | 'checagem';
    type?: 'tag' | 'servico' | 'geral';
  };
}

export interface Service {
  id: string;
  name: string;
  selected: boolean;
  completed?: boolean;
  type: ServiceType; // Make sure we're using ServiceType here
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
  | 'sucateadoPendente'
  | 'aguardandoChecagem'
  | 'checagemCompleta';

export type CycleOutcome = 
  | 'recovered' 
  | 'scrapped' 
  | 'EmAndamento'
  | 'EmProcessoSucateamento';

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
  completedServices?: string[];
  exitObservations?: string;
  
  // Sucateamento fields
  scrapObservations?: string;
  scrapPhotos?: Photo[];
  scrapValidated?: boolean;
  scrapReturnDate?: string;
  scrapReturnInvoice?: string;
  
  status: SectorStatus;
  outcome: CycleOutcome;
  createdAt?: string;
  comments?: string;
  technicianId?: string;
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
  completedServices?: string[];
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
  cycles?: Cycle[];
  comments?: string;
  
  status: SectorStatus;
  outcome?: CycleOutcome;
  
  // Campos necessários para o Supabase
  updated_at?: string;
  modified_at?: string;
  created_at?: string;
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
