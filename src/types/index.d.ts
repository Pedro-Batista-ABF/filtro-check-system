export type PhotoType = "before" | "after";

export interface Photo {
  id: string;
  url: string;
  type: PhotoType;
  serviceId: string;
  file?: File | null;
  cycle_id?: string | null;
}

export type SectorStatus =
  | "peritagemPendente"
  | "emExecucao"
  | "aguardandoPecas"
  | "reparoEmAndamento"
  | "qualidadePendente"
  | "finalizado"
  | "sucateadoPendente"
  | "sucateado";

export type SectorOutcome =
  | "EmAndamento"
  | "Aprovado"
  | "Reprovado"
  | "Sucateado";

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
  quantity?: number;
  observations?: string;
  photos?: Photo[];
  completed?: boolean;
  stage?: string; // Add stage property to Service interface
}

export interface Sector {
  id: string;
  tagNumber: string;
  tagPhotoUrl?: string;
  entryInvoice: string;
  entryDate?: string;
  services?: Service[];
  status: SectorStatus;
  outcome?: SectorOutcome;
  cycleCount: number;
  entryObservations?: string;
  updated_at?: string;
  created_at?: string;
  scrapObservations?: string;
  scrapReturnInvoice?: string;
  scrapReturnDate?: string;
  scrapPhotos?: Photo[];
}
