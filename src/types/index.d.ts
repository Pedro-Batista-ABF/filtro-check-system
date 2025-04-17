
// Definição dos tipos para o aplicativo

export type SectorStatus = 'peritagemPendente' | 'emExecucao' | 'producaoCompleta' | 'checagemFinalPendente' | 'concluido' | 'sucateadoPendente' | 'sucateado';

export type PhotoType = 'before' | 'after' | 'tag' | 'scrap';

export interface Photo {
  id: string;
  url: string;
  type: PhotoType;
  serviceId?: string;
}

export interface PhotoWithFile extends Photo {
  file: File | null;
}

export interface Service {
  id: string;
  name: string;
  selected?: boolean;
  quantity?: number;
  observations?: string;
  photos?: Photo[];
  completed?: boolean;
  stage?: string;
}

export interface Sector {
  id: string;
  tagNumber: string;
  tagPhotoUrl?: string;
  entryInvoice: string;
  entryDate?: string;
  entryObservations?: string;
  exitInvoice?: string;
  exitDate?: string;
  exitObservations?: string;
  checagemDate?: string;
  scrapObservations?: string;
  scrapInvoice?: string;
  scrapDate?: string;
  status: SectorStatus;
  services: Service[];
  cycleCount?: number;
  beforePhotos?: Photo[];
  afterPhotos?: Photo[];
  scrapPhotos?: PhotoWithFile[];
}

export interface Session {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  user: {
    id: string;
    aud: string;
    role: string;
    email: string;
    email_confirmed_at: string;
    phone: string;
    confirmation_sent_at: string;
    confirmed_at: string;
    last_sign_in_at: string;
    app_metadata: {
      provider: string;
      providers: string[];
    };
    user_metadata: {};
    identities: any[];
    created_at: string;
    updated_at: string;
  };
}

export interface User {
  id: string;
  email: string;
  role?: string;
}
