
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

  // Verificação de timeout global
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.warn("usePeritagemData: Timeout de carregamento atingido após 10s");
        setLoading(false);
        setErrorMessage("Tempo de carregamento excedido. Por favor, atualize a página.");
      }
    }, 10000);

    return () => clearTimeout(timeoutId);
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

  // Carregar dados iniciais
  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) return;
    
    const loadData = async () => {
      try {
        console.log("usePeritagemData: Iniciando carregamento de dados");
        setLoading(true);
        setErrorMessage(null);
        
        // Carregar serviços primeiro
        console.log("usePeritagemData: Buscando serviços");
        const loadedServices = await fetchDefaultServices();
        console.log(`usePeritagemData: ${loadedServices.length} serviços carregados`);
        
        // Verificar se temos serviços válidos
        if (!Array.isArray(loadedServices) || loadedServices.length === 0) {
          console.warn("usePeritagemData: Não foram encontrados serviços");
          setErrorMessage("Não foram encontrados serviços disponíveis.");
          setLoading(false);
          return;
        }
        
        // Criar setor padrão se necessário
        if (!isEditing) {
          const newDefaultSector = getDefaultSector(loadedServices);
          setDefaultSector(newDefaultSector);
          console.log("usePeritagemData: Setor padrão criado");
        } else if (id) {
          // Buscar setor existente
          await fetchSector();
          console.log("usePeritagemData: Setor existente carregado");
        }
        
        setDataReady(true);
        setLoading(false);
        console.log(`usePeritagemData: 🔥 Dados carregados com sucesso em ${Date.now() - loadStartTime}ms`);
      } catch (error) {
        console.error("usePeritagemData: Erro ao carregar dados:", error);
        setErrorMessage("Erro ao carregar dados. Tente novamente mais tarde.");
        setLoading(false);
      }
    };
    
    loadData();
    
    return () => {
      console.log("usePeritagemData: Limpando recursos");
    };
  }, [isAuthenticated, authLoading, id, isEditing]);

  // Verificação de dados válidos
  const hasValidServices = services && Array.isArray(services) && services.length > 0;
  
  return {
    sector,
    defaultSector: defaultSector || (hasValidServices ? getDefaultSector(services) : null),
    loading,
    errorMessage: errorMessage || servicesError,
    isEditing,
    services,
    hasValidData: !loading && !errorMessage && hasValidServices && (!!defaultSector || !!sector),
    dataReady
  };
}
