
import { Service } from "@/types";

export function useSectorServiceHandling() {
  const handleServiceChange = (services: Service[], id: string, checked: boolean): Service[] => {
    return services.map(service => 
      service.id === id 
        ? { ...service, selected: checked } 
        : service
    );
  };

  const handleQuantityChange = (services: Service[], id: string, quantity: number): Service[] => {
    return services.map(service => 
      service.id === id 
        ? { ...service, quantity } 
        : service
    );
  };

  const handleObservationChange = (services: Service[], id: string, observations: string): Service[] => {
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
