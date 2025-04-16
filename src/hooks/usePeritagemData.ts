
import { useState, useEffect, useCallback } from "react";
import { Sector } from "@/types";
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

  return {
    sector,
    defaultSector,
    loading,
    errorMessage,
    isEditing,
    services: [],  // This will be filled by useServicesManagement
    hasValidData: (!loading && servicesFetched) || !!defaultSector || !!sector,
    dataReady,
    setDataReady
  };
}
