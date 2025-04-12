
import { Sector, Service, ServiceType } from "@/types";

// Mock service options
export const serviceOptions: Service[] = [
  { id: 'substituicao_parafusos', name: 'Substituição de Parafusos', selected: false, quantity: 0 },
  { id: 'troca_trecho', name: 'Troca de trecho até 90.000mm²', selected: false },
  { id: 'desempeno', name: 'Desempeno', selected: false },
  { id: 'troca_tela_lado_a', name: 'Troca de tela lado A', selected: false },
  { id: 'troca_tela_lado_b', name: 'Troca de tela lado B', selected: false },
  { id: 'troca_ambos_lados', name: 'Troca de ambos os lados', selected: false },
  { id: 'fabricacao_canaleta', name: 'Fabricação canaleta', selected: false },
  { id: 'fabricacao_setor_completo', name: 'Fabricação setor completo', selected: false },
];

// Function to generate a mock sector with random services
const generateMockSector = (id: number): Sector => {
  const randomServices = serviceOptions.map(service => ({
    ...service,
    selected: Math.random() > 0.6,
    quantity: service.id === 'substituicao_parafusos' ? Math.floor(Math.random() * 20) : undefined
  }));

  const status = Math.random() > 0.7 
    ? 'concluido' 
    : Math.random() > 0.5 
      ? 'checagemFinalPendente' 
      : Math.random() > 0.3 
        ? 'emExecucao' 
        : 'peritagemPendente';

  return {
    id: `sector-${id}`,
    tagNumber: `TAG-${1000 + id}`,
    tagPhotoUrl: 'https://placehold.co/300x200?text=TAG+Photo',
    entryInvoice: `NF-${5000 + id}`,
    entryDate: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    services: randomServices,
    beforePhotos: [
      { id: `photo-before-1-${id}`, url: 'https://placehold.co/600x400?text=Before+Photo+1', type: 'before' },
      { id: `photo-before-2-${id}`, url: 'https://placehold.co/600x400?text=Before+Photo+2', type: 'before' },
    ],
    entryObservations: 'Observações sobre o estado inicial do setor.',
    status,
    exitDate: status === 'concluido' ? new Date().toISOString().split('T')[0] : undefined,
    exitInvoice: status === 'concluido' ? `NF-S-${6000 + id}` : undefined,
    afterPhotos: status === 'concluido' || status === 'checagemFinalPendente' ? [
      { id: `photo-after-1-${id}`, url: 'https://placehold.co/600x400?text=After+Photo+1', type: 'after' },
      { id: `photo-after-2-${id}`, url: 'https://placehold.co/600x400?text=After+Photo+2', type: 'after' },
    ] : undefined,
    completedServices: status === 'concluido' ? 
      randomServices
        .filter(service => service.selected)
        .map(service => service.id as ServiceType) 
      : undefined,
    exitObservations: status === 'concluido' ? 'Observações sobre o estado final do setor.' : undefined,
  };
};

// Generate 15 mock sectors
export const mockSectors: Sector[] = Array.from({ length: 15 }, (_, index) => 
  generateMockSector(index + 1)
);

// Mock data service
class MockDataService {
  private sectors: Sector[] = [...mockSectors];

  getAllSectors(): Sector[] {
    return this.sectors;
  }

  getSectorById(id: string): Sector | undefined {
    return this.sectors.find(sector => sector.id === id);
  }

  addSector(sector: Omit<Sector, 'id'>): Sector {
    const newSector: Sector = {
      ...sector,
      id: `sector-${Date.now()}`,
    };
    this.sectors.push(newSector);
    return newSector;
  }

  updateSector(updatedSector: Sector): Sector {
    const index = this.sectors.findIndex(sector => sector.id === updatedSector.id);
    if (index !== -1) {
      this.sectors[index] = updatedSector;
      return updatedSector;
    }
    throw new Error(`Sector with id ${updatedSector.id} not found`);
  }

  deleteSector(id: string): void {
    const index = this.sectors.findIndex(sector => sector.id === id);
    if (index !== -1) {
      this.sectors.splice(index, 1);
    }
  }
}

export const mockDataService = new MockDataService();
