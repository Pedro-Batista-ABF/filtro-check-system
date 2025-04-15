
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
  const [defaultSector, setDefaultSector] = useState<Sector | null>(null);

  // Inicializar o setor padrão logo que possível
  useEffect(() => {
    if (services && services.length > 0 && !defaultSector) {
      const newDefaultSector = getDefaultSector(services);
      setDefaultSector(newDefaultSector);
    }
  }, [services, getDefaultSector, defaultSector]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setErrorMessage(null);
        
        // Primeiro carregamos os serviços padrão
        await fetchDefaultServices();
        
        if (isEditing && id) {
          // Se estiver editando, busca os dados do setor
          await fetchSector();
        }
      } catch (error) {
        console.error("Error loading peritagem data:", error);
        setErrorMessage("Erro ao carregar dados. Tente novamente mais tarde.");
        toast.error("Erro ao carregar dados", {
          description: "Ocorreu um erro ao carregar os dados. Tente novamente."
        });
      } finally {
        // Garantir que o loading seja desativado mesmo em caso de erro
        setLoading(false);
      }
    };

    loadData();
  }, [id, isEditing, fetchSector, fetchDefaultServices]);

  return {
    sector,
    defaultSector: defaultSector || getDefaultSector(services || []),
    loading,
    errorMessage,
    isEditing,
    services
  };
}
