
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
  productionCompleted: boolean;
  exitDate?: string;
  exitInvoice?: string;
  checagemDate?: string;
  afterPhotos?: Photo[];
  exitObservations?: string;
  scrapObservations?: string;
  scrapPhotos?: Photo[];
  scrapValidated?: boolean;
  scrapReturnDate?: string;
  scrapReturnInvoice?: string;
  status: SectorStatus;
  outcome?: CycleOutcome;
  cycleCount: number;
  previousCycles?: Cycle[];
}

export type SectorStatus =
  | 'peritagemPendente'
  | 'emExecucao'
  | 'producaoPendente'
  | 'producaoEmAndamento'
  | 'expedicaoPendente'
  | 'expedicaoEmAndamento'
  | 'finalizado'
  | 'sucateadoPendente'
  | 'sucateadoValidado';

export type CycleOutcome =
  | 'EmAndamento'
  | 'Rejeitado'
  | 'Retrabalho'
  | 'Aprovado'
  | 'Expedido'
  | 'scrapped';

export interface Service {
  id: string;
  name: string;
  selected: boolean;
  type: ServiceType;
  quantity?: number;
  observations?: string;
  photos?: Photo[];
}

export type ServiceType =
  | 'Limpeza'
  | 'TesteFuncional'
  | 'ReparoDeComponentes'
  | 'SubstituicaoDePecas'
  | 'Soldagem'
  | 'Pintura'
  | 'Acabamento'
  | 'TesteDeQualidade'
  | 'Embalagem';

export interface Cycle {
  id: string;
  createdAt: string;
  outcome: CycleOutcome;
  comments: string;
  technicianId: string;
  tagNumber: string;
  entryInvoice: string;
  entryDate: string;
  peritagemDate: string;
  services: Service[];
  beforePhotos: Photo[];
  productionCompleted: boolean;
  status: string;
}

export interface Photo {
  id: string;
  url: string;
  type: 'before' | 'after';
  serviceId?: ServiceType;
}

// Novo tipo para trabalhar com uploads de arquivos
export interface PhotoWithFile extends Photo {
  file?: File;
}
