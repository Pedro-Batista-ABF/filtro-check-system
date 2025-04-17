
import { useState, useEffect, useCallback } from "react";
import { Sector, Service } from "@/types";
import { useSectorFetch } from "./useSectorFetch";
import { useAuth } from "@/contexts/AuthContext";
import { useInitialSectorData } from "./useInitialSectorData";
import { useSectorLoadingState } from "./useSectorLoadingState";
import { useServiceDataFetching } from "./useServiceDataFetching";

export function usePeritagemData(id?: string) {
  console.log("🚀 START: usePeritagemData hook initialization", Date.now());
  const [loading, setLoading] = useState(true);
  const { sector, fetchSector } = useSectorFetch(id);
  const { isAuthenticated, loading: authLoading } = useAuth();
  const isEditing = !!id;
  const [validDefaultSector, setValidDefaultSector] = useState<Sector | null>(null);
  const [defaultServices, setDefaultServices] = useState<Service[]>([]);

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

  // Improved effect to ensure synchronization between defaultSector and validDefaultSector
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

  const loadData = useCallback(async () => {
    console.log("🚀 START: loadData", Date.now());
    if (authLoading || !isAuthenticated || loadingTimeout) {
      console.log("❌ Condições impediram loadData:", { 
        authLoading, 
        isAuthenticated: !!isAuthenticated, 
        loadingTimeout 
      });
      return;
    }
    
    try {
      console.log("usePeritagemData: Iniciando carregamento de dados");
      setLoading(true);
      setErrorMessage(null);
      
      const isConnected = await verifyConnection();
      if (!isConnected) {
        setErrorMessage("Não foi possível verificar sua autenticação. Tente fazer login novamente.");
        setLoading(false);
        console.log("❌ Sem conexão verificada, saindo do loadData", Date.now());
        return;
      }
      
      const loadedServices = await loadServices();
      console.log("✅ Serviços carregados:", loadedServices.length);
      
      if (!isEditing) {
        const newDefaultSector = createDefaultSector(loadedServices);
        setDefaultSector(newDefaultSector);
        console.log("usePeritagemData: Setor padrão criado");
      } else if (id) {
        await fetchSector();
        console.log("usePeritagemData: Setor existente carregado");
      }
      
      setDataReady(true);
      setLoading(false);
      console.log("usePeritagemData: 🔥 Dados carregados com sucesso", getLogInfo());
      console.log("✅ END: loadData", Date.now());
    } catch (error) {
      console.error("usePeritagemData: Erro ao carregar dados:", error);
      setErrorMessage("Erro ao carregar dados. Tente novamente mais tarde.");
      setLoading(false);
      console.log("❌ Erro no loadData", Date.now());
    }
  }, [isAuthenticated, authLoading, id, isEditing, loadingTimeout]);

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
    }
  }, [authLoading, isAuthenticated, loadData, servicesFetched, loadingTimeout]);

  // Logs para diagnóstico
  console.log("✅ validDefaultSector:", validDefaultSector);
  console.log("✅ services:", defaultServices);
  console.log("✅ loading:", loading);
  console.log("✅ dataReady:", dataReady);

  console.log("🚀 END: usePeritagemData return", Date.now());
  return {
    sector,
    defaultSector: validDefaultSector || defaultSector || null, // Adicionando fallback direto
    loading,
    errorMessage,
    isEditing,
    services: defaultServices.length > 0 ? defaultServices : [],
    hasValidData: (!loading && servicesFetched && (!!validDefaultSector || !!sector)) || !!validDefaultSector,
    dataReady,
    setDataReady,
    validDefaultSector: validDefaultSector || defaultSector || null, // Adicionando fallback direto
    defaultServices: defaultServices.length > 0 ? defaultServices : []
  };
}
