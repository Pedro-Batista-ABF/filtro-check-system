import { Sector, Service, Photo, SectorStatus, CycleOutcome } from "@/types";

// Mock data for services
export const createMockServices = (): Service[] => {
  return [
    {
      id: "limpeza",
      name: "Limpeza",
      description: "Limpeza geral do equipamento",
      selected: false,
      quantity: 1,
      photos: [],
      observations: "",
      completed: false,
      type: "Limpeza"
    },
    {
      id: "teste",
      name: "Teste",
      description: "Teste de funcionamento",
      selected: false,
      quantity: 1,
      photos: [],
      observations: "",
      completed: false,
      type: "Teste"
    },
    {
      id: "reparo",
      name: "Reparo",
      description: "Reparo de componentes",
      selected: false,
      quantity: 1,
      photos: [],
      observations: "",
      completed: false,
      type: "Reparo"
    },
    {
      id: "substituicao",
      name: "Substituição",
      description: "Substituição de peças",
      selected: false,
      quantity: 1,
      photos: [],
      observations: "",
      completed: false,
      type: "Substituição"
    },
    {
      id: "pintura",
      name: "Pintura",
      description: "Pintura e acabamento",
      selected: false,
      quantity: 1,
      photos: [],
      observations: "",
      completed: false,
      type: "Pintura"
    }
  ];
};

// Mock data for photos
export const createMockPhotos = (count: number, type: 'before' | 'after' | 'tag' | 'scrap'): Photo[] => {
  return Array(count).fill(0).map((_, index) => ({
    id: `photo-${type}-${index}`,
    url: `https://placehold.co/400x300/png?text=${type}+${index}`,
    type,
    serviceId: index % 2 === 0 ? 'limpeza' : 'reparo'
  }));
};

// Create a mock sector
export const createMockSector = (id: number): Sector => {
  // Replace completedServices with appropriate properties from the Sector interface
  return {
    id: `mock-sector-${id}`,
    tagNumber: `S-${1000 + id}`,
    tagPhotoUrl: 'https://placehold.co/100x100/png',
    entryInvoice: `NF-${5000 + id}`,
    entryDate: new Date().toISOString().substring(0, 10),
    peritagemDate: new Date().toISOString().substring(0, 10),
    services: createMockServices(),
    beforePhotos: [],
    afterPhotos: [],
    status: 'peritagemPendente' as SectorStatus,
    outcome: 'EmAndamento' as CycleOutcome,
    productionCompleted: false,
    // Remove completedServices property - not in the Sector interface
    // completedServices: [],
    cycleCount: 1,
    updated_at: new Date().toISOString()
  };
};

// Create mock sectors
export const createMockSectors = (count: number): Sector[] => {
  return Array(count).fill(0).map((_, index) => {
    const sector = createMockSector(index);
    
    // Add some variety to the sectors
    if (index % 3 === 0) {
      sector.status = 'emExecucao';
      sector.services[0].selected = true;
      sector.services[1].selected = true;
      sector.beforePhotos = createMockPhotos(2, 'before');
    } else if (index % 3 === 1) {
      sector.status = 'checagemFinalPendente';
      sector.services[0].selected = true;
      sector.services[2].selected = true;
      sector.beforePhotos = createMockPhotos(2, 'before');
      sector.productionCompleted = true;
    } else {
      sector.status = 'concluido';
      sector.services[1].selected = true;
      sector.services[3].selected = true;
      sector.beforePhotos = createMockPhotos(2, 'before');
      sector.afterPhotos = createMockPhotos(2, 'after');
      sector.productionCompleted = true;
      sector.exitDate = new Date().toISOString().substring(0, 10);
      sector.exitInvoice = `NF-S-${6000 + index}`;
    }
    
    return sector;
  });
};

// Default mock data
export const mockSectors = createMockSectors(10);
export const mockServices = createMockServices();
