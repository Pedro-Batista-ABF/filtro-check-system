
// Add this at the appropriate place in your types file
export interface PhotoWithMetadata extends Photo {
  metadata?: {
    sector_id?: string;
    service_id?: string;
    stage?: 'peritagem' | 'checagem';
    type?: 'tag' | 'servico' | 'geral';
  };
}
