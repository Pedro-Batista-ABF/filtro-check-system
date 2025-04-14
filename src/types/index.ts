
export interface Photo {
  id: string;
  url: string;
  type: 'before' | 'after' | 'tag' | 'scrap';
  serviceId?: string;
  file?: File | null;
}

export interface PhotoWithFile extends Photo {
  file?: File;
}

export interface Service {
  id: string;
  name: string;
  description?: string;
  selected: boolean;
  quantity?: number;
  photos?: Photo[];
  observations?: string;
  completed?: boolean;
  type?: string;
}

export interface Cycle {
  id: string;
  tagNumber: string;
  entryInvoice: string;
  entryDate: string;
  peritagemDate?: string;
  services: Service[];
  beforePhotos: Photo[];
  status: string;
  outcome: CycleOutcome;
  createdAt: string;
  comments: string;
  technicianId: string;
  productionCompleted: boolean;
}

export type CycleOutcome =
  | "recovered"
  | "scrapped"
  | "redirected"
  | "EmAndamento";

export type ServiceType =
  | "Limpeza"
  | "Teste"
  | "Reparo"
  | "Substituição"
  | "Pintura"
  | "Acabamento";

export type SectorStatus =
  | "peritagemPendente"
  | "emExecucao"
  | "checagemFinalPendente"
  | "concluido"
  | "sucateado"
  | "sucateadoPendente";

// Add type definition for Sector with new columns from the database
export interface Sector {
  id: string;
  tagNumber: string;
  tagPhotoUrl?: string;
  entryInvoice: string;
  entryDate: string;
  peritagemDate?: string;
  services: Service[];
  beforePhotos?: Photo[];
  afterPhotos?: Photo[];
  scrapPhotos?: Photo[];
  productionCompleted?: boolean;
  exitInvoice?: string;
  exitDate?: string;
  exitObservations?: string;
  status: SectorStatus;
  outcome?: CycleOutcome;
  cycleCount?: number;
  cycles?: Cycle[];
  entryObservations?: string;
  checagemDate?: string;
  scrapObservations?: string;
  scrapValidated?: boolean;
  scrapReturnDate?: string;
  scrapReturnInvoice?: string;
  updated_at?: string;
  // Novos campos adicionados
  nf_entrada?: string;
  nf_saida?: string;
  data_entrada?: string;
  data_saida?: string;
}
