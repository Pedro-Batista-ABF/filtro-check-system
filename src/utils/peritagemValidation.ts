/**
 * Valida os dados do formulário de peritagem
 */
export const validatePeritagemData = (data: any): { valid: boolean; error: string } | null => {
  if (!data.tagNumber) {
    return { valid: false, error: "Número da TAG do setor é obrigatório" };
  }

  if (!data.entryInvoice) {
    return { valid: false, error: "Nota fiscal de entrada é obrigatória" };
  }

  if (!data.entryDate) {
    return { valid: false, error: "Data de entrada é obrigatória" };
  }

  if (!data.services || !Array.isArray(data.services) || data.services.length === 0) {
    return { valid: false, error: "Selecione pelo menos um serviço" };
  }

  const selectedServices = data.services.filter((service: any) => service.selected);
  if (selectedServices.length === 0) {
    return { valid: false, error: "Selecione pelo menos um serviço" };
  }

  return null;
};

/**
 * Encontra serviços que não possuem fotos
 */
export const findServicesWithoutPhotos = (services: any[]): any[] => {
  if (!services || !Array.isArray(services)) return [];
  
  return services.filter(service => {
    // Verificar se o serviço tem a propriedade photos definida e se é um array
    if (!service.photos || !Array.isArray(service.photos)) {
      return true;
    }
    
    // Verificar se há pelo menos uma foto com URL definida
    return service.photos.length === 0 || !service.photos.some(photo => photo.url);
  });
};
