
import { useState, useEffect, useCallback } from "react";
import { Sector } from "@/types";
import { useSectorFetch } from "./useSectorFetch";
import { useServicesManagement } from "./useServicesManagement";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";

export function usePeritagemData(id?: string) {
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { sector, fetchSector, getDefaultSector } = useSectorFetch(id);
  const { 
    services, 
    fetchDefaultServices, 
    loading: servicesLoading, 
    error: servicesError,
    initialized: servicesInitialized 
  } = useServicesManagement();
  
  const isEditing = !!id;
  const [defaultSector, setDefaultSector] = useState<Sector | null>(null);
  const [dataReady, setDataReady] = useState(false);
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [loadStartTime] = useState(Date.now());
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const [servicesFetched, setServicesFetched] = useState(false);

  // Verificação de timeout global
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.warn("usePeritagemData: Timeout de carregamento atingido após 10s");
        setLoadingTimeout(true);
        setLoading(false);
        setErrorMessage("Tempo de carregamento excedido. Por favor, atualize a página.");
      }
    }, 10000);

    return () => clearTimeout(timeoutId);
  }, []);

  // Criar setor padrão com valores válidos
  const createDefaultSector = useCallback((availableServices: any[]) => {
    if (!Array.isArray(availableServices) || availableServices.length === 0) {
      console.error("usePeritagemData: Não é possível criar setor padrão sem serviços");
      return null;
    }
    
    const now = new Date();
    const nowStr = format(now, 'yyyy-MM-dd');
    
    return {
      id: '',
      tagNumber: '',
      tagPhotoUrl: '',
      entryInvoice: '',
      entryDate: nowStr,
      peritagemDate: nowStr,
      services: availableServices,
      beforePhotos: [],
      afterPhotos: [],
      scrapPhotos: [],
      productionCompleted: false,
      cycleCount: 1,
      status: 'peritagemPendente',
      outcome: 'EmAndamento',
      updated_at: now.toISOString()
    } as Sector;
  }, []);

  // Verificar estado de autenticação
  useEffect(() => {
    if (authLoading) return;
    
    if (!isAuthenticated) {
      console.error("usePeritagemData: Usuário não autenticado via useAuth");
      setErrorMessage("Você precisa estar logado para acessar esta página");
      setLoading(false);
    }
  }, [isAuthenticated, authLoading]);

  // Função para carregar dados com verificações de segurança
  const loadData = useCallback(async () => {
    if (authLoading || !isAuthenticated || loadingTimeout) {
      return;
    }
    
    try {
      console.log("usePeritagemData: Iniciando carregamento de dados");
      setLoading(true);
      setErrorMessage(null);
      
      // Verificação explícita de autenticação
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session?.user?.id) {
        console.error("usePeritagemData: UID ausente");
        setErrorMessage("Não foi possível verificar sua autenticação. Tente fazer login novamente.");
        setLoading(false);
        return;
      }
      
      // Carregar serviços primeiro se ainda não foram carregados
      if (!servicesFetched) {
        console.log("usePeritagemData: Buscando serviços");
        const loadedServices = await fetchDefaultServices();
        setServicesFetched(true);
        
        // Verificar se temos serviços válidos
        if (!Array.isArray(loadedServices) || loadedServices.length === 0) {
          console.error("usePeritagemData: Não foram encontrados serviços");
          setErrorMessage("Não foram encontrados serviços disponíveis. Verifique se a tabela 'service_types' está corretamente configurada.");
          setLoading(false);
          return;
        }
        
        if (!isEditing) {
          const newDefaultSector = createDefaultSector(loadedServices);
          if (newDefaultSector) {
            setDefaultSector(newDefaultSector);
            console.log("usePeritagemData: Setor padrão criado");
          } else {
            console.error("usePeritagemData: Erro ao criar setor padrão");
            setErrorMessage("Erro ao preparar formulário padrão");
            setLoading(false);
            return;
          }
        }
      }
      
      // Buscar setor existente se estivermos editando
      if (isEditing && id) {
        try {
          await fetchSector();
          console.log("usePeritagemData: Setor existente carregado");
        } catch (error) {
          console.error("usePeritagemData: Erro ao buscar setor:", error);
          setErrorMessage("Erro ao carregar dados do setor para edição");
          setLoading(false);
          return;
        }
      }
      
      setDataReady(true);
      setLoading(false);
      console.log(`usePeritagemData: 🔥 Dados carregados com sucesso em ${Date.now() - loadStartTime}ms`);
    } catch (error) {
      console.error("usePeritagemData: Erro ao carregar dados:", error);
      setErrorMessage("Erro ao carregar dados. Tente novamente mais tarde.");
      setLoading(false);
    }
  }, [isAuthenticated, authLoading, id, isEditing, loadingTimeout, servicesFetched, createDefaultSector]);

  // Iniciar carregamento quando auth estiver pronto
  useEffect(() => {
    if (!authLoading && isAuthenticated && !servicesFetched && !loadingTimeout) {
      loadData();
    }
  }, [authLoading, isAuthenticated, loadData, servicesFetched, loadingTimeout]);

  // Verificação de dados válidos
  const hasValidServices = services && Array.isArray(services) && services.length > 0;
  
  return {
    sector,
    defaultSector: defaultSector || (hasValidServices ? createDefaultSector(services) : null),
    loading,
    errorMessage: errorMessage || servicesError,
    isEditing,
    services,
    hasValidData: !loading && !errorMessage && hasValidServices && (!!defaultSector || !!sector),
    dataReady
  };
}
