
import { useState, useEffect } from 'react';
import { toast } from "sonner";
import { Sector } from '@/types';

interface LoadingStateProps {
  loading: boolean;
  authLoading: boolean;
  isAuthenticated: boolean;
  loadStartTime: number;
  id?: string;
}

export function useSectorLoadingState({
  loading,
  authLoading,
  isAuthenticated,
  loadStartTime,
  id
}: LoadingStateProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    
    if (!isAuthenticated) {
      console.error("useSectorLoadingState: Usuário não autenticado");
      setErrorMessage("Você precisa estar logado para acessar esta página");
      return;
    }
  }, [isAuthenticated, authLoading]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.warn("useSectorLoadingState: Timeout de carregamento atingido após 8s");
        setLoadingTimeout(true);
        toast.warning("Usando dados padrão", {
          description: "O carregamento excedeu o tempo limite. Alguns dados estão usando valores padrão."
        });
      }
    }, 8000);

    return () => clearTimeout(timeoutId);
  }, [loading]);

  const getLogInfo = () => ({
    tempoDecorrido: `${Date.now() - loadStartTime}ms`,
    isEditing: !!id,
    loading,
    errorMessage
  });

  return {
    errorMessage,
    setErrorMessage,
    loadingTimeout,
    setLoadingTimeout,
    getLogInfo
  };
}
