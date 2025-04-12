
export type ServiceType = 
  | 'substituicao_parafusos'
  | 'troca_trecho'
  | 'desempeno'
  | 'troca_tela_lado_a'
  | 'troca_tela_lado_b'
  | 'troca_ambos_lados'
  | 'fabricacao_canaleta'
  | 'fabricacao_setor_completo';

export interface Service {
  id: ServiceType;
  name: string;
  selected: boolean;
  quantity?: number;
  photos?: Photo[];
  observations?: string;
}

export interface Photo {
  id: string;
  url: string;
  type: 'before' | 'after';
  serviceId?: ServiceType;
}

export interface Sector {
  id: string;
  tagNumber: string;
  tagPhotoUrl?: string;
  entryInvoice: string;
  entryDate: string;
  services: Service[];
  beforePhotos: Photo[];
  entryObservations?: string;
  
  // Checagem final fields
  exitDate?: string;
  exitInvoice?: string;
  afterPhotos?: Photo[];
  completedServices?: ServiceType[];
  exitObservations?: string;
  
  status: 'peritagemPendente' | 'emExecucao' | 'checagemFinalPendente' | 'concluido';
}
