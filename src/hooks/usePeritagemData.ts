
import { useState, useEffect } from "react";
import { Sector } from "@/types";
import { useSectorFetch } from "./useSectorFetch";
import { useServicesManagement } from "./useServicesManagement";

export function usePeritagemData(id?: string) {
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { sector, fetchSector, getDefaultSector } = useSectorFetch(id);
  const { services, fetchDefaultServices } = useServicesManagement();
  const isEditing = !!id;

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const defaultServices = await fetchDefaultServices();
        
        if (isEditing) {
          await fetchSector();
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error loading peritagem data:", error);
        setErrorMessage("Erro ao carregar dados. Tente novamente mais tarde.");
        setLoading(false);
      }
    };

    loadData();
  }, [id, isEditing, fetchSector, fetchDefaultServices]);

  const defaultSector = getDefaultSector(services);

  return {
    sector,
    defaultSector,
    loading,
    errorMessage,
    isEditing
  };
}
