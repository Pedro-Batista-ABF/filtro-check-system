
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

  // Verificar se todos os serviços selecionados têm pelo menos uma foto
  const servicesWithoutPhotos = findServicesWithoutPhotos(selectedServices);
  if (servicesWithoutPhotos.length > 0) {
    return { 
      error: `Os seguintes serviços estão sem fotos: ${servicesWithoutPhotos.join(", ")}` 
    };
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

/**
 * Validar se formulário possui todos os dados obrigatórios
 * @param data 
 * @returns Objeto com erros do formulário
 */
export const validatePeritagemForm = (data: {
  tagNumber?: string,
  tagPhotoUrl?: string,
  entryInvoice?: string,
  entryDate?: Date | string,
  services?: Service[]
}) => {
  const errors = {
    tagNumber: !data.tagNumber?.trim(),
    tagPhoto: !data.tagPhotoUrl,
    entryInvoice: !data.entryInvoice?.trim(),
    entryDate: !data.entryDate,
    services: false,
    photos: false
  };

  // Verificar serviços
  const selectedServices = data.services?.filter(s => s.selected) || [];
  errors.services = selectedServices.length === 0;

  // Verificar fotos dos serviços
  const servicesWithoutPhotos = selectedServices.filter(
    service => !service.photos || service.photos.length === 0
  );
  errors.photos = servicesWithoutPhotos.length > 0;

  return {
    errors,
    hasErrors: Object.values(errors).some(error => error),
    servicesWithoutPhotos: servicesWithoutPhotos.map(s => s.name)
  };
};
