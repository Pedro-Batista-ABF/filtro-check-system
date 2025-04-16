import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Plus, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import ConnectionStatus from '@/components/peritagem/ConnectionStatus';
import { checkConnectionHealth, ensureValidAuthentication, runConnectionDiagnostics, performFullConnectivityTest } from '@/utils/connectionUtils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAuthRefreshOnRequest } from '@/hooks/useAuthRefreshOnRequest';
import { toast } from 'sonner';

export function Peritagem() {
  const navigate = useNavigate();
  const { isAuthenticated, refreshSession } = useAuth();
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isRunningDiagnostic, setIsRunningDiagnostic] = useState(false);
  const { executeWithAuthCheck, forceAuthCheck, connectionHealth } = useAuthRefreshOnRequest();
  
  // Verificar conexão e autenticação ao carregar a página
  useEffect(() => {
    const verifyConnection = async () => {
      setConnectionStatus('checking');
      try {
        // Verificar saúde da conexão
        const health = await checkConnectionHealth();
        setConnectionStatus(health.status === 'online' ? 'online' : 'offline');
        
        // Se estiver online mas com problemas de autenticação
        if (health.status === 'online' && 
           (health.reason === 'no-session' || 
            health.reason === 'invalid-token' || 
            health.reason === 'session-expiring')) {
          console.log(`Problema de autenticação detectado: ${health.reason}`);
          
          // Tentar refresh da sessão
          const authValid = await ensureValidAuthentication();
          if (!authValid) {
            setErrorMessage("Sessão inválida ou expirada. Por favor, faça login novamente.");
          }
        }
      } catch (error) {
        console.error("Erro ao verificar conexão:", error);
        setConnectionStatus('offline');
        setErrorMessage("Erro ao verificar conexão com o servidor.");
      }
    };
    
    verifyConnection();
    
    // Configurar verificação periódica
    const intervalId = setInterval(async () => {
      try {
        const health = await checkConnectionHealth();
        setConnectionStatus(health.status === 'online' ? 'online' : 'offline');
        
        // Se status mudou para offline, exibir mensagem
        if (health.status !== 'online' && connectionStatus === 'online') {
          toast.error("Conexão perdida", {
            description: "A conexão com o servidor foi perdida. Tentando reconectar..."
          });
        }
        
        // Se status mudou para online, limpar mensagem de erro
        if (health.status === 'online' && connectionStatus === 'offline') {
          setErrorMessage(null);
          toast.success("Conexão restaurada", {
            description: "A conexão com o servidor foi restabelecida."
          });
        }
      } catch (error) {
        console.error("Erro na verificação periódica:", error);
      }
    }, 30000); // Verificar a cada 30 segundos
    
    return () => clearInterval(intervalId);
  }, [connectionStatus]);
  
  const handleRetryConnection = async () => {
    setConnectionStatus('checking');
    setErrorMessage(null);
    setIsRunningDiagnostic(true);
    
    try {
      // Exibir toast informativo
      toast.info("Verificando conexão", {
        description: "Executando diagnóstico e tentando reconectar..."
      });
      
      // Tentar atualizar a sessão primeiro
      if (isAuthenticated) {
        await refreshSession();
      }
      
      // Executar diagnóstico completo
      const diagnostic = await performFullConnectivityTest();
      
      // Verificar a conexão novamente
      const health = await checkConnectionHealth();
      setConnectionStatus(health.status === 'online' ? 'online' : 'offline');
      
      if (health.status !== 'online' || health.reason !== 'healthy') {
        if (diagnostic.internetConnected && !diagnostic.supabaseConnected) {
          setErrorMessage("Problemas de conexão: O servidor Supabase está indisponível.");
        } else if (!diagnostic.internetConnected) {
          setErrorMessage("Problemas de conexão: Sem acesso à internet.");
        } else if (diagnostic.supabaseConnected && !diagnostic.authenticated) {
          setErrorMessage("Problemas de autenticação: Sua sessão está inválida.");
          toast.error("Sessão inválida", {
            description: "Por favor, faça login novamente."
          });
          navigate('/login');
        } else {
          setErrorMessage(`Problemas de conexão: ${health.reason}`);
        }
      } else {
        // Se tudo estiver ok, limpar mensagem de erro
        setErrorMessage(null);
        toast.success("Conexão verificada com sucesso", {
          description: "Todos os sistemas estão funcionando normalmente."
        });
      }
    } catch (error) {
      console.error("Erro ao reconectar:", error);
      setConnectionStatus('offline');
      setErrorMessage("Falha ao tentar reconectar.");
      toast.error("Erro inesperado", {
        description: "Ocorreu um erro ao tentar reconectar."
      });
    } finally {
      setIsRunningDiagnostic(false);
    }
  };
  
  const handleForceReconnect = async () => {
    toast.info("Forçando reconexão", {
      description: "Limpando cache e reconectando ao servidor..."
    });
    
    // Limpar qualquer cache em localStorage, exceto dados de autenticação
    Object.keys(localStorage).forEach(key => {
      if (!key.includes('supabase.auth')) {
        localStorage.removeItem(key);
      }
    });
    
    // Forçar verificação de autenticação
    const authOk = await forceAuthCheck();
    
    if (authOk) {
      toast.success("Reconexão concluída", {
        description: "Conexão e autenticação verificadas com sucesso."
      });
      setConnectionStatus('online');
      setErrorMessage(null);
    } else {
      toast.error("Problemas ao reconectar", {
        description: "Tente fazer login novamente para resolver o problema."
      });
    }
  };
  
  const HeaderExtra = (
    <ConnectionStatus 
      status={connectionStatus} 
      onRetryConnection={handleRetryConnection} 
      showDetails={true}
    />
  );
  
  return (
    <PageLayout HeaderExtra={HeaderExtra}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Peritagem</h1>
          <Button onClick={() => navigate('/peritagem/novo')}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Peritagem
          </Button>
        </div>
        
        {errorMessage && (
          <Alert variant="destructive" className="bg-red-50 border-red-200">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Problema detectado</AlertTitle>
            <AlertDescription>
              <div className="flex flex-col gap-2">
                <p>{errorMessage}</p>
                <div className="flex gap-2 mt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleRetryConnection}
                    disabled={isRunningDiagnostic}
                  >
                    <RefreshCw className={`h-4 w-4 mr-1 ${isRunningDiagnostic ? 'animate-spin' : ''}`} />
                    Verificar novamente
                  </Button>
                  <Button 
                    variant="secondary" 
                    size="sm"
                    onClick={handleForceReconnect}
                    disabled={isRunningDiagnostic}
                  >
                    Forçar Reconexão
                  </Button>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}
        
        <div className="p-4 border rounded-md bg-gray-50">
          <p>Lista de perítagems será exibida aqui.</p>
        </div>
      </div>
    </PageLayout>
  );
}

export default Peritagem;
