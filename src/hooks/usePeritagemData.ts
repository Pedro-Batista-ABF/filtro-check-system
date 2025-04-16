
import { useState, useEffect } from "react";
import { Sector } from "@/types";
import { useSectorFetch } from "./useSectorFetch";
import { useServicesManagement } from "./useServicesManagement";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function usePeritagemData(id?: string) {
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { sector, fetchSector, getDefaultSector } = useSectorFetch(id);
  const { services, fetchDefaultServices } = useServicesManagement();
  const isEditing = !!id;
  const [defaultSector, setDefaultSector] = useState<Sector | null>(null);
  const [dataReady, setDataReady] = useState(false);
  const { isAuthenticated, loading: authLoading } = useAuth();

  // Verificar estado de autenticação usando o hook useAuth
  useEffect(() => {
    if (authLoading) return; // Aguardar carregamento da autenticação
    
    if (!isAuthenticated) {
      console.error("Usuário não autenticado - useAuth");
      setErrorMessage("Você precisa estar logado para acessar esta página. Por favor, faça login novamente.");
      setLoading(false);
    }
  }, [isAuthenticated, authLoading]);

  // Inicializar o setor padrão logo que os serviços estiverem disponíveis
  useEffect(() => {
    if (services && services.length > 0 && !defaultSector) {
      try {
        const newDefaultSector = getDefaultSector(services);
        console.log("Default sector criado com sucesso", newDefaultSector);
        setDefaultSector(newDefaultSector);
      } catch (error) {
        console.error("Erro ao criar setor padrão:", error);
        setErrorMessage("Erro ao criar dados padrão do setor.");
        setLoading(false);
      }
    }
  }, [services, getDefaultSector, defaultSector]);

  // Carregar dados apenas quando autenticado
  useEffect(() => {
    if (authLoading) return; // Aguardar carregamento da autenticação
    if (!isAuthenticated) return; // Não carregar dados se não estiver autenticado
    
    const loadData = async () => {
      const abortController = new AbortController();
      const timeoutId = setTimeout(() => {
        if (loading) {
          console.error("Timeout loading data in usePeritagemData");
          setErrorMessage("Tempo esgotado ao carregar dados. Atualize a página.");
          setLoading(false);
          abortController.abort();
        }
      }, 15000); // 15 segundos de timeout

      try {
        setLoading(true);
        setErrorMessage(null);
        
        console.log("Iniciando carregamento de serviços padrão");
        
        // Verificar sessão explicitamente por redundância
        const { data: session } = await supabase.auth.getSession();
        if (!session || !session.user) {
          console.error("Usuário não autenticado - verificação explícita");
          setErrorMessage("Você precisa estar logado para acessar esta página");
          setLoading(false);
          clearTimeout(timeoutId);
          return;
        }
        
        const loadedServices = await fetchDefaultServices();
        console.log("Serviços carregados:", loadedServices?.length || 0);
        
        if (!loadedServices || loadedServices.length === 0) {
          console.error("Nenhum serviço disponível");
          setErrorMessage("Não foram encontrados serviços disponíveis. Entre em contato com o suporte.");
          setLoading(false);
          clearTimeout(timeoutId);
          return;
        }
        
        if (isEditing && id) {
          console.log("Carregando dados do setor:", id);
          await fetchSector();
        }
        
        setDataReady(true);
        clearTimeout(timeoutId);
        setLoading(false);
      } catch (error) {
        console.error("Error loading peritagem data:", error);
        setErrorMessage(error instanceof Error 
          ? `Erro ao carregar dados: ${error.message}` 
          : "Erro ao carregar dados. Tente novamente mais tarde.");
        toast.error("Erro ao carregar dados", {
          description: "Ocorreu um erro ao carregar os dados. Tente novamente."
        });
        setLoading(false);
        clearTimeout(timeoutId);
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
  }, [id, isEditing, fetchSector, fetchDefaultServices, isAuthenticated, authLoading, loading]);

  // Garantir que temos dados válidos antes de prosseguir
  const hasValidServices = services && services.length > 0;
  const validDefaultSector = defaultSector || 
    (hasValidServices ? getDefaultSector(services) : null);

  return {
    sector,
    defaultSector: validDefaultSector,
    loading,
    errorMessage,
    isEditing,
    services,
    hasValidData: !loading && !errorMessage && (!!validDefaultSector || !!sector) && hasValidServices,
    dataReady
  };
}
