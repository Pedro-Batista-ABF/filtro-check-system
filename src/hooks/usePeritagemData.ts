
import { useState, useEffect } from "react";
import { Sector } from "@/types";
import { useSectorFetch } from "./useSectorFetch";
import { useServicesManagement } from "./useServicesManagement";
import { toast } from "sonner";

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
        // First load the default services
        const defaultServices = await fetchDefaultServices();
        
        if (isEditing && id) {
          // If editing, fetch the sector data
          await fetchSector();
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error loading peritagem data:", error);
        setErrorMessage("Erro ao carregar dados. Tente novamente mais tarde.");
        toast.error("Erro ao carregar dados", {
          description: "Ocorreu um erro ao carregar os dados. Tente novamente."
        });
        setLoading(false);
      }
    };

    loadData();
  }, [id, isEditing, fetchSector, fetchDefaultServices]);

  // Get the default sector with default services
  const defaultSector = getDefaultSector(services || []);

  return {
    sector,
    defaultSector,
    loading,
    errorMessage,
    isEditing
  };
}
