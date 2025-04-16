
import { Wifi, WifiOff, Loader2, RefreshCw, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useNavigate } from "react-router-dom";
import { checkSupabaseStatus, logAuthStatus, refreshAuthSession } from "@/integrations/supabase/client";

interface ConnectionStatusProps {
  status: 'checking' | 'online' | 'offline';
  onRetryConnection?: () => void;
  showDetails?: boolean;
}

export default function ConnectionStatus({ 
  status, 
  onRetryConnection,
  showDetails = false 
}: ConnectionStatusProps) {
  const [lastStatusChange, setLastStatusChange] = useState(Date.now());
  const [pingTime, setPingTime] = useState<number | null>(null);
  const [sessionStatus, setSessionStatus] = useState<'checking' | 'valid' | 'invalid'>('checking');
  const navigate = useNavigate();
  
  // Rastrear mudanças de status para animar a transição
  useEffect(() => {
    setLastStatusChange(Date.now());
  }, [status]);
  
  // Verificar a sessão quando o componente montar
  useEffect(() => {
    const checkSession = async () => {
      setSessionStatus('checking');
      const userId = await logAuthStatus();
      setSessionStatus(userId ? 'valid' : 'invalid');
    };
    
    checkSession();
  }, [status]); // Verificar novamente quando o status de conexão mudar
  
  // Quando estiver online, verificar o tempo de ping periodicamente
  useEffect(() => {
    if (status === 'online') {
      const checkPing = async () => {
        const startTime = Date.now();
        try {
          // Usar a função checkSupabaseStatus para verificar a conexão com Supabase
          const isConnected = await checkSupabaseStatus();
          
          if (isConnected) {
            setPingTime(Date.now() - startTime);
          } else {
            setPingTime(null);
          }
        } catch {
          setPingTime(null);
        }
      };
      
      checkPing();
      const interval = setInterval(checkPing, 60000); // Verificar a cada minuto
      return () => clearInterval(interval);
    } else {
      setPingTime(null);
    }
  }, [status]);
  
  const handleRefreshSession = async () => {
    setSessionStatus('checking');
    const refreshed = await refreshAuthSession();
    
    if (refreshed) {
      setSessionStatus('valid');
      if (onRetryConnection) {
        onRetryConnection();
      }
    } else {
      setSessionStatus('invalid');
      navigate('/login');
    }
  };
  
  const statusDisplay = () => {
    return (
      <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-all duration-300 ${
        status === 'online' ? 'bg-green-100 text-green-800' : 
        status === 'offline' ? 'bg-red-100 text-red-800' : 
        'bg-yellow-100 text-yellow-800'
      }`}>
        {status === 'online' ? (
          <>
            <Wifi className="h-3 w-3 mr-1" />
            Conectado
          </>
        ) : status === 'offline' ? (
          <>
            <WifiOff className="h-3 w-3 mr-1" />
            Desconectado
          </>
        ) : (
          <>
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            Verificando
          </>
        )}
      </div>
    );
  };
  
  return (
    <div className="flex items-center gap-2">
      {sessionStatus === 'invalid' && (
        <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 mr-1">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Sessão Inválida
        </div>
      )}
      
      {showDetails && pingTime ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              {statusDisplay()}
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Ping: {pingTime}ms</p>
              <p>Sessão: {sessionStatus === 'valid' ? 'Válida' : sessionStatus === 'invalid' ? 'Inválida' : 'Verificando'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        statusDisplay()
      )}
      
      {(status === 'offline' || (status === 'checking' && Date.now() - lastStatusChange > 5000)) && onRetryConnection && (
        <Button 
          variant="outline" 
          size="sm" 
          className="h-7 px-2 text-xs" 
          onClick={onRetryConnection}
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          Reconectar
        </Button>
      )}
      
      {sessionStatus === 'invalid' && (
        <Button 
          variant="secondary" 
          size="sm" 
          className="h-7 px-2 text-xs" 
          onClick={handleRefreshSession}
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          Renovar Sessão
        </Button>
      )}
    </div>
  );
}
