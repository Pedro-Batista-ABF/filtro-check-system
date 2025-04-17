
import { Service } from "@/types";

export function useSectorServiceHandling() {
  const handleServiceChange = (services: Service[], id: string, checked: boolean): Service[] => {
    if (!Array.isArray(services)) {
      console.error("services is not an array:", services);
      return [];
    }
    
    return services.map(service => 
      service.id === id 
        ? { ...service, selected: checked } 
        : service
    );
  };

  const handleQuantityChange = (services: Service[], id: string, quantity: number): Service[] => {
    if (!Array.isArray(services)) {
      console.error("services is not an array:", services);
      return [];
    }
    
    return services.map(service => 
      service.id === id 
        ? { ...service, quantity } 
        : service
    );
  };

  const handleObservationChange = (services: Service[], id: string, observations: string): Service[] => {
    if (!Array.isArray(services)) {
      console.error("services is not an array:", services);
      return [];
    }
    
    return services.map(service => 
      service.id === id 
        ? { ...service, observations } 
        : service
    );
  };

  return {
    handleServiceChange,
    handleQuantityChange,
    handleObservationChange
  };
}
