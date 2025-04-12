
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

export interface Sector {
  id: string;
  tagNumber: string;
  tagPhotoUrl?: string;
  entryInvoice: string;
  entryDate: string;
  peritagemDate: string; // Peritagem date
  services: Service[];
  beforePhotos: Photo[];
  entryObservations?: string;
  
  // Execução field
  productionCompleted: boolean; // New field for production completion
  
  // Checagem final fields
  exitDate?: string;
  exitInvoice?: string;
  checagemDate?: string; // Checagem quality date
  afterPhotos?: Photo[];
  completedServices?: ServiceType[];
  exitObservations?: string;
  
  status: 'peritagemPendente' | 'emExecucao' | 'checagemFinalPendente' | 'concluido';
}
