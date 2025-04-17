
import React, { useState, useEffect } from 'react';
import ConnectionErrorFallback from './fallback/ConnectionErrorFallback';
import { useConnectionAuth } from '@/hooks/useConnectionAuth';
import { Button } from './ui/button';
import { RefreshCw, Home, AlertTriangle, Database, Wifi } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { checkSupabaseConnection, checkInternetConnection, runConnectionDiagnostics } from '@/utils/connectionUtils';
import { supabase } from '@/integrations/supabase/client';

interface FallbackRootProps {
  children: React.ReactNode;
}

const FallbackRoot: React.FC<FallbackRootProps> = ({ children }) => {
  const navigate = useNavigate();
  const [retryCount, setRetryCount] = useState(0);
  const [showingManualFallback, setShowingManualFallback] = useState(false);
  const [diagnosisCompleted, setDiagnosisCompleted] = useState(false);
  const [diagnosisResults, setDiagnosisResults] = useState({
    internet: false,
    supabase: false
  });
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [isCheckingConnection, setIsCheckingConnection] = useState(false);
  
  // Verificar conexão ao carregar o componente
  useEffect(() => {
    const checkConnection = async () => {
      if (isCheckingConnection) return;
      
      setIsCheckingConnection(true);
      setConnectionStatus('checking');
      
      try {
        // Primeiro testar conexão com internet
        const hasInternet = await checkInternetConnection();
        if (!hasInternet) {
          setConnectionStatus('offline');
          setIsCheckingConnection(false);
          return;
        }
        
        // Depois testar conexão com Supabase usando URL pública (sem autenticação)
        const isConnected = await checkSupabaseConnection();
        setConnectionStatus(isConnected ? 'online' : 'offline');
        
        // Em caso de falha, registrar diagnóstico no console
        if (!isConnected) {
          console.warn("FallbackRoot: Falha na conexão com Supabase");
          runConnectionDiagnostics();
        }
      } catch (error) {
        console.error("FallbackRoot: Erro ao verificar conexão:", error);
        setConnectionStatus('offline');
      } finally {
        setIsCheckingConnection(false);
      }
    };
    
    checkConnection();
    
    // Verificar conexão periodicamente
    const connectionInterval = setInterval(checkConnection, 30000);
    return () => clearInterval(connectionInterval);
  }, [isCheckingConnection]);
  
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
  
  const handleRetry = async () => {
    setRetryCount(prev => prev + 1);
    setConnectionStatus('checking');
    
    toast.info("Tentando restabelecer conexão...");
    
    try {
      // Verificar internet primeiro
      const hasInternet = await checkInternetConnection();
      if (!hasInternet) {
        toast.error("Sem conexão com a internet", {
          description: "Verifique sua conexão de rede e tente novamente."
        });
        setConnectionStatus('offline');
        return;
      }
      
      // Tentar conexão com Supabase
      const isConnected = await checkSupabaseConnection();
      
      if (isConnected) {
        toast.success("Conexão estabelecida", {
          description: "A conexão com o servidor foi restaurada."
        });
        setConnectionStatus('online');
        
        // Verificar se há sessão ativa
        const { data } = await supabase.auth.getSession();
        if (!data.session) {
          // Redirecionar para login se não houver sessão
          navigate('/login');
        }
      } else {
        toast.error("Falha na conexão", {
          description: "Não foi possível estabelecer conexão com o servidor."
        });
        setConnectionStatus('offline');
      }
    } catch (error) {
      console.error("Erro ao tentar reconectar:", error);
      toast.error("Erro na reconexão", {
        description: "Ocorreu um erro inesperado ao tentar reconectar."
      });
      setConnectionStatus('offline');
    }
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

  const handleRunDiagnosis = async () => {
    toast.info("Executando diagnóstico de conexão...");
    
    // Verificar conexão de internet
    const hasInternet = await checkInternetConnection();
    
    // Verificar conexão com Supabase
    const hasSupabase = await checkSupabaseConnection();
    
    setDiagnosisResults({
      internet: hasInternet,
      supabase: hasSupabase
    });
    
    setDiagnosisCompleted(true);
    
    if (hasInternet && !hasSupabase) {
      toast.warning("Problema detectado", {
        description: "Você tem conexão com a internet, mas o servidor Supabase parece estar indisponível."
      });
    } else if (!hasInternet) {
      toast.error("Problema de conexão", {
        description: "Não foi detectada conexão com a internet. Verifique sua rede."
      });
    } else if (hasInternet && hasSupabase) {
      toast.success("Diagnóstico concluído", {
        description: "Todas as conexões estão funcionando. Tentando reconectar..."
      });
      handleRetry();
    }
  };
  
  const handleGoToLogin = () => {
    navigate('/login');
  };
  
  if (connectionStatus === 'offline') {
    return (
      <ConnectionErrorFallback 
        onRetry={handleRetry}
        message="Não foi possível estabelecer conexão com o servidor. Verifique sua conexão com a internet ou tente novamente mais tarde."
        showHomeButton={true}
        showBackButton={true}
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
            
            {!diagnosisCompleted ? (
              <Button 
                variant="secondary" 
                onClick={handleRunDiagnosis} 
                className="w-full mb-2"
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Executar diagnóstico
              </Button>
            ) : (
              <div className="mb-3 p-3 bg-white rounded border border-gray-200">
                <h4 className="text-sm font-medium mb-2">Resultado do diagnóstico:</h4>
                <ul className="space-y-1 text-sm">
                  <li className="flex items-center">
                    <span className={`w-4 h-4 rounded-full mr-2 ${diagnosisResults.internet ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    <Wifi className="h-4 w-4 mr-1" />
                    Conexão com Internet: {diagnosisResults.internet ? 'OK' : 'Falhou'}
                  </li>
                  <li className="flex items-center">
                    <span className={`w-4 h-4 rounded-full mr-2 ${diagnosisResults.supabase ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    <Database className="h-4 w-4 mr-1" />
                    Conexão com Servidor: {diagnosisResults.supabase ? 'OK' : 'Falhou'}
                  </li>
                </ul>
              </div>
            )}
            
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
                variant="secondary"
                onClick={handleGoToLogin}
                className="sm:col-span-2"
              >
                Ir para o login
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
