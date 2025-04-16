
import { Wifi, WifiOff, Loader2, RefreshCw, AlertTriangle, ShieldCheck, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { 
  checkSupabaseStatus, 
  logAuthStatus, 
  refreshAuthSession,
  performFullConnectivityTest 
} from "@/utils/connectionUtils";
import { toast } from "sonner";

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
  const [sessionStatus, setSessionStatus] = useState<'checking' | 'valid' | 'invalid' | 'expiring'>('checking');
  const [isRunningDiagnostic, setIsRunningDiagnostic] = useState(false);
  const navigate = useNavigate();
  
  // Rastrear mudanças de status para animar a transição
  useEffect(() => {
    setLastStatusChange(Date.now());
  }, [status]);
  
  // Verificar a sessão quando o componente montar
  useEffect(() => {
    const checkSession = async () => {
      setSessionStatus('checking');
      try {
        const userId = await logAuthStatus();
        
        if (!userId) {
          setSessionStatus('invalid');
          return;
        }
        
        // Verificar se o token expira em breve
        try {
          const { data } = await supabase.auth.getSession();
          if (data.session) {
            const expiresAt = data.session.expires_at * 1000;
            const now = Date.now();
            const timeToExpire = expiresAt - now;
            
            if (timeToExpire < 300000) { // 5 minutos
              setSessionStatus('expiring');
            } else {
              setSessionStatus('valid');
            }
          }
        } catch (error) {
          console.error("Erro ao verificar expiração do token:", error);
          setSessionStatus('valid'); // Assumir válido se pelo menos o userId está ok
        }
      } catch (error) {
        console.error("Erro ao verificar sessão:", error);
        setSessionStatus('invalid');
      }
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
      toast.success("Sessão renovada com sucesso");
      if (onRetryConnection) {
        onRetryConnection();
      }
    } else {
      setSessionStatus('invalid');
      toast.error("Não foi possível renovar a sessão", {
        description: "Por favor, faça login novamente."
      });
      navigate('/login');
    }
  };
  
  const handleRunDiagnostic = async () => {
    setIsRunningDiagnostic(true);
    toast.info("Executando diagnóstico completo...");
    
    try {
      const results = await performFullConnectivityTest();
      
      if (results.success) {
        toast.success("Diagnóstico completo", {
          description: "Todos os testes passaram com sucesso."
        });
      } else {
        const issues = results.errors?.join(", ") || "Problemas de conexão detectados";
        toast.error("Diagnóstico concluído com erros", {
          description: issues
        });
        
        // Se há problemas de autenticação, tentar corrigir
        if (!results.authenticated || results.tokenValid === false) {
          await handleRefreshSession();
        }
      }
    } catch (error) {
      console.error("Erro ao executar diagnóstico:", error);
      toast.error("Erro ao executar diagnóstico", {
        description: "Ocorreu um erro inesperado durante o diagnóstico."
      });
    } finally {
      setIsRunningDiagnostic(false);
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
  
  const sessionStatusDisplay = () => {
    if (sessionStatus === 'valid') {
      return (
        <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-1">
          <ShieldCheck className="h-3 w-3 mr-1" />
          Autenticado
        </div>
      );
    } else if (sessionStatus === 'invalid') {
      return (
        <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 mr-1">
          <ShieldAlert className="h-3 w-3 mr-1" />
          Não Autenticado
        </div>
      );
    } else if (sessionStatus === 'expiring') {
      return (
        <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 mr-1">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Sessão Expirando
        </div>
      );
    }
    
    return null;
  };
  
  return (
    <div className="flex items-center gap-2">
      {sessionStatus !== 'checking' && sessionStatusDisplay()}
      
      {showDetails && pingTime ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              {statusDisplay()}
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Ping: {pingTime}ms</p>
              <p>Sessão: {
                sessionStatus === 'valid' ? 'Válida' : 
                sessionStatus === 'invalid' ? 'Inválida' : 
                sessionStatus === 'expiring' ? 'Expirando' : 
                'Verificando'
              }</p>
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
          disabled={isRunningDiagnostic}
        >
          <RefreshCw className={`h-3 w-3 mr-1 ${isRunningDiagnostic ? 'animate-spin' : ''}`} />
          Reconectar
        </Button>
      )}
      
      {showDetails && (
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs"
          onClick={handleRunDiagnostic}
          disabled={isRunningDiagnostic}
        >
          {isRunningDiagnostic ? (
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
          ) : (
            <AlertTriangle className="h-3 w-3 mr-1" />
          )}
          Diagnóstico
        </Button>
      )}
      
      {(sessionStatus === 'invalid' || sessionStatus === 'expiring') && (
        <Button 
          variant="secondary" 
          size="sm" 
          className="h-7 px-2 text-xs" 
          onClick={handleRefreshSession}
          disabled={isRunningDiagnostic}
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          Renovar Sessão
        </Button>
      )}
    </div>
  );
}
