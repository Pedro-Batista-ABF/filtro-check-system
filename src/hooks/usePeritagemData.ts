
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
        
        // Primeiro carregamos os serviços padrão com timeout de segurança
        const timeoutId = setTimeout(() => {
          if (loading) {
            console.error("Timeout loading services");
            setErrorMessage("Tempo esgotado ao carregar serviços. Atualize a página.");
            setLoading(false);
          }
        }, 10000); // 10 segundos de timeout

        await fetchDefaultServices();
        
        if (isEditing && id) {
          // Se estiver editando, busca os dados do setor
          await fetchSector();
        }
        
        clearTimeout(timeoutId);
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

  // Garantir que temos um setor padrão válido mesmo se houver erro
  const validDefaultSector = defaultSector || (services ? getDefaultSector(services || []) : null);

  return {
    sector,
    defaultSector: validDefaultSector,
    loading,
    errorMessage,
    isEditing,
    services
  };
}
