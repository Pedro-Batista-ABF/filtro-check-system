
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

export interface Sector {
  id?: string;
  tagNumber: string;
  entryInvoice: string;
  entryDate: string;
  status?: SectorStatus;
  outcome?: CycleOutcome;
  services?: Service[];
  beforePhotos?: Photo[];
  afterPhotos?: Photo[];
  tagPhotoUrl?: string;
  entryObservations?: string;
  cycleCount?: number;
  current_status?: SectorStatus;
  current_outcome?: CycleOutcome;
  updated_at?: string;
  created_at?: string;
  scrapObservations?: string;
  scrapReturnDate?: string;
  scrapReturnInvoice?: string;
  scrapPhotos?: Photo[];
}

export type SectorStatus =
  | 'emExecucao'
  | 'peritagemPendente'
  | 'checagemPendente'
  | 'expedicaoPendente'
  | 'finalizado'
  | 'pendente'
  | 'aguardandoRetrabalho'
  | 'reprovado'
  | 'sucateadoPendente'
  | 'sucateado';

export type CycleOutcome =
  | 'Aprovado'
  | 'Reprovado'
  | 'Retrabalho'
  | 'Sucateado'
  | 'EmAndamento';

export interface Service {
  id: string;
  name: string;
  description?: string;
  price?: number;
  selected?: boolean;
  quantity?: number;
  photos?: Photo[];
  observations?: string;
  stage?: 'peritagem' | 'checagem';
}

export interface Photo {
  id: string;
  url: string;
  type?: PhotoType;
  serviceId?: string;
  metadata?: any;
  created_at?: string;
  updated_at?: string;
}

export interface PhotoWithFile extends Photo {
  file?: File;
}

export interface ScrapData {
  scrapObservations: string;
  scrapReturnDate: string;
  scrapReturnInvoice: string;
  scrapPhotos: Photo[];
}

// Tipo para identificar o tipo de foto, usado para uploads e validações
export type PhotoType = "before" | "after" | "scrap" | "tag" | "service";
