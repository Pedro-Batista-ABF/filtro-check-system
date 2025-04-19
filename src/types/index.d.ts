export interface User {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
}

export type SectorStatus =
  | 'peritagemPendente'
  | 'emExecucao'
  | 'pendenteChecagem'
  | 'finalizado'
  | 'rejeitado'
  | 'aguardandoRetrabalho'
  | 'sucateadoPendente'
  | 'sucateadoAprovado'
  | 'sucateadoRejeitado';

export type CycleOutcome =
  | 'EmAndamento'
  | 'Aprovado'
  | 'Reprovado'

export interface Sector {
  id: string;
  tagNumber: string;
  tagPhotoUrl?: string;
  entryInvoice: string;
  entryDate: string;
  peritagemDate?: string;
  services: Service[];
  beforePhotos: Photo[];
  afterPhotos: Photo[];
  scrapPhotos: Photo[];
  productionCompleted: boolean;
  cycleCount: number;
  status: SectorStatus;
  outcome?: CycleOutcome;
  updated_at?: string;
  scrapObservations?: string;
}

export interface Photo {
  id: string;
  url: string;
  type: 'before' | 'after' | 'scrap' | 'tag';
  serviceId?: string;
  cycleId?: string;
}

export interface ServiceType {
  id: string;
  name: string;
  description?: string;
}

export interface Service {
  id: string;
  name: string;
  description?: string;
  selected: boolean;
  photos: Photo[];
  quantity?: number;
  observations?: string;
  completed?: boolean;
  stage?: 'peritagem' | 'execucao' | 'checagem';
  type?: string;
}
