
import { Service } from "@/types";
import { useState, useEffect } from "react";
import { useServiceLoader } from "./useServiceLoader";

export function useServicesManagement() {
  const [services, setServices] = useState<Service[]>([]);
  const [initialized, setInitialized] = useState(false);
  const { loading, setLoading, error, setError, loadServices } = useServiceLoader();

  const fetchDefaultServices = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const loadedServices = await loadServices();
      setServices(loadedServices);
      setInitialized(true);
      
      return loadedServices;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialized && loading) {
      fetchDefaultServices();
    }
  }, [initialized, loading]);

  return {
    services,
    setServices,
    loading,
    setLoading,
    error,
    initialized,
    fetchDefaultServices
  };
}
