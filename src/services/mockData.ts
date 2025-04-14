
import { Sector, Service, Photo } from '@/types';

const services: Service[] = [
  {
    id: "substituicao_parafusos",
    name: "Substituição de Parafusos",
    description: "Substituição de parafusos danificados",
    selected: true,
    type: "substituicao_parafusos",
    quantity: 10,
    observations: "Parafusos oxidados",
    photos: []
  },
  {
    id: "troca_trecho",
    name: "Troca de Trecho",
    description: "Substituição de trecho danificado",
    selected: true,
    type: "troca_trecho",
    quantity: 2,
    observations: "Trecho com rachaduras",
    photos: []
  },
  {
    id: "desempeno",
    name: "Desempeno",
    description: "Correção de deformações",
    selected: false,
    type: "desempeno",
    quantity: 0,
    observations: "",
    photos: []
  },
  {
    id: "troca_tela_lado_a",
    name: "Troca de Tela - Lado A",
    description: "Substituição da tela do lado A",
    selected: true,
    type: "troca_tela_lado_a",
    quantity: 1,
    observations: "Tela rasgada",
    photos: []
  },
  {
    id: "troca_tela_lado_b",
    name: "Troca de Tela - Lado B",
    description: "Substituição da tela do lado B",
    selected: false,
    type: "troca_tela_lado_b",
    quantity: 0,
    observations: "",
    photos: []
  }
];

export const mockSector: Sector = {
  id: "1",
  tagNumber: "FIL-1234",
  tagPhotoUrl: "https://via.placeholder.com/150",
  entryInvoice: "NF-00001",
  entryDate: "2023-01-15",
  peritagemDate: "2023-01-16",
  services: services,
  beforePhotos: [],
  afterPhotos: [],
  scrapPhotos: [],
  productionCompleted: false,
  status: "peritagemPendente",
  outcome: "EmAndamento",
  cycleCount: 1,
  updated_at: new Date().toISOString()
};
