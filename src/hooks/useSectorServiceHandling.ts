
import { Service } from "@/types";
import { useState } from "react";

export function useSectorServiceHandling(services: Service[], setServices: (services: Service[]) => void) {
  const handleServiceChange = (id: string, checked: boolean) => {
    if (!Array.isArray(services)) {
      console.error("services is not an array:", services);
      return;
    }
    
    const updatedServices = services.map(service => 
      service.id === id 
        ? { ...service, selected: checked } 
        : service
    );
    
    setServices(updatedServices);
  };

  const handleQuantityChange = (id: string, quantity: number) => {
    if (!Array.isArray(services)) {
      console.error("services is not an array:", services);
      return;
    }
    
    const updatedServices = services.map(service => 
      service.id === id 
        ? { ...service, quantity } 
        : service
    );
    
    setServices(updatedServices);
  };

  const handleObservationChange = (id: string, observations: string) => {
    if (!Array.isArray(services)) {
      console.error("services is not an array:", services);
      return;
    }
    
    const updatedServices = services.map(service => 
      service.id === id 
        ? { ...service, observations } 
        : service
    );
    
    setServices(updatedServices);
  };

  return {
    handleServiceChange,
    handleQuantityChange,
    handleObservationChange
  };
}
