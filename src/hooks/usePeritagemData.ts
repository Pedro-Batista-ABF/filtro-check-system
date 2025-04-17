
import { useState, useEffect, useCallback } from "react";
import { Sector, Service } from "@/types";
import { useSectorFetch } from "./useSectorFetch";
import { useAuth } from "@/contexts/AuthContext";
import { useInitialSectorData } from "./useInitialSectorData";
import { useSectorLoadingState } from "./useSectorLoadingState";
import { useServiceDataFetching } from "./useServiceDataFetching";
import { toast } from "sonner";

export function usePeritagemData(id?: string) {
  console.log("🚀 START: usePeritagemData hook initialization", Date.now());
  const [loading, setLoading] = useState(true);
  const { sector, fetchSector } = useSectorFetch(id);
  const { isAuthenticated, loading: authLoading } = useAuth();
  const isEditing = !!id;
  const [validDefaultSector, setValidDefaultSector] = useState<Sector | null>(null);
  const [defaultServices, setDefaultServices] = useState<Service[]>([]);
  const [retryCount, setRetryCount] = useState(0);

  const {
    defaultSector,
    setDefaultSector,
    dataReady,
    setDataReady,
    loadStartTime,
    createDefaultSector
  } = useInitialSectorData();

  const {
    errorMessage,
    setErrorMessage,
    loadingTimeout,
    getLogInfo
  } = useSectorLoadingState({
    loading,
    authLoading,
    isAuthenticated,
    loadStartTime,
    id
  });

  const {
    loadServices,
    servicesFetched,
    verifyConnection
  } = useServiceDataFetching();

  // Melhorado: efeito para garantir sincronização entre defaultSector e validDefaultSector
  useEffect(() => {
    console.log("🚀 useEffect for validDefaultSector sync started", Date.now());
    console.log("🚀 dataReady:", dataReady);
    console.log("🚀 defaultSector:", defaultSector?.id || "não definido");
    console.log("🚀 sector:", sector?.id || "não definido");
    console.log("🚀 isEditing:", isEditing);
    
    if (!dataReady) {
      console.log("🚀 dataReady é false, saindo do useEffect", Date.now());
      return;
    }

    if (defaultSector && !isEditing) {
      console.log("🚀 Definindo validDefaultSector a partir do defaultSector", Date.now());
      setValidDefaultSector(defaultSector);
      // Garantir que services é um array válido
      const safeServices = Array.isArray(defaultSector.services) ? 
        defaultSector.services : [];
      setDefaultServices(safeServices);
      console.log("🚀 safeServices length:", safeServices.length);
    } else if (sector && isEditing) {
      console.log("🚀 Definindo validDefaultSector a partir do sector", Date.now());
      setValidDefaultSector(sector);
      const safeServices = Array.isArray(sector.services) ? 
        sector.services : [];
      setDefaultServices(safeServices);
      console.log("🚀 safeServices length:", safeServices.length);
    }
    
    console.log("🚀 useEffect for validDefaultSector sync completed", Date.now());
  }, [defaultSector, sector, isEditing, dataReady]);

  // Melhorado: função para carregar dados com tratamento de erros aprimorado
  const loadData = useCallback(async () => {
    console.log("🚀 START: loadData", Date.now());
    if (authLoading || !isAuthenticated) {
      console.log("❌ Condições impediram loadData:", { 
        authLoading, 
        isAuthenticated: !!isAuthenticated
      });
      return;
    }
    
    try {
      console.log("usePeritagemData: Iniciando carregamento de dados");
      setLoading(true);
      setErrorMessage(null);
      
      // Verificar conexão antes de tentar carregar dados
      const isConnected = await verifyConnection();
      if (!isConnected) {
        setErrorMessage("Não foi possível verificar sua conexão. Tente novamente mais tarde.");
        setLoading(false);
        console.log("❌ Sem conexão verificada, saindo do loadData", Date.now());
        toast.error("Erro de conexão", {
          description: "Não foi possível conectar ao servidor. Verifique sua conexão."
        });
        return;
      }
      
      // Primeira etapa: carregar serviços disponíveis
      console.log("Carregando serviços disponíveis...");
      const loadedServices = await loadServices();
      console.log("✅ Serviços carregados:", loadedServices.length);
      
      // Segundo passo: carregar setor existente ou criar um novo
      if (!isEditing) {
        console.log("Criando novo setor com serviços carregados");
        const newDefaultSector = createDefaultSector(loadedServices);
        setDefaultSector(newDefaultSector);
        console.log("✅ Setor padrão criado");
      } else if (id) {
        console.log("Carregando setor existente com ID:", id);
        await fetchSector();
        console.log("✅ Setor existente carregado");
      }
      
      setDataReady(true);
      setLoading(false);
      console.log("usePeritagemData: 🔥 Dados carregados com sucesso", getLogInfo());
      console.log("✅ END: loadData", Date.now());
    } catch (error) {
      console.error("usePeritagemData: Erro ao carregar dados:", error);
      
      // Adicionado: 3 tentativas automáticas em caso de falha
      if (retryCount < 3) {
        console.log(`Tentativa ${retryCount + 1} de 3 para carregar dados...`);
        setRetryCount(prev => prev + 1);
        setTimeout(() => loadData(), 1000); // Tentar novamente após 1 segundo
        return;
      }
      
      setErrorMessage("Erro ao carregar dados. Tente novamente mais tarde.");
      setLoading(false);
      console.log("❌ Erro no loadData", Date.now());
      toast.error("Erro ao carregar dados", {
        description: "Não foi possível carregar os dados necessários."
      });
    }
  }, [isAuthenticated, authLoading, id, isEditing, retryCount, verifyConnection, loadServices, createDefaultSector, fetchSector, setDefaultSector, setDataReady, setErrorMessage, getLogInfo]);

  // Melhorado: efeito para disparar carregamento de dados com verificações aprimoradas
  useEffect(() => {
    console.log("🚀 useEffect para disparar loadData", Date.now(), {
      authLoading,
      isAuthenticated: !!isAuthenticated,
      servicesFetched,
      loadingTimeout
    });
    
    if (!authLoading && isAuthenticated && !servicesFetched && !loadingTimeout) {
      console.log("✅ Disparando loadData()", Date.now());
      loadData();
    } else if (!authLoading && !isAuthenticated) {
      setLoading(false);
      console.log("❌ Usuário não autenticado, impossível carregar dados");
    }
  }, [authLoading, isAuthenticated, loadData, servicesFetched, loadingTimeout]);

  // Logs para diagnóstico
  console.log("✅ Estado final:", {
    validDefaultSector: !!validDefaultSector,
    services: defaultServices.length,
    loading,
    dataReady,
    hasData: (!loading && servicesFetched && (!!validDefaultSector || !!sector)) || !!validDefaultSector
  });

  console.log("🚀 END: usePeritagemData return", Date.now());
  return {
    sector,
    defaultSector: validDefaultSector || defaultSector || null,
    loading,
    errorMessage,
    isEditing,
    services: defaultServices.length > 0 ? defaultServices : [],
    hasValidData: (!loading && servicesFetched && (!!validDefaultSector || !!sector)) || !!validDefaultSector,
    dataReady,
    setDataReady,
    validDefaultSector: validDefaultSector || defaultSector || null,
    defaultServices: defaultServices.length > 0 ? defaultServices : []
  };
}
