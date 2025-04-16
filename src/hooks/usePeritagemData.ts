
import { useState, useEffect, useCallback } from "react";
import { Sector, Service } from "@/types";
import { useSectorFetch } from "./useSectorFetch";
import { useAuth } from "@/contexts/AuthContext";
import { useInitialSectorData } from "./useInitialSectorData";
import { useSectorLoadingState } from "./useSectorLoadingState";
import { useServiceDataFetching } from "./useServiceDataFetching";

export function usePeritagemData(id?: string) {
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
    if (!dataReady) return;

    if (defaultSector && !isEditing) {
      setValidDefaultSector(defaultSector);
      // Garantir que services é um array válido
      const safeServices = Array.isArray(defaultSector.services) ? 
        defaultSector.services : [];
      setDefaultServices(safeServices);
    } else if (sector && isEditing) {
      setValidDefaultSector(sector);
      const safeServices = Array.isArray(sector.services) ? 
        sector.services : [];
      setDefaultServices(safeServices);
    }
  }, [defaultSector, sector, isEditing, dataReady]);

  const loadData = useCallback(async () => {
    if (authLoading || !isAuthenticated || loadingTimeout) {
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
        return;
      }
      
      const loadedServices = await loadServices();
      
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
    } catch (error) {
      console.error("usePeritagemData: Erro ao carregar dados:", error);
      setErrorMessage("Erro ao carregar dados. Tente novamente mais tarde.");
      setLoading(false);
    }
  }, [isAuthenticated, authLoading, id, isEditing, loadingTimeout]);

  useEffect(() => {
    if (!authLoading && isAuthenticated && !servicesFetched && !loadingTimeout) {
      loadData();
    }
  }, [authLoading, isAuthenticated, loadData, servicesFetched, loadingTimeout]);

  // Logs para diagnóstico
  console.log('✅ validDefaultSector:', validDefaultSector);
  console.log('✅ services:', defaultServices);
  console.log('✅ loading:', loading);
  console.log('✅ dataReady:', dataReady);

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
