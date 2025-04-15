
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
        setErrorMessage(null);
        
        // Primeiro carregamos os serviços padrão
        const defaultServices = await fetchDefaultServices();
        
        if (isEditing && id) {
          // Se estiver editando, busca os dados do setor
          await fetchSector();
        }
        
        setLoading(false);
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

  // Obter o setor padrão com serviços padrão
  const defaultSector = getDefaultSector(services || []);

  return {
    sector,
    defaultSector,
    loading,
    errorMessage,
    isEditing
  };
}
