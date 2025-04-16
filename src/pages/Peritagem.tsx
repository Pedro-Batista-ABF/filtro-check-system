
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Plus, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import ConnectionStatus from '@/components/peritagem/ConnectionStatus';
import { checkConnectionHealth, ensureValidAuthentication } from '@/utils/connectionUtils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function Peritagem() {
  const navigate = useNavigate();
  const { isAuthenticated, refreshSession } = useAuth();
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
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
  }, []);
  
  const handleRetryConnection = async () => {
    setConnectionStatus('checking');
    setErrorMessage(null);
    
    try {
      // Tentar atualizar a sessão primeiro
      if (isAuthenticated) {
        await refreshSession();
      }
      
      // Verificar a conexão novamente
      const health = await checkConnectionHealth();
      setConnectionStatus(health.status === 'online' ? 'online' : 'offline');
      
      if (health.status !== 'online' || health.reason !== 'healthy') {
        setErrorMessage(`Problemas de conexão: ${health.reason}`);
      }
    } catch (error) {
      console.error("Erro ao reconectar:", error);
      setConnectionStatus('offline');
      setErrorMessage("Falha ao tentar reconectar.");
    }
  };
  
  return (
    <PageLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Peritagem</h1>
          <div className="flex items-center gap-4">
            <ConnectionStatus 
              status={connectionStatus} 
              onRetryConnection={handleRetryConnection} 
              showDetails={true}
            />
            <Button onClick={() => navigate('/peritagem/novo')}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Peritagem
            </Button>
          </div>
        </div>
        
        {errorMessage && (
          <Alert variant="destructive" className="bg-red-50 border-red-200">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Problema detectado</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
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
