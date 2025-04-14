
import { Sector, Service } from "@/types";

/**
 * Validates sector data for peritagem submission
 * @param data Partial sector data
 * @returns Object with error message or null if valid
 */
export const validatePeritagemData = (data: Partial<Sector>): { error: string } | null => {
  // Validate required fields
  if (!data.tagNumber) {
    return { error: "Número do TAG é obrigatório" };
  }

  if (!data.entryInvoice) {
    return { error: "Nota fiscal de entrada é obrigatória" };
  }

  if (!data.tagPhotoUrl) {
    return { error: "Foto do TAG é obrigatória" };
  }

  // Verify services
  const selectedServices = data.services?.filter(service => service.selected) || [];
  if (selectedServices.length === 0) {
    return { error: "Selecione pelo menos um serviço" };
  }

  return null;
};

/**
 * Finds services without photos and returns their names
 * @param services Services to check
 * @returns Array of service names that don't have photos
 */
export const findServicesWithoutPhotos = (services: Service[]): string[] => {
  const servicesWithoutPhotos = services
    .filter(service => service.selected && (!service.photos || service.photos.length === 0))
    .map(s => s.name);
    
  return servicesWithoutPhotos;
};
