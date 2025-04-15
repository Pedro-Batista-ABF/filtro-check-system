
import { useState, useEffect } from "react";
import { Sector } from "@/types";
import { useSectorFetch } from "./useSectorFetch";
import { useServicesManagement } from "./useServicesManagement";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export function usePeritagemData(id?: string) {
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { sector, fetchSector, getDefaultSector } = useSectorFetch(id);
  const { services, fetchDefaultServices } = useServicesManagement();
  const isEditing = !!id;
  const [defaultSector, setDefaultSector] = useState<Sector | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  // Verificar autenticação do usuário
  useEffect(() => {
    async function checkAuth() {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Erro ao verificar autenticação:", error);
          setErrorMessage("Erro ao verificar autenticação. Por favor, faça login novamente.");
          setLoading(false);
        } else if (!data.session) {
          console.warn("Usuário não autenticado");
          setErrorMessage("Você precisa estar logado para acessar esta página.");
          setLoading(false);
        } else {
          console.log("Usuário autenticado com sucesso");
          setAuthChecked(true);
        }
      } catch (error) {
        console.error("Exceção ao verificar autenticação:", error);
        setErrorMessage("Erro ao verificar a sessão do usuário.");
        setLoading(false);
      }
    }
    
    checkAuth();
  }, []);

  // Inicializar o setor padrão logo que possível
  useEffect(() => {
    if (services && services.length > 0 && !defaultSector) {
      try {
        const newDefaultSector = getDefaultSector(services);
        setDefaultSector(newDefaultSector);
        console.log("Default sector criado com sucesso", newDefaultSector);
      } catch (error) {
        console.error("Erro ao criar setor padrão:", error);
        setErrorMessage("Erro ao criar dados padrão do setor.");
        setLoading(false);
      }
    }
  }, [services, getDefaultSector, defaultSector]);

  // Carregar dados apenas quando autenticado
  useEffect(() => {
    if (!authChecked) return;
    
    const loadData = async () => {
      const abortController = new AbortController();
      const timeoutId = setTimeout(() => {
        if (loading) {
          console.error("Timeout loading services");
          setErrorMessage("Tempo esgotado ao carregar serviços. Atualize a página.");
          setLoading(false);
          abortController.abort();
        }
      }, 10000); // 10 segundos de timeout

      try {
        setLoading(true);
        setErrorMessage(null);
        
        console.log("Iniciando carregamento de serviços padrão");
        const loadedServices = await fetchDefaultServices();
        console.log("Serviços carregados:", loadedServices?.length || 0);
        
        if (isEditing && id) {
          console.log("Carregando dados do setor:", id);
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
      } finally {
        clearTimeout(timeoutId);
        if (loading) setLoading(false);
      }
    };

    loadData();
    
    // Cleanup function
    return () => {
      console.log("Limpando recursos do usePeritagemData");
    };
  }, [id, isEditing, fetchSector, fetchDefaultServices, authChecked]);

  // Garantir que temos dados válidos antes de prosseguir
  const validDefaultSector = defaultSector || 
    (services && services.length > 0 ? getDefaultSector(services) : null);

  return {
    sector,
    defaultSector: validDefaultSector,
    loading,
    errorMessage,
    isEditing,
    services,
    hasValidData: !loading && (!!validDefaultSector || !!sector)
  };
}
