
import React, { useState, useEffect } from 'react';
import ConnectionErrorFallback from './fallback/ConnectionErrorFallback';
import { useConnectionAuth } from '@/hooks/useConnectionAuth';
import { Button } from './ui/button';
import { RefreshCw, Home, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface FallbackRootProps {
  children: React.ReactNode;
}

const FallbackRoot: React.FC<FallbackRootProps> = ({ children }) => {
  const { connectionStatus, handleRetryConnection } = useConnectionAuth();
  const navigate = useNavigate();
  const [retryCount, setRetryCount] = useState(0);
  const [showingManualFallback, setShowingManualFallback] = useState(false);
  
  // Monitor para detectar se a aplicação está funcionando corretamente
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    if (connectionStatus === 'offline') {
      // Após 3 reconexões falhas, mostrar opções adicionais
      if (retryCount >= 3 && !showingManualFallback) {
        timeout = setTimeout(() => {
          setShowingManualFallback(true);
          toast.error("Problemas persistentes de conexão", {
            description: "Estamos tendo dificuldades para conectar ao servidor."
          });
        }, 5000);
      }
    } else {
      setShowingManualFallback(false);
    }
    
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [connectionStatus, retryCount, showingManualFallback]);
  
  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    handleRetryConnection();
    toast.info("Tentando restabelecer conexão...");
  };
  
  const handleForceReload = () => {
    toast.info("Recarregando a aplicação...");
    window.location.reload();
  };
  
  const handleClearCache = () => {
    // Limpar cache do localStorage
    try {
      // Limpa apenas os dados de cache, preservando informações de autenticação
      const keysToPreserve = ['supabase.auth.token'];
      
      // Filtra as chaves que não estão na lista de preservação
      Object.keys(localStorage).forEach(key => {
        if (!keysToPreserve.includes(key)) {
          localStorage.removeItem(key);
        }
      });
      
      toast.success("Cache local limpo com sucesso");
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      console.error("Erro ao limpar cache:", error);
      toast.error("Erro ao limpar cache");
    }
  };
  
  if (connectionStatus === 'offline') {
    return (
      <ConnectionErrorFallback 
        onRetry={handleRetry}
        message="Não foi possível estabelecer conexão com o servidor. Verifique sua conexão com a internet ou tente novamente mais tarde."
      >
        {showingManualFallback && (
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-md">
            <div className="flex items-start mb-2">
              <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 mt-0.5" />
              <h3 className="font-medium text-amber-800">Opções adicionais de recuperação</h3>
            </div>
            <p className="text-sm text-amber-700 mb-3">
              Caso os problemas de conexão persistam, você pode tentar as seguintes opções:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Button 
                variant="outline" 
                onClick={handleForceReload} 
                className="border-amber-300 hover:bg-amber-100"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Forçar recarga
              </Button>
              <Button 
                variant="outline" 
                onClick={handleClearCache}
                className="border-amber-300 hover:bg-amber-100"
              >
                Limpar cache local
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/')}
                className="border-amber-300 hover:bg-amber-100 sm:col-span-2"
              >
                <Home className="h-4 w-4 mr-2" />
                Voltar para a página inicial
              </Button>
            </div>
          </div>
        )}
      </ConnectionErrorFallback>
    );
  }
  
  return <>{children}</>;
};

export default FallbackRoot;
