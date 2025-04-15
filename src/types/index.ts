
export type SectorStatus =
  | "peritagemPendente"
  | "emExecucao"
  | "checagemPendente"
  | "sucateamentoPendente"
  | "finalizado"
  | "sucateado";

export type CycleOutcome =
  | "Aprovado"
  | "Reprovado"
  | "EmAndamento"
  | "recovered"
  | "scrapped";

export type Sector = {
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
  cycleCount: number;
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
  updated_at: string;
  nf_entrada?: string;
  nf_saida?: string;
  data_entrada?: string;
  data_saida?: string;
};

export type ServiceType =
  | "motor"
  | "caixaCambio"
  | "diferencial"
  | "modulo"
  | "chicote";

export type Service = {
  id: string;
  name: string;
  selected: boolean;
  type: ServiceType;
  photos?: Photo[];
  quantity?: number;
  observations?: string;
  completed?: boolean;
};

export type Photo = {
  id: string;
  url: string;
  type: 'before' | 'after' | 'scrap' | 'tag';
  serviceId?: string;
  metadata?: {
    service_id?: string;
    service_name?: string;
    stage?: 'peritagem' | 'checagem' | 'sucateamento';
    type?: string;
    sector_id?: string;
    upload_time?: string;
    existing_photo?: boolean;
    created_at?: string;
  };
};

export type PhotoWithFile = Photo & {
  file?: File;
};

export type Cycle = {
  id?: string;
  sector_id: string;
  tagNumber: string;
  entryInvoice: string;
  entryDate: string;
  peritagemDate: string;
  entryObservations?: string;
  productionCompleted?: boolean;
  exitDate?: string;
  exitInvoice?: string;
  checagemDate?: string;
  exitObservations?: string;
  scrapObservations?: string;
  scrapValidated?: boolean;
  scrapReturnDate?: string;
  scrapReturnInvoice?: string;
  status: SectorStatus;
  outcome: CycleOutcome;
  created_at?: string;
  updated_at?: string;
};
